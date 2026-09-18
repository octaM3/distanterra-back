# Campañas

[← Volver al README](../README.md)

El módulo central de la gestión interna. Una campaña es un operativo de logística
minera que se arma para una empresa cliente, con fecha de inicio y de fin, y al que se
le asignan recursos.

Es una herramienta puramente interna: no tiene ningún endpoint público.

## Los cuatro tipos de recurso

A una campaña se le asignan cuatro cosas, y la diferencia entre ellas explica casi todo
el resto del módulo:

| | Stock | Vehículos | Baqueanos | Animales de carga |
|---|---|---|---|---|
| **Qué es** | Equipamiento propio (carpas, luces, herramientas) | Camionetas alquiladas a terceros | Guías contratados | Caballos, mulas, burros |
| **Hay catálogo** | Sí | Sí | No | No |
| **Cómo se identifica** | Por cantidad | Por patente (única) | Por cantidad | Por tipo y cantidad |
| **Se bloquea al asignarlo** | Sí | Sí | No | No |
| **De dónde sale el precio** | Del catálogo, congelado al asignar | Del catálogo, congelado al asignar | Se escribe en el formulario | Se escribe en el formulario |
| **Fórmula de costo** | Bloques mensuales + días sueltos | Bloques mensuales + días sueltos | Días × cantidad + impuesto | Días × cantidad + impuesto |

Baqueanos y animales de carga **no tienen catálogo**: no existe una tabla para
administrarlos ni una pantalla de precios globales. El tipo de animal, el precio por día
y el porcentaje de impuesto se tipean directamente en el formulario de asignación. Por
eso tampoco tienen control de disponibilidad: no son un recurso limitado del que la
empresa lleve inventario.

## Los catálogos

### Empresas

Las empresas cliente para las que se organizan campañas. Borrado lógico.

### Categorías de stock

Un ABM chico (Carpas, Vehículos, Iluminación, Herramientas, etc.) que clasifica el
catálogo de stock. Se referencia por clave foránea, no hay campo de texto libre.

También lo usan los gastos extra para categorizarse.

### Stock

El equipamiento propio de Distanterra. Cada ítem tiene cantidad total, unidad y dos
precios independientes: `price_per_day` y `price_per_month`.

Un ítem puede tener uno, el otro, los dos, o ninguno. Sin ninguno es gratis — por
ejemplo los cubiertos.

La cantidad disponible **nunca se guarda**: se calcula al vuelo, porque depende de qué
fechas se estén consultando.

### Vehículos

Se alquilan a terceros. A diferencia del stock, cada vehículo es una unidad única
identificada por su patente: no hay cantidad, o está asignado o no lo está.

Tiene los mismos dos precios independientes que el stock. No existe un precio "por
campaña completa": para cobrar toda la campaña, se asigna el vehículo con el mismo rango
de fechas que la campaña y la cuenta da igual, solo que los días cubren todo.

## Fechas y bloqueo

Cada asignación, de cualquier tipo de recurso, lleva **su propio rango de fechas**
obligatorio, que tiene que caer dentro del rango de la campaña. Lo valida
`validateAssignmentDateRange` en `campaigns.util.ts`, igual para los cuatro tipos.

Un recurso no tiene por qué estar asignado toda la campaña, y el costo siempre se
calcula sobre los días de la asignación, no sobre los de la campaña.

**El bloqueo respeta ese mismo rango.** Asignar una carpa 10 de los 40 días de una
campaña la bloquea solo esos 10 días: los otros 30 puede estar en otra campaña. Esto
aplica a stock y vehículos únicamente — baqueanos y animales no se bloquean nunca.

### Dos lecturas distintas de la disponibilidad

Conviven dos formas de responder "¿está disponible?", y sirven para cosas distintas:

| | Listado del catálogo | Endpoint `/schedule` |
|---|---|---|
| **Qué reporta** | Si está asignado a *alguna* campaña no terminada, sin mirar fechas | Los rangos concretos que ya están tomados |
| **Para qué se usa** | Las pantallas de catálogo y los guards de borrado | Pintar el calendario del modal de asignación |
| **Criterio** | Conservador | Exacto |

El desplegable del modal de asignación nunca deshabilita un ítem por estar "en uso en
otro lado". En cambio, al elegir uno, consulta
`GET /admin/stock-items/:id/schedule` o `GET /admin/vehicles/:id/schedule` y usa la
respuesta para grisar los días ya tomados, así el admin elige fechas libres en vez de
quedar bloqueado.

El listado de vehículos además informa el uso **de hoy**: un vehículo asignado a una
campaña que todavía no empezó figura como disponible, y `nextUseDate` /
`nextUseCampaignName` indican cuándo se va a usar.

El guard que impide borrar un vehículo es más estricto que eso: bloquea si está asignado
a cualquier campaña no terminada, sin importar las fechas.

## Estados

El estado (`planificada`, `en_curso`, `finalizada`) **no se guarda**: se calcula a partir
de las fechas y de `finished_at`. El detalle de la campaña también devuelve
`durationDays`, la cantidad de días incluyendo los dos extremos.

Dos acciones lo modifican:

- **`PUT .../extend`** estira la fecha de fin mientras la campaña no esté terminada, y
  además deja una entrada automática en la bitácora.
- **`POST .../finish`** termina la campaña a mano y libera de una todo el stock y los
  vehículos, sin importar las fechas.

## Cálculo de costos

Por defecto el costo se calcula solo. Hay dos fórmulas según el tipo de recurso.

### Stock y vehículos

Los bloques enteros de 30 días se cobran a `price_per_month` y los días sobrantes a
`price_per_day`. Por ejemplo, 40 días son un mes más 10 días.

Si solo está cargado uno de los dos precios, se usa ese solo — y si es el mensual, el
conteo de días se redondea hacia arriba a un mes entero. Si no hay ninguno, el costo es
cero.

Las funciones son `computeBlendedUnitCost`, `computeStockItemCost` y
`computeVehicleCost`, en `campaigns.util.ts`.

Los precios se **congelan al momento de asignar**: si después cambia el precio del
catálogo, la asignación existente no se entera.

### Baqueanos y animales de carga

```
cantidad × precio_por_día × días × (1 + impuesto / 100)
```

Es `computeGuideCost`, y los animales de carga la reutilizan tal cual. Acá no hay
catálogo del cual congelar precios: son los valores que se tipearon en el formulario.

### Cómo pisar el cálculo

| Campo | Aplica a | Qué hace |
|---|---|---|
| `manual_cost` | Los cuatro tipos | Reemplaza el cálculo automático. La UI muestra el automático como sugerencia, no como límite |
| `no_cost` | Solo stock | Fuerza el costo a cero, por ejemplo para algo prestado gratis |

Cuando están los dos, **`no_cost` gana**. Vehículos, baqueanos y animales no tienen
`no_cost`: para regalarlos alcanza con un `manual_cost` en cero.

## Gastos extra

Los costos que aparecen sobre la marcha durante una campaña — una compra de comida, por
ejemplo. Se itemizan y se totalizan por campaña y por mes.

Cada gasto tiene:

- Una foto de la factura, opcional.
- Una categoría, por clave foránea al mismo catálogo de categorías de stock (no hay
  texto libre).
- `invoice_type`, de un catálogo fijo de letras de AFIP: Factura A, B, C, E, T o M. Lo
  imponen un `CHECK` en la base y un `@IsIn` en el DTO.
- `business_name`, texto libre.

## Bitácora

Entradas de texto libre con fecha que el admin va cargando durante la campaña, para
llevar registro de lo que se fue coordinando. Extender una campaña agrega una entrada
automática.

## Exportación a Excel

`GET /admin/campaigns/:id/export` genera un libro de Excel por campaña, con `exceljs`.
Tiene una hoja de resumen más el detalle de:

- Stock asignado, con su costo incluso cuando es `no_cost`.
- Vehículos asignados.
- Baqueanos asignados.
- Animales de carga asignados.
- Gastos extra, con subtotal por mes.
- La bitácora ordenada por fecha.
