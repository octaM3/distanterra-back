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
- Every admin-editable piece of content that has copy is **bilingual** (`_es` / `_en`
  columns), matching the frontend's i18n setup.
- Uploaded images are stored on local disk (`UPLOADS_DIR`) and served statically at
  `/uploads/...`, which fits the "everything on one Hostinger VPS" deployment target.
- Gallery photos are optimized on upload with `sharp` (`common/utils/image-optimizer.util.ts`):
  resized to fit within 1920×1920 (aspect ratio preserved, never upscaled) and
  recompressed as WebP, so heavy camera-original photos never get served as-is.
  SVG/GIF are stored untouched. Upload is capped at 15MB before optimization.
- Database schema is plain, versioned SQL files under [`sql/`](./sql), no ORM
  migrations magic — run once with `npm run db:init`.

## Tech stack

- Node.js >= 20 — developed/tested with **v22.23.1** (see `engines` in `package.json`).
- NestJS 11, TypeORM 0.3, PostgreSQL (`pg` driver) — developed/tested with
  **PostgreSQL 18.6**. Use the same major version on the VPS to avoid surprises.
- `passport-jwt` + `@nestjs/jwt` for authentication, `bcrypt` for password hashing.
- `class-validator` / `class-transformer` for request validation.
- `helmet`, `cookie-parser`, `@nestjs/throttler` for baseline security hardening.
- `sharp` for server-side image resizing/compression (gallery uploads).

## Project layout

```
distanterra-back/
├── sql/                     # Raw SQL DDL, run in filename order
├── scripts/
│   ├── init-db.ts           # Runs every sql/*.sql file against the configured DB
│   ├── seed-admin.ts        # Creates/updates the single admin account
│   └── seed-experiences.ts  # One-off import of the original hardcoded experiences
├── src/
│   ├── auth/                # Login (hidden path), JWT strategy/guard
│   ├── comments/             # Testimonials ABM
│   ├── images/               # Logos ABM
│   ├── experiences/          # Experiences ABM
│   ├── database/             # TypeORM entities + DatabaseModule
│   ├── common/                # Shared utils (file upload, public URL builder)
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

### 4. Create the database schema

Make sure the database referenced by `DB_NAME` already exists (create it manually via
`createdb` / pgAdmin / etc), then run:

```bash
npm run db:init
```

This executes every file in [`sql/`](./sql) in order. It's idempotent (`CREATE ... IF
NOT EXISTS`), so it's safe to run again after adding new `.sql` files.

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
- All admin-only routes require a valid, non-expired JWT (1 hour lifetime); there is no
  refresh token mechanism, so after 1 hour the admin must log in again.
