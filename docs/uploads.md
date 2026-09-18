# Archivos subidos

[← Volver al README](../README.md)

Todos los archivos se guardan en el disco local, bajo la ruta que indique
`UPLOADS_DIR`. No hay almacenamiento en la nube: la aplicación está pensada para correr
entera en un VPS.

## Dos árboles, según quién puede verlos

`UPLOADS_DIR` se parte en dos, y de qué lado cae un archivo define si hace falta sesión
para abrirlo:

| | `public/` | `private/` |
|---|---|---|
| **Qué contiene** | Galería, logos de partners, fotos de testimonios | Documentación de empleados, facturas de gastos, documentos financieros, KMZ de trackings |
| **Cómo se accede** | `GET /uploads/...` | `GET /api/admin/files/...` |
| **Hace falta sesión** | No | Sí, JWT de admin |
| **Lo sirve** | `ServeStaticModule` | `files/private-files.controller.ts` |

El corte es el mismo que hace el menú del panel: lo que cuelga de **"Contenido del
sitio"** es público, lo que cuelga de **"Gestión"** es privado.

La tabla de visibilidad vive en `common/uploads/upload-targets.ts` y es la única fuente
de verdad — la usan tanto la aplicación como el script de migración. **Una subcarpeta
que no esté declarada como pública se trata como privada**, así que una carpeta nueva
que alguien agregue sin acordarse de ese archivo queda protegida en lugar de expuesta.

## Las rutas en la base no llevan el prefijo

En la base de datos se guarda la ruta relativa sin el `public/` ni el `private/`: por
ejemplo `gallery/abc.webp` o `medical-exams/def.pdf`. El prefijo se resuelve en tiempo
de ejecución a partir de la tabla de visibilidad.

Esto tiene dos consecuencias prácticas: las URLs públicas no cambiaron al introducir el
split, y reclasificar una carpeta no requiere tocar ninguna fila.

## Migración desde el layout viejo

Una instalación anterior tiene todo suelto bajo `UPLOADS_DIR`. Para pasarla al layout
nuevo:

```bash
npm run uploads:split -- --dry-run
npm run uploads:split
```

Es idempotente y solo mueve archivos en disco. **Importante**: pará el servicio antes de
correrlo. Si el proceso viejo sigue levantado, va a seguir escribiendo en las rutas
viejas y esos archivos quedan huérfanos.

## El endpoint privado

`GET /api/admin/files/<ruta>` entrega un archivo del árbol privado. Además del
`JwtAuthGuard`:

- Rechaza path traversal: cada segmento tiene que coincidir con `[A-Za-z0-9._-]+`, y
  después se verifica que la ruta absoluta resuelta caiga dentro de la raíz privada.
- Se niega a servir algo clasificado como público, para que cada archivo tenga una sola
  URL.
- Manda `Cache-Control: private, no-store`, así la documentación sensible no queda en
  cachés intermedias ni en la del navegador.
- Fuerza la descarga (`Content-Disposition: attachment`) para SVG y KMZ, que si se
  renderizaran embebidos podrían ejecutar scripts en el origen de la API.

### Un detalle de la cookie

La cookie de sesión es `sameSite: strict`. Eso significa que si copiás una de estas URLs
y la abrís desde un clic que viene de otro sitio (un mensaje de WhatsApp, un mail), el
navegador no manda la cookie y vas a recibir un 401 aunque estés logueado. Pegándola a
mano en la barra de direcciones sí funciona.

Para compartir un documento con alguien de afuera, descargá el archivo y mandá el
archivo, no el enlace.

## Optimización de imágenes

Las fotos que pasan por `common/utils/image-optimizer.util.ts` se redimensionan para
entrar en 1920×1920 (respetando la proporción, nunca agrandando) y se recomprimen como
WebP, así una foto pesada de cámara nunca se sirve tal cual. También se aplica la
orientación EXIF antes de redimensionar, que es lo que evita que las fotos de celular
salgan rotadas.

Los SVG y GIF se guardan intactos: el GIF para no perder la animación, el SVG porque ya
es liviano.

| Subida | Se optimiza |
|---|---|
| Galería | Sí |
| DNI de empleados, facturas de gastos | Sí |
| Logos de partners, fotos de testimonios | No, se guardan tal como llegan |

## Límites

`MAX_UPLOAD_SIZE_BYTES` (6 MB por defecto) aplica a todas las subidas y lo hace cumplir
Multer, que rechaza el archivo antes de leer el body completo en memoria.

Los tipos aceptados dependen del endpoint: imágenes (jpeg, png, webp, gif, svg) para
fotos, `application/pdf` para la documentación de empleados y los documentos
financieros, y `.kmz` para los trackings. Este último se filtra por extensión y no por
tipo MIME, porque el MIME que manda el navegador para un KMZ es inconsistente.
