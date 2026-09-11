# Distanterra API

Backend REST API for the Distanterra landing page (`distanterra-front`). Built with
[NestJS](https://nestjs.com/) + TypeScript, [TypeORM](https://typeorm.io/) and PostgreSQL.

Repository: https://github.com/octaM3/distanterra-back

## Features

- Secret admin login (JWT, 1 hour session) protected by an httpOnly cookie. There is
  **no visible/public login route** in the frontend and the login endpoint path itself
  is not `/auth/login` — it's a random, configurable path (`ADMIN_LOGIN_PATH`), so it
  can't be discovered by guessing common routes.
- No public registration endpoint. The single admin account is created with a CLI
  script (`npm run db:seed-admin`), never over HTTP.
- Rate limiting via `@nestjs/throttler`, applied globally to every endpoint
  (`THROTTLE_LIMIT` per `THROTTLE_TTL_SECONDS`, generous default), plus a separate,
  much stricter limit on the login endpoint specifically (`LOGIN_THROTTLE_LIMIT` per
  `LOGIN_THROTTLE_TTL_SECONDS`) to slow down brute-force password guessing.
- CRUD (ABM) for:
  - **Comments/testimonials** (client name, photo, comment) — soft delete.
  - **Images/logos** (partner logos shown at the bottom of the landing page) — hard
    delete (file + row removed together).
  - **Experiences** (title, optional location, dynamic rich description made of text
    and list blocks) — soft delete.
  - **Gallery photos** (paginated public listing, display order) — hard delete (file
    + row removed together), server-side optimized on upload (see below).
- **Contact messages**: public form (footer + `/contacto`) posts to `POST /contact`,
  no auth required. Admin panel lists them, marks as read (unread-count badge) and
  deletes (hard delete, no soft-delete for this resource). Abuse protections on the
  public endpoint:
  - Dedicated rate limit, stricter than the global default: `CONTACT_THROTTLE_LIMIT`
    submissions per `CONTACT_THROTTLE_TTL_SECONDS` per IP (default: **1 every 10 min**).
  - Honeypot field (`website` in the DTO): invisible to real users in the frontend
    form; if it comes back non-empty, the request is silently accepted (fake success
    response) without touching the database, so bots don't learn they were caught.
  - Per-email cooldown: a second message from the same email address (case-insensitive)
    within `CONTACT_EMAIL_COOLDOWN_HOURS` (default: **24h**) is rejected with `429`.
- Every admin-editable piece of content that has copy is **bilingual** (`_es` / `_en`
  columns), matching the frontend's i18n setup.
- Uploaded images are stored on local disk (`UPLOADS_DIR`) and served statically at
  `/uploads/...`, which fits the "everything on one Hostinger VPS" deployment target.
  Upload size is capped at `MAX_UPLOAD_SIZE_BYTES` (default **6MB**), enforced by
  Multer on every image upload endpoint (comments, images/logos, gallery) — configurable
  via `.env`, not hardcoded.
- Gallery photos are optimized on upload with `sharp` (`common/utils/image-optimizer.util.ts`):
  resized to fit within 1920×1920 (aspect ratio preserved, never upscaled) and
  recompressed as WebP, so heavy camera-original photos never get served as-is.
  SVG/GIF are stored untouched. Comments and logos are stored as uploaded, without
  this optimization pass.
- Database schema is plain, versioned SQL files under [`sql/`](./sql), no ORM
  migrations magic — run once with `npm run db:init`.
- **Mining logistics campaign management** (internal admin tool, no public endpoints):
  - **Companies**: client companies for which campaigns are organized — soft delete.
  - **Stock categories**: a small ABM (Carpas, Vehículos, Iluminación, Herramientas,
    etc.) used to classify the stock catalog, referenced by FK (`category_id`) — no
    free-text category field.
  - **Stock catalog**: Distanterra's own equipment (tents, trucks, lights, specific
    tools) with a total quantity, unit, and independent `price_per_day` /
    `price_per_month` (a paid item can have one, the other, or both at once; neither
    set means it's free, e.g. cutlery). Available quantity is computed on the fly,
    never stored — see the locking model under Campaigns below, since what counts as
    "locked" depends on whether a date range is given.
  - **Vehicles**: rented from third parties for campaigns. Unlike the stock catalog,
    each vehicle is a unique unit identified by `license_plate` (unique) — no quantity,
    it's either assigned to a campaign or it isn't. Independent `price_per_day` /
    `price_per_month` (a vehicle can have one or both). There's no separate "full
    campaign" price: to charge for the whole campaign, assign the vehicle with the
    assignment's date range equal to the campaign's own range (`start_date`/`end_date`)
    — the cost calc (see below) is the same either way, it's just that the day count
    happens to cover the entire campaign. Availability follows the same locking model
    as stock (see Campaigns below): a vehicle is locked only for the date range(s) it's
    actually assigned to, not for an entire campaign's lifetime. The catalog list/detail
    (`isAvailable`/`lockedInCampaignName`) reflects usage **today** specifically — a
    vehicle assigned to a campaign that hasn't started yet still shows as available,
    with `nextUseDate`/`nextUseCampaignName` telling you when it's next due to be used
    (`getUsageByVehicle` in `vehicles.service.ts`). This is separate from (and less
    conservative than) the guard on deleting a vehicle, which still blocks on any
    non-finished campaign assignment regardless of date.
  - **Pack animals** (`campaign_pack_animals`, "tracción a sangre" — horses, mules,
    donkeys, etc.) — hired from third parties, not owned by Distanterra, and **not a
    catalog at all**: there's no `pack_animals` table to manage separately. The
    `animal_type` (free text, e.g. "Caballo", "Burro", "Mula"), `price_per_day` and
    `tax_percentage` are typed directly into the assignment form when adding an animal
    to a campaign, exactly like guides (see below) — there's no `/schedule` endpoint,
    no overlap check against other campaigns, no quantity limit: an assignment is just
    an `animal_type`, a `quantity` (>= 1, unbounded) and a date range within the
    campaign. The cost formula and shape are identical to guides — reuses
    `computeGuideCost` from `campaigns.util.ts` as-is: `quantity * price_per_day *
    days * (1 + tax_percentage / 100)`, with an optional `manual_cost` override.
  - **Guides** (`campaign_guides`, "baqueanos") — hired from third parties, not a
    catalog at all: there's no list of individual guides to manage, nor any global
    price/tax settings page. `price_per_day` and `tax_percentage` are typed directly
    into the assignment form when adding guides to a campaign. Assigning guides to a
    campaign (`campaign_guides`) is a `quantity` (>= 1) plus `price_per_day` /
    `tax_percentage` (both optional) plus a `start_date`/`end_date` within the
    campaign's own range (validated the same way as every other resource, via
    `validateAssignmentDateRange`) — but unlike stock/vehicles, **that range only
    feeds the cost formula, it doesn't gate availability** (no overlap/locking check):
    `quantity * price_per_day * days * (1 + tax_percentage / 100)` (`computeGuideCost`
    in `campaigns.util.ts`). An optional `manual_cost` still overrides that
    calculation per assignment, same as every other resource type, for one-off
    exceptions.
  - **Campaigns**: created for a company before they start (`start_date`/`end_date`).
    Every assignment of any resource type (stock, vehicle, pack animal, or guide)
    carries its own `start_date`/`end_date` (required, must fall within the campaign's
    own date range, validated by the shared `validateAssignmentDateRange` in
    `campaigns.util.ts`) — an item doesn't have to be rented for the campaign's full
    duration. For every resource type the cost is computed from that assignment's own
    day count, not the campaign's. **Locking is scoped to that same date range, not to
    the campaign's lifetime** (this applies to stock and vehicles only — pack animals
    and guides have no locking at all, since they aren't a limited catalog):
    assigning a tent for 10 of a
    campaign's 40 days only blocks it for those 10 days — it can be assigned to a
    different campaign for the other 30 (`getAvailableQuantity` in
    `stock-items.service.ts` / `isAvailable` in `vehicles.service.ts`, both doing a
    date-range overlap check against `campaign_stock_items`/`campaign_vehicles` rows
    of campaigns that aren't finished nor soft-deleted, used when actually
    saving an assignment). The catalog dropdown in the assignment modal never disables
    an item/vehicle for being "in use elsewhere" — instead, once one is picked,
    `GET /admin/stock-items/:id/schedule` / `GET /admin/vehicles/:id/schedule` return
    its other current assignments (date ranges, quantity for stock) so the modal's
    calendar can grey out the specific days that are already taken, letting the admin
    pick free dates instead of being blocked outright. The plain `GET /admin/stock-items`
    and `GET /admin/vehicles` list responses still report the conservative
    "assigned to any non-finished campaign at all, regardless of dates" figure — used
    by the standalone catalog pages and by the guards that block lowering a stock
    item's `totalQuantity` or deleting an item/vehicle that's assigned anywhere. A
    campaign being manually finished (`POST .../finish`) still releases everything at
    once regardless of dates. The end date can be extended while the campaign isn't
    finished (`PUT .../extend`), which also appends an automatic entry to the activity
    log. Status (`planificada` / `en_curso` / `finalizada`) is computed from the dates
    and `finished_at`, never stored, and the detail response also returns the
    campaign's total `durationDays` (inclusive day count). Stock and vehicle
    assignments snapshot both `price_per_day` and `price_per_month` from their
    catalog at assignment time (so later catalog price changes don't affect it); pack
    animal and guide assignments have no catalog to snapshot from — `price_per_day`
    and `tax_percentage` are just whatever was typed into the form. **Cost is
    calculated automatically by default**: for stock/vehicles, whole 30-day blocks
    are billed at `price_per_month` and the leftover days at `price_per_day` (e.g. 40
    days = 1 month + 10 days); if only one of the two prices is loaded, that one is
    used alone (rounding the day count up to a full month when only `price_per_month`
    is available); with neither loaded the cost is 0 — see `computeBlendedUnitCost` /
    `computeStockItemCost` / `computeVehicleCost` in `campaigns.util.ts`. Pack animals
    and guides use their own day-and-tax formula instead — see the Guides bullet
    above (`computeGuideCost`). Every assignment (of any resource type) also has an
    optional `manual_cost` (nullable numeric): when set, it replaces the automatic
    calculation as the assignment's final `cost` outright — the UI shows the automatic
    figure as a recommendation, not a constraint, and the admin can type any other
    total. Stock assignments additionally support an explicit `no_cost` override
    (forces the cost to 0 regardless of `manual_cost` or the catalog prices, e.g. for
    items lent for free) — `no_cost` always wins over `manual_cost` when both are
    set. Vehicles, pack animals and guides don't have `no_cost` (an assignment given
    away for free is simpler to model as an empty `manual_cost` of `0`).
  - **Extra expenses**: ad-hoc costs that come up during a campaign (e.g. a food run),
    with an optional invoice photo upload, itemized and totaled per campaign and per
    month. Categorized by an optional `category_id` FK into the same `stock_categories`
    catalog used by the stock module — no free-text category field. Also has two
    optional invoice-detail fields: `invoice_type` (a fixed AFIP-letter catalog —
    `Factura A/B/C/E/T/M`, enforced by a DB `CHECK` and `@IsIn` in the DTO, see
    `INVOICE_TYPES` in `campaign-expense.entity.ts`) and `business_name` (free text).
  - **Activity log**: free-text, dated entries admins add during a campaign to keep a
    running log of what was coordinated/done.
  - **Excel export** (`GET .../export`, via `exceljs`): one workbook per campaign with
    a summary sheet, itemized assigned stock (cost included even when `no_cost`),
    itemized assigned vehicles, itemized assigned guides, itemized assigned pack
    animals, itemized extra expenses (with a per-month subtotal), and the activity log
    sorted by date.
- **Points of interest** (`puntos_interes`, internal admin tool, no public endpoints):
  CRUD for markers on the frontend's interactive mountain map (`admin/puntos-interes`,
  all endpoints behind `JwtAuthGuard`). Each point has a `nombre`, optional `telefono`
  and `comentario` (free text), a `categoria` (`refugio` / `mirador` / `agua` /
  `peligro` / `campamento` — fixed catalog, enforced by a DB `CHECK` and `@IsIn` in the
  DTO, see `CATEGORIAS_PUNTO_INTERES` in `punto-interes.entity.ts`) that picks which
  icon the frontend renders, and `latitude`/`longitude` (validated with `@IsLatitude`/
  `@IsLongitude`). `GET /admin/puntos-interes` returns the full list for painting
  markers; the frontend fetches per-point detail (`telefono`/`comentario`) lazily on
  `GET /admin/puntos-interes/:id` only when a marker's popup is opened. Hard delete
  (no soft-delete: a removed point is just gone, no audit trail needed for this data).

## Tech stack

- Node.js >= 20 — developed/tested with **v22.23.1** (see `engines` in `package.json`).
- NestJS 11, TypeORM 0.3, PostgreSQL (`pg` driver) — developed/tested with
  **PostgreSQL 18.6**. Use the same major version on the VPS to avoid surprises.
- `passport-jwt` + `@nestjs/jwt` for authentication, `bcrypt` for password hashing.
- `class-validator` / `class-transformer` for request validation.
- `helmet`, `cookie-parser`, `@nestjs/throttler` for baseline security hardening.
- `sharp` for server-side image resizing/compression (gallery uploads).
- `exceljs` for generating per-campaign Excel reports.

## Project layout

```
distanterra-back/
├── sql/                     # Raw SQL DDL, run in filename order
├── scripts/
│   ├── init-db.ts           # Runs every sql/*.sql file against the configured DB
│   ├── reset-db.ts          # Wipes and reinitializes the schema from scratch (--yes required)
│   ├── seed-admin.ts        # Creates/updates the single admin account
│   └── seed-experiences.ts  # One-off import of the original hardcoded experiences
├── src/
│   ├── auth/                # Login (hidden path), JWT strategy/guard
│   ├── comments/             # Testimonials ABM
│   ├── images/               # Logos ABM
│   ├── experiences/          # Experiences ABM
│   ├── gallery/               # Gallery photos ABM (paginated public listing)
│   ├── contact-messages/      # Public contact form + admin inbox
│   ├── companies/             # Client companies ABM
│   ├── stock-categories/      # Stock catalog categories ABM
│   ├── stock-items/           # Equipment catalog ABM (with computed availability)
│   ├── vehicles/               # Vehicle catalog ABM (unique per license plate, boolean availability)
│   ├── campaigns/             # Campaigns + stock/vehicle/guide/pack-animal assignment (guides and pack animals have no catalog — price/type typed directly into the assignment form), expenses, activity log, Excel export
│   ├── puntos-interes/        # Points of interest ABM for the frontend's mountain map
│   ├── database/             # TypeORM entities + DatabaseModule
│   ├── common/                # Shared utils (file upload, image optimizer, public URL builder)
│   ├── config/                # Env var loading + validation (Joi)
│   ├── app.module.ts
│   └── main.ts
├── uploads/                  # Runtime uploaded files (gitignored, kept via .gitkeep)
├── .env.example
└── package.json
```

## Getting started (local development)

### 1. Prerequisites

- Node.js 20+ (project uses **v22.23.1**).
- A running PostgreSQL instance, local or remote (project uses **PostgreSQL 18.6**).

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in real values, especially:

- `JWT_SECRET` — long random string (e.g. `openssl rand -base64 64`).
- `ADMIN_LOGIN_PATH` — change the default to your own secret path before deploying.
- `DB_*` — your PostgreSQL connection details.
- `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` — used only once, by the seed script.
- `THROTTLE_LIMIT` / `THROTTLE_TTL_SECONDS` — global rate limit. If you get blocked
  while actively using the admin panel in local dev, raise `THROTTLE_LIMIT`.
- `CONTACT_THROTTLE_LIMIT` / `CONTACT_THROTTLE_TTL_SECONDS` — rate limit specific to
  `POST /contact` (default: 1 every 10 min per IP). Raise this if you're repeatedly
  testing the contact form locally.
- `CONTACT_EMAIL_COOLDOWN_HOURS` — how long before the same email can submit the
  contact form again (default: 24h).
- `MAX_UPLOAD_SIZE_BYTES` — max size accepted for any image upload (comments,
  images/logos, gallery), default 6MB.

### 4. Create the database schema

Make sure the database referenced by `DB_NAME` already exists (create it manually via
`createdb` / pgAdmin / etc), then run:

```bash
npm run db:init
```

This executes every file in [`sql/`](./sql) in order. It's idempotent (`CREATE ... IF
NOT EXISTS`), so it's safe to run again after adding new `.sql` files. Since it only
ever creates, altering an existing table's columns (e.g. adding a new one) requires
editing the relevant `sql/*.sql` file directly and either applying that change by hand
on a database that already has the table, or wiping and reinitializing (see below) —
there's no incremental migration step.

To wipe every table and reinitialize the schema from scratch on the configured
database (destructive — local/dev use only):

```bash
npm run db:reset -- --yes
```

Without `--yes` it only prints what it would do and touches nothing. Follow it with
`npm run db:seed-admin` again, since resetting also deletes the admin account.

### 5. Create the admin account

```bash
npm run db:seed-admin
```

This reads `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` from `.env` and creates (or
updates the password of) the admin row. There is intentionally no other way to create
an admin account.

### 6. (Optional) Migrate the original hardcoded experiences

The original frontend had ~10 project/experience entries hardcoded in its i18n file.
To load that historical content into the database (idempotent, safe to re-run):

```bash
npm run db:seed-experiences
```

### 7. Run the API

```bash
npm run start:dev
```

The API listens on `PORT` (default `3001`) under the `/api` prefix, e.g.
`http://localhost:3001/api/experiences`.

## Authentication flow

1. The frontend admin panel posts `{ username, password }` to
   `POST /api/{ADMIN_LOGIN_PATH}` (never a link/button anywhere in the public site).
2. On success, the API sets an `httpOnly`, `sameSite=strict` cookie containing a JWT
   that expires in 1 hour (`JWT_EXPIRES_IN`).
3. Subsequent admin requests (`/api/admin/**`) are protected by `JwtAuthGuard`, which
   reads the JWT from that cookie — never from `Authorization` headers or localStorage,
   to avoid exposing the token to JS/XSS.
4. `POST /api/admin/logout` clears the cookie. `GET /api/admin/me` returns the current
   admin's identity, used by the frontend to check session status on load.
5. `POST /api/admin/change-password` lets the logged-in admin change their own password
   (current password required). The target admin is always taken from the JWT — there's
   no way to change another admin's password through this endpoint.

## API overview

All routes are prefixed with `/api`.

| Method | Path                              | Auth  | Description                          |
|--------|-----------------------------------|-------|---------------------------------------|
| POST   | `/{ADMIN_LOGIN_PATH}`             | none  | Admin login, sets session cookie      |
| POST   | `/admin/logout`                   | JWT   | Clears session cookie                 |
| GET    | `/admin/me`                       | JWT   | Current admin identity                |
| POST   | `/admin/change-password`          | JWT   | Change own password (current password required) |
| GET    | `/comments`                       | none  | Active testimonials (public)          |
| GET    | `/admin/comments`                 | JWT   | All testimonials (admin)              |
| POST   | `/admin/comments`                 | JWT   | Create testimonial (multipart, `photo`) |
| PUT    | `/admin/comments/:id`             | JWT   | Update testimonial (multipart, optional new `photo`) |
| DELETE | `/admin/comments/:id`             | JWT   | Soft-delete testimonial                |
| GET    | `/images`                         | none  | Logos (public)                         |
| GET    | `/admin/images`                   | JWT   | Logos (admin)                          |
| POST   | `/admin/images`                   | JWT   | Upload logo (multipart, `image`)      |
| PUT    | `/admin/images/:id`                | JWT   | Update logo metadata                   |
| DELETE | `/admin/images/:id`                | JWT   | Delete logo (file + row)              |
| GET    | `/gallery?offset=&limit=`         | none  | Gallery photos, paginated (public). `limit` defaults to 16, max 48. Response: `{ items, hasMore }` |
| GET    | `/admin/gallery`                  | JWT   | Gallery photos, unpaginated (admin)   |
| POST   | `/admin/gallery`                  | JWT   | Upload gallery photo (multipart, `image`), optimized server-side (see above) |
| PUT    | `/admin/gallery/:id`               | JWT   | Update gallery photo metadata          |
| DELETE | `/admin/gallery/:id`               | JWT   | Delete gallery photo (file + row)     |
| GET    | `/experiences`                    | none  | Active experiences (public)           |
| GET    | `/admin/experiences`              | JWT   | All experiences (admin)               |
| POST   | `/admin/experiences`               | JWT   | Create experience                      |
| PUT    | `/admin/experiences/:id`           | JWT   | Update experience                      |
| DELETE | `/admin/experiences/:id`           | JWT   | Soft-delete experience                |
| POST   | `/contact`                        | none  | Submit contact form (rate-limited, honeypot, per-email cooldown — see Security notes) |
| GET    | `/admin/contact-messages`          | JWT   | All contact messages, newest first (admin) |
| GET    | `/admin/contact-messages/unread-count` | JWT | Unread count, for the admin panel badge |
| PUT    | `/admin/contact-messages/:id/read` | JWT   | Mark a message as read                |
| DELETE | `/admin/contact-messages/:id`      | JWT   | Delete a contact message (hard delete) |
| GET/POST/PUT/DELETE | `/admin/companies[/:id]`  | JWT   | Client companies ABM (soft delete) |
| GET/POST/PUT/DELETE | `/admin/stock-categories[/:id]` | JWT | Stock catalog categories ABM |
| GET/POST/PUT/DELETE | `/admin/stock-items[/:id]` | JWT  | Equipment catalog ABM; list responses include computed `lockedQuantity`/`availableQuantity` (conservative, ignores dates) |
| GET    | `/admin/stock-items/:id/schedule` | JWT | This item's current assignments across all non-finished campaigns (`startDate`/`endDate`/`quantity`/`campaignName` each) — used to paint the assignment modal's calendar |
| GET/POST/PUT/DELETE | `/admin/vehicles[/:id]` | JWT  | Vehicle catalog ABM; list responses include `isAvailable`/`lockedInCampaignId`/`lockedInCampaignName` (conservative, ignores dates) |
| GET    | `/admin/vehicles/:id/schedule` | JWT | This vehicle's current assignments across all non-finished campaigns (`startDate`/`endDate`/`campaignName` each) — used to paint the assignment modal's calendar |
| GET/POST          | `/admin/campaigns`                | JWT   | List / create campaigns |
| GET/PUT/DELETE     | `/admin/campaigns/:id`             | JWT   | Campaign detail (stock + vehicles + guides + pack animals + expenses + activity log + totals) / update / soft-delete |
| PUT    | `/admin/campaigns/:id/extend`      | JWT   | Extend the planned end date (also logs an activity entry) |
| POST   | `/admin/campaigns/:id/finish`      | JWT   | Manually finish the campaign, releasing all assigned stock and vehicles (guides/pack animals were never locked, nothing to release) |
| GET    | `/admin/campaigns/:id/export`      | JWT   | Download the campaign's Excel report (`.xlsx`) |
| POST/PUT/DELETE | `/admin/campaigns/:id/stock-items[/:itemId]` | JWT | Assign/update/release stock for the campaign (validated against availability; requires `startDate`/`endDate` within the campaign's own range) |
| POST/PUT/DELETE | `/admin/campaigns/:id/vehicles[/:vehicleAssignmentId]` | JWT | Assign/update/release a vehicle for the campaign (validated against availability; requires `startDate`/`endDate` within the campaign's own range) |
| POST/PUT/DELETE | `/admin/campaigns/:id/guides[/:assignmentId]` | JWT | Add/update/remove a `quantity` of guides for the campaign; `pricePerDay`/`taxPercentage` are typed directly into the request (no catalog), `startDate`/`endDate` within the campaign's own range feed the cost formula (`computeGuideCost`, no availability check) |
| POST/PUT/DELETE | `/admin/campaigns/:id/pack-animals[/:assignmentId]` | JWT | Assign/update/release a `quantity` of a pack animal for the campaign; `animalType`/`pricePerDay`/`taxPercentage` are typed directly into the request (no catalog, no availability check; requires `startDate`/`endDate` within the campaign's own range) |
| POST/PUT/DELETE | `/admin/campaigns/:id/expenses[/:expenseId]` | JWT | Extra expenses (multipart, optional `invoice` photo, `categoryId`, `invoiceType`, `businessName`) |
| POST/PUT/DELETE | `/admin/campaigns/:id/activity-logs[/:logId]` | JWT | Dated activity log entries |

### Bilingual content

Every content field that has copy is stored twice, `*Es` / `*En`, e.g. `commentEs` /
`commentEn`, `titleEs` / `titleEn`. The frontend picks the right field based on the
active `i18next` language when rendering the public site, and the admin panel exposes
both language inputs side by side when editing.

### Experience description blocks

`descriptionEs` / `descriptionEn` are JSON arrays of blocks so an experience can mix
free text and itemized lists, in any order:

```json
[
  { "type": "text", "content": "Some paragraph..." },
  { "type": "list", "items": ["Item one", "Item two"] },
  { "type": "text", "content": "Closing paragraph..." }
]
```

## Deployment (Hostinger VPS)

This API is designed to run alongside the frontend and PostgreSQL on the same VPS. Install
**Node.js v22.23.1** and **PostgreSQL 18.6** (or the closest available versions) to match
the versions this project was developed and tested against:

1. Provision PostgreSQL on the VPS (or use Hostinger's managed PostgreSQL if available).
2. Clone this repo, `npm install`, `npm run build`.
3. Copy `.env.example` to `.env` and fill in production values. Set `NODE_ENV=production`,
   a strong `JWT_SECRET`, and a non-default `ADMIN_LOGIN_PATH`.
4. Run `npm run db:init` once to create the schema, then `npm run db:seed-admin` once to
   create the admin account.
5. Run `npm run start:prod` behind a process manager (`pm2`, `systemd`, etc.) and reverse
   proxy (e.g. Nginx) that forwards `/api` (and `/uploads`) to this Node process.
6. Make sure `UPLOADS_DIR` points to a persistent path on disk (survives deploys) and is
   backed up along with the database.
7. Set `CORS_ORIGINS` to the exact production frontend origin(s).

## Security notes

- Passwords are hashed with `bcrypt` (cost factor 12); plaintext passwords are never stored.
- The JWT is only ever transmitted via an `httpOnly`, `sameSite=strict` cookie — not
  accessible to client-side JavaScript, mitigating XSS-based token theft.
- Every endpoint is rate-limited (`THROTTLE_LIMIT` per `THROTTLE_TTL_SECONDS`); the login
  endpoint additionally has its own, much stricter limit (`LOGIN_THROTTLE_LIMIT` per
  `LOGIN_THROTTLE_TTL_SECONDS`) read directly from `process.env`, independent of the
  global one.
- Static uploads (`/uploads/...`) are served with `Cross-Origin-Resource-Policy:
  cross-origin` (Helmet's default `same-origin` would otherwise make browsers block
  `<img>` loads from the frontend's origin).
- `validateAdmin` always runs a `bcrypt.compare` (against a dummy hash if the username
  doesn't exist) to avoid leaking valid usernames via response timing.
- Uploaded files are validated by MIME type and renamed to random UUIDs on disk —
  the original filename from the client is never trusted or persisted.
- Uploaded files are capped at `MAX_UPLOAD_SIZE_BYTES` (default 6MB) by Multer,
  rejected before the request body is fully read into memory.
- All admin-only routes require a valid, non-expired JWT (1 hour lifetime); there is no
  refresh token mechanism, so after 1 hour the admin must log in again.
- `POST /contact` (public, unauthenticated) has three layers against spam/abuse:
  a dedicated rate limit (`CONTACT_THROTTLE_LIMIT`/`CONTACT_THROTTLE_TTL_SECONDS`,
  read directly from `process.env` like the login throttle), a honeypot field
  (`website`) that silently no-ops the request without persisting anything when
  filled, and a per-email cooldown (`CONTACT_EMAIL_COOLDOWN_HOURS`) enforced in
  `ContactMessagesService` via a case-insensitive lookup of the most recent message
  from that email.
