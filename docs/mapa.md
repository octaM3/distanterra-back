# Mapa

[← Volver al README](../README.md)

Dos módulos que alimentan el mapa interactivo de montaña del panel: los puntos de
interés y los trackings GPS. Los dos son internos — todos sus endpoints están detrás de
`JwtAuthGuard`, no hay nada público.

## Puntos de interés

Marcadores sobre el mapa. Cada uno tiene:

| Campo | Notas |
|---|---|
| `nombre` | |
| `categoria` | Catálogo fijo: `refugio`, `mirador`, `agua`, `peligro`, `campamento`. Define qué ícono dibuja el front |
| `latitude` / `longitude` | Validados con `@IsLatitude` / `@IsLongitude` |
| `telefono` | Opcional |
| `comentario` | Texto libre, opcional |

La categoría la imponen un `CHECK` en la base y un `@IsIn` en el DTO, así que no entra
un valor fuera del catálogo.

### Carga en dos pasos

`GET /admin/puntos-interes` devuelve la lista completa, pero **sin** `telefono` ni
`comentario`. El front pinta todos los marcadores con eso.

Recién cuando se abre el popup de un marcador se pide `GET /admin/puntos-interes/:id`
para traer esos dos campos. Así la carga inicial del mapa se mantiene liviana aunque
haya muchos puntos.

Borrado físico: un punto eliminado desaparece, no hace falta rastro.

## Trackings

Recorridos GPS subidos como archivos `.kmz`.

Al subir uno, la API descomprime el KMZ (es un ZIP), parsea el KML que tiene adentro y
extrae los puntos del recorrido, que se guardan como JSON en la columna `points`. El
archivo original también se conserva, para poder descargarlo después.

| Campo | Notas |
|---|---|
| `nombre` | |
| `descripcion` | Opcional |
| `color` | Color de la línea en el mapa, hexadecimal `#rrggbb`. Se elige al subir el tracking |
| `points` | El recorrido ya extraído, en JSON |
| `stats` | Métricas calculadas del recorrido, en JSON. Ver abajo |
| `deviceInfo` | Texto de las descripciones del archivo, sin HTML |
| `filePath` | El `.kmz` original, en el árbol privado de uploads |

El `color` es nullable a propósito: los trackings cargados antes de que el color fuera
elegible no tienen uno, y el frontend les asigna automáticamente un color de una paleta
cíclica según su id. Así no hizo falta migrar datos. Un `CHECK` en la base y un
`@Matches` en el DTO garantizan el formato.

El filtro de subida mira la **extensión** y no el tipo MIME, porque el MIME que manda el
navegador para un KMZ varía bastante según el sistema operativo — a veces llega vacío o
como `application/octet-stream`.

## Métricas del recorrido

Al subir el archivo se calculan métricas a partir de los propios puntos, y se guardan en
`stats`:

| Métrica | De dónde sale |
|---|---|
| `distanceMeters` | Suma de la distancia entre puntos consecutivos (haversine) |
| `durationSeconds`, `startedAt`, `endedAt` | Primera y última marca de tiempo del archivo |
| `avgSpeedKmh` | Distancia sobre duración total |
| `minAltitudeMeters`, `maxAltitudeMeters` | La altitud que viene como tercer valor de cada coordenada |
| `elevationGainMeters`, `elevationLossMeters` | Desnivel acumulado, ignorando cambios menores a 3 m |

Se calculan en el backend, y no en el navegador, para que queden guardadas y sean
comparables entre trackings sin importar de qué app venga cada archivo.

**Quedan afuera a propósito el tiempo en movimiento y la velocidad en movimiento**:
dependen de elegir un umbral arbitrario de detención, así que la aplicación no se hace
cargo de ese criterio. Cuando el archivo los trae ya resueltos, aparecen en `deviceInfo`.

Ese umbral de 3 m para el desnivel es también una elección: cada app usa el suyo, así
que el número puede no coincidir con el que muestre la que generó el archivo. En un track
de prueba dio 761 m contra los 732 m declarados por OruxMaps. Duración, distancia y
velocidad media sí coinciden exactamente.

## Datos del archivo

`deviceInfo` guarda el texto de las `<description>` del KML, ya sin HTML. Ahí suelen
venir el tiempo en movimiento, la velocidad máxima y hasta el clima del momento.

No alcanza con mirar la descripción del Placemark del track: OruxMaps, por ejemplo, la
deja vacía y pone la tabla de estadísticas en el `<description>` del `Document`, con el
clima en los marcadores de inicio y fin. Por eso se juntan todas las descripciones del
documento y se deduplican por etiqueta, conservando el primer valor de cada una — el
mismo bloque suele repetirse una vez por el track completo y otra por cada segmento.

Es la parte frágil de todo esto: es texto con formato propio de cada aplicación. Si el
archivo viene de otra app, `deviceInfo` puede quedar vacío o con otro contenido. Las
métricas de `stats`, en cambio, funcionan con cualquier KMZ.

## Reprocesar trackings ya cargados

Como el `.kmz` original siempre se conserva, los trackings anteriores a estas columnas se
pueden completar sin volver a subirlos:

```bash
npm run trackings:backfill-stats -- --dry-run
npm run trackings:backfill-stats
```

Por defecto solo toca los que no tienen métricas; con `--all` recalcula todos.

Borrado físico: al eliminar un tracking se borra también su archivo.

## En el panel

Las dos secciones comparten una sola pantalla. El panel lateral muestra una por vez,
con un switch arriba, pero el mapa dibuja las dos capas al mismo tiempo: cambiar de
pestaña no borra del mapa lo que ya estaba pintado.

La visibilidad de cada capa la controlan sus propios controles — los chips de categoría
para los puntos, el check "Mostrar trackings" para los recorridos.
