# Autenticación y seguridad

[← Volver al README](../README.md)

## El login está oculto

No hay ninguna ruta de login visible ni ningún enlace al panel desde el sitio público.
Además, el endpoint de login **no** está en una ruta previsible como `/auth/login`: vive
en la ruta que configures en `ADMIN_LOGIN_PATH`, que conviene cambiar en cada
despliegue. Así no se lo encuentra probando rutas comunes.

Tampoco hay registro público. La única cuenta de admin se crea por línea de comandos
con `npm run db:seed-admin`, nunca por HTTP.

## Flujo de sesión

1. El panel hace `POST /api/{ADMIN_LOGIN_PATH}` con `{ username, password }`.
2. Si las credenciales son correctas, la API responde con una cookie `httpOnly` y
   `sameSite=strict` que contiene un JWT con una hora de vida (`JWT_EXPIRES_IN`).
3. Todo lo que cuelga de `/api/admin/**` está protegido por `JwtAuthGuard`, que lee el
   JWT de esa cookie — nunca de un header `Authorization` ni de `localStorage`, para que
   el token no quede al alcance de JavaScript.
4. `POST /api/admin/logout` borra la cookie. `GET /api/admin/me` devuelve la identidad
   del admin actual, que el front usa para saber si la sesión sigue viva.
5. `POST /api/admin/change-password` permite cambiar la propia contraseña (hay que
   mandar la actual). El admin afectado siempre sale del JWT: no hay forma de cambiarle
   la contraseña a otro por este endpoint.

**No hay refresh token.** Pasada la hora, hay que volver a loguearse.

## Contraseñas

Se hashean con `bcrypt` (factor de costo 12) y nunca se guardan en texto plano.

`validateAdmin` siempre ejecuta un `bcrypt.compare`, incluso cuando el usuario no
existe (lo compara contra un hash de descarte). Es para que el tiempo de respuesta sea
el mismo en los dos casos y no se pueda deducir qué usuarios existen midiendo demoras.

## Rate limiting

Hay tres límites distintos, cada uno con sus variables de entorno:

| Alcance | Variables | Default |
|---|---|---|
| Todos los endpoints | `THROTTLE_LIMIT` / `THROTTLE_TTL_SECONDS` | 60 cada 60 s |
| Login | `LOGIN_THROTTLE_LIMIT` / `LOGIN_THROTTLE_TTL_SECONDS` | 5 cada 60 s |
| Formulario de contacto | `CONTACT_THROTTLE_LIMIT` / `CONTACT_THROTTLE_TTL_SECONDS` | 1 cada 10 min |

Los dos últimos se leen directamente de `process.env`, independientes del global.

La única excepción es `GET /api/admin/files/*`, que saltea el límite global: una sola
pantalla del panel puede pedir decenas de archivos a la vez y chocaría contra el tope.
Ahí el control de acceso es el JWT, no el throttler.

Si te bloquea mientras trabajás en desarrollo, subí `THROTTLE_LIMIT` en tu `.env`.

## Protecciones del formulario de contacto

`POST /contact` es público y sin autenticación, así que tiene tres capas contra spam:

1. **Rate limit propio**, más estricto que el global (ver la tabla de arriba).
2. **Honeypot**: el DTO tiene un campo `website` que el formulario real mantiene
   invisible. Si llega con contenido, la API responde un éxito falso y no guarda nada,
   así el bot no se entera de que lo detectaron.
3. **Enfriamiento por email**: un segundo mensaje desde la misma dirección dentro de
   `CONTACT_EMAIL_COOLDOWN_HOURS` (24 h por defecto) se rechaza con un 429. La búsqueda
   del mensaje anterior no distingue mayúsculas.

## Otras medidas

- **Helmet** está activo globalmente. La única desviación del default es
  `Cross-Origin-Resource-Policy: cross-origin`, necesaria para que el navegador no
  bloquee las imágenes de `/uploads` cuando el front vive en otro origen.
- **Validación de entrada**: `ValidationPipe` global con `whitelist`, `transform` y
  `forbidNonWhitelisted`, así que un campo que no esté en el DTO hace fallar el request
  en vez de colarse.
- **Archivos subidos**: se validan por tipo MIME, se renombran a un UUID aleatorio y se
  limitan a `MAX_UPLOAD_SIZE_BYTES` (6 MB por defecto) antes de leer el body entero en
  memoria. El nombre original del cliente nunca se usa ni se guarda.
- **Documentación interna**: no es accesible públicamente. Ver [uploads.md](uploads.md).
