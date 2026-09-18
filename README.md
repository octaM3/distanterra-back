# Distanterra API

Backend de Distanterra: sirve el contenido de la landing pública y toda la gestión
interna de la empresa (campañas de logística minera, empleados, documentación y
facturación).

NestJS 11 + TypeORM + PostgreSQL. Repositorio: https://github.com/octaM3/distanterra-back

## Qué hace

La API cubre dos cosas bastante distintas, y esa división atraviesa todo el proyecto:

| | Contenido del sitio | Gestión interna |
|---|---|---|
| **Para qué** | Alimenta la landing pública | Herramienta de trabajo diaria |
| **Quién lo ve** | Cualquiera | Solo el admin con sesión |
| **Módulos** | Experiencias, comentarios, galería, logos, mensajes de contacto | Campañas, empleados, documentos financieros, mapa |
| **Endpoints** | Lectura pública sin auth, ABM bajo `/api/admin/...` | Todo bajo `/api/admin/...` |

## Stack

- **Node.js 20+** — desarrollado y probado con v22.23.1 (ver `engines` en `package.json`).
- **PostgreSQL** — desarrollado y probado con 18.6. Usá la misma versión mayor en el
  servidor para evitar sorpresas.
- **NestJS 11** + **TypeORM 0.3** con el driver `pg`.
- `passport-jwt` + `@nestjs/jwt` para autenticación, `bcrypt` para las contraseñas.
- `class-validator` / `class-transformer` para validar los request.
- `helmet`, `cookie-parser` y `@nestjs/throttler` para el endurecimiento básico.
- `sharp` para redimensionar y comprimir imágenes al subirlas.
- `exceljs` para los reportes de campaña en Excel.

## Puesta en marcha

Necesitás Node 20+ y una instancia de PostgreSQL corriendo.

```bash
npm install
cp .env.example .env
```

Editá el `.env` con tus valores reales. Los que sí o sí tenés que tocar:

| Variable | Qué poner |
|---|---|
| `JWT_SECRET` | Una cadena larga y aleatoria: `openssl rand -base64 64` |
| `ADMIN_LOGIN_PATH` | Tu propia ruta secreta de login (no dejes la del ejemplo) |
| `DB_*` | Los datos de conexión a tu PostgreSQL |
| `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` | Usuario y contraseña del admin inicial |

El resto tiene valores por defecto razonables y está explicado en el propio
[`.env.example`](.env.example).

Después, creá el esquema (la base vacía tiene que existir antes, con `createdb` o
pgAdmin) y el usuario admin:

```bash
npm run db:init
npm run db:seed-admin
npm run start:dev
```

La API queda escuchando en `PORT` (3001 por defecto) bajo el prefijo `/api`, por ejemplo
`http://localhost:3001/api/experiences`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run start:dev` | Levanta la API en desarrollo, con recarga automática |
| `npm run build` | Compila a `dist/` |
| `npm run start:prod` | Corre lo compilado (producción) |
| `npm run lint` | ESLint con `--fix`: **reformatea archivos**, revisá el diff después |
| `npm run db:init` | Ejecuta todos los `sql/*.sql` en orden. Idempotente |
| `npm run db:reset -- --yes` | Borra todas las tablas y las recrea. **Destructivo** |
| `npm run db:seed-admin` | Crea el admin, o le cambia la contraseña si ya existe |
| `npm run db:seed-experiences` | Importa las experiencias que estaban hardcodeadas en el front |
| `npm run uploads:split` | Migración única del layout de uploads. Ver [docs/uploads.md](docs/uploads.md) |
| `npm run trackings:backfill-stats` | Recalcula las métricas de los trackings ya cargados. Ver [docs/mapa.md](docs/mapa.md) |

Sobre el esquema: **no hay migraciones incrementales**. Los `sql/*.sql` solo crean
(`CREATE ... IF NOT EXISTS`), así que agregar una columna a una tabla que ya existe
implica editar el `.sql` correspondiente y aplicar el cambio a mano en la base, o
resetear todo en desarrollo.

## Estructura

```
distanterra-back/
├── docs/                    # Documentación por módulo (ver abajo)
├── sql/                     # DDL en SQL plano, se ejecuta por orden de nombre
├── scripts/                 # Scripts de base de datos y migraciones puntuales
├── uploads/                 # Archivos subidos (gitignored)
│   ├── public/              # Servido en /uploads sin sesión
│   └── private/             # Solo vía GET /api/admin/files/*
└── src/
    ├── auth/                # Login oculto, estrategia y guard de JWT
    ├── files/               # Entrega autenticada del árbol privado de uploads
    │
    ├── experiences/         # ─┐
    ├── comments/            #  │
    ├── images/              #  │ Contenido del sitio
    ├── gallery/             #  │
    ├── contact-messages/    # ─┘
    │
    ├── campaigns/           # ─┐
    ├── companies/           #  │
    ├── stock-categories/    #  │
    ├── stock-items/         #  │
    ├── vehicles/            #  │ Gestión interna
    ├── employees/           #  │
    ├── financial-documents/ #  │
    ├── service-records/     #  │
    ├── puntos-interes/      #  │
    ├── trackings/           # ─┘
    │
    ├── database/            # Entidades de TypeORM + DatabaseModule
    ├── common/              # Utilidades compartidas (uploads, imágenes, URLs)
    ├── config/              # Carga y validación de variables de entorno (Joi)
    ├── app.module.ts
    └── main.ts
```

## Documentación

| Documento | De qué trata |
|---|---|
| [Autenticación y seguridad](docs/autenticacion-y-seguridad.md) | Login oculto, sesión por cookie, rate limiting, protecciones contra abuso |
| [Archivos subidos](docs/uploads.md) | El árbol público/privado, quién ve qué, optimización de imágenes |
| [Contenido del sitio](docs/contenido-web.md) | Experiencias, comentarios, galería, logos, formulario de contacto, bilingüismo |
| [Campañas](docs/campanas.md) | Campañas, stock, vehículos, baqueanos, animales de carga, gastos, costos |
| [Empleados](docs/empleados.md) | Legajos, exámenes médicos, pólizas de seguro, datos bancarios |
| [Administración](docs/administracion.md) | Documentos financieros y estado de facturación y cobro |
| [Mapa](docs/mapa.md) | Puntos de interés y trackings GPS |
| [Referencia de la API](docs/api.md) | Tabla completa de endpoints |
| [Despliegue](docs/despliegue.md) | Puesta en producción en un VPS |
