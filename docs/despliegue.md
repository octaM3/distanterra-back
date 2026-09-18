# Despliegue

[← Volver al README](../README.md)

La aplicación está pensada para correr entera en un solo VPS: la API, el frontend
compilado y PostgreSQL en la misma máquina, con Nginx adelante.

## Versiones

Instalá las mismas versiones mayores contra las que se desarrolló, para no comerte
diferencias de comportamiento:

- **Node.js** v22.23.1
- **PostgreSQL** 18.6

## Pasos

1. **PostgreSQL** instalado en el VPS, con la base creada y vacía.
2. **Clonar el repo**, `npm install` y `npm run build`.
3. **Configurar el `.env`** a partir de `.env.example`. En producción, sí o sí:
   - `NODE_ENV=production`
   - Un `JWT_SECRET` largo y aleatorio
   - Un `ADMIN_LOGIN_PATH` distinto del de ejemplo
   - `CORS_ORIGINS` con el origen exacto del frontend
4. **Crear el esquema y el admin**, una sola vez:
   ```bash
   npm run db:init
   npm run db:seed-admin
   ```
5. **Levantar la API** con `npm run start:prod`, detrás de un gestor de procesos (pm2,
   systemd) y de un proxy inverso que enrute `/api` y `/uploads` al proceso Node.
6. **Si venís de una instalación anterior**, migrar los uploads al layout partido:
   ```bash
   npm run uploads:split -- --dry-run
   npm run uploads:split
   ```
   Pará el servicio antes de correrlo. Ver [uploads.md](uploads.md).

## Uploads y Nginx

`UPLOADS_DIR` tiene que apuntar a una ruta persistente, que sobreviva a los despliegues,
y hay que respaldarla junto con la base de datos.

**No apuntes Nginx directamente a `UPLOADS_DIR`.** Solo `<UPLOADS_DIR>/public` puede
servirse de forma estática. `<UPLOADS_DIR>/private` tiene datos personales y tiene que
seguir pasando por la API, que es la que verifica la sesión.

Es el error que desharía de una toda la protección del árbol privado.

## Orden de despliegue

Cuando el despliegue incluye la migración de uploads, el orden importa:

1. Parar el servicio.
2. Desplegar el código nuevo.
3. Correr `npm run uploads:split`.
4. Levantar.

Si se corre la migración con el proceso viejo todavía levantado, ese proceso sigue
escribiendo en las rutas viejas y los archivos que se suban en esa ventana quedan
huérfanos.

## Pendiente: `trust proxy`

Ahora mismo `main.ts` no configura `trust proxy`. Cuando la API queda detrás de Nginx,
`@nestjs/throttler` ve la IP del proxy en lugar de la del visitante, y los límites que
son *por IP* pasan a ser globales:

- El del formulario de contacto (1 cada 10 minutos) lo consume el primer bot y bloquea a
  todos los demás.
- El del login (5 por minuto) deja de aislar al atacante del resto.

Hay que habilitar `trust proxy` en Express y pasar `X-Forwarded-For` desde Nginx antes
de considerar el despliegue terminado.

## Respaldos

El respaldo tiene que cubrir dos cosas: el volcado de la base y el contenido de
`UPLOADS_DIR`. Con una sola de las dos no se puede reconstruir el sistema.

Si los respaldos se mandan a un servicio externo, tené en cuenta que el árbol privado
contiene datos personales: dónde termina alojada esa copia es parte de la decisión.
