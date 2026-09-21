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

Las tres lecturas comparten un filtro: solo cuenta lo asignado a campañas **aprobadas**.
Un presupuesto sin aprobar aparece en `/schedule` marcado con `isBudget`, pero no ocupa
nada (ver [Presupuestos](#presupuestos)).

## Estados

Los seis estados salen de `computeCampaignStatus`, y valen igual para una campaña y para
un servicio (misma tabla; el front solo cambia el género de la etiqueta):

| Estado | De dónde sale | ¿Reserva? | Qué se puede hacer |
|---|---|---|---|
| `presupuesto` | `approval_status = 'presupuesto'` | No | Editar, cargar equipamiento, bajar el PDF, aprobar, rechazar |
| `rechazada` | `approval_status = 'rechazada'` | No | Reabrir o eliminar; queda archivada con todo lo cargado |
| `planificada` | Aprobada y `hoy < start_date` | Sí | Todo: editar, asignar, ampliar, finalizar |
| `en_curso` | Aprobada y `start_date <= hoy <= end_date` | Sí | Ídem |
| `esperando_finalizacion` | Aprobada, `hoy > end_date` y sin `finished_at` | Ver abajo | Ídem; lo que falta es tocar "Finalizar" |
| `finalizada` | `finished_at` con valor | No | Solo lectura: las secciones esconden sus controles |

**El orden importa**: la aprobación se evalúa primero y no mira fechas. Un presupuesto
cuyas fechas ya pasaron sigue siendo un presupuesto (vencido, pero presupuesto), no una
campaña "en curso" que nadie está haciendo.

Solo el estado se calcula al vuelo; `approval_status` y `finished_at` sí son columnas.
El detalle devuelve además `durationDays`, la cantidad de días incluyendo los dos
extremos.

### El limbo de `esperando_finalizacion`

Es el estado en el que la fecha de fin ya pasó pero nadie cerró la campaña a mano. Ahí
la disponibilidad depende de qué se pregunte, porque las tres lecturas usan criterios
distintos:

| Se pregunta | Qué contesta en este estado |
|---|---|
| Catálogo (`lockedQuantity` / `availableQuantity`, vía `getLockedQuantitiesToday`) | Libre: la ventana de la asignación ya no cubre hoy |
| Asignar a otra campaña (`getAvailableQuantity` sobre un rango) | Libre, salvo que el rango nuevo pise la ventana vieja |
| Bajar el total del ítem en el catálogo (`getLockedQuantities`) | Ocupado: no deja bajar el total por debajo de lo comprometido, sin mirar fechas |

Antes este estado se mostraba igual que `en_curso`, y parecía que el stock seguía "en
uso" sin que quedara claro por qué.

Dos acciones lo modifican:

- **`PUT .../extend`** estira la fecha de fin mientras la campaña no esté terminada, y
  además deja una entrada automática en la bitácora.
- **`POST .../finish`** termina la campaña a mano y libera de una todo el stock y los
  vehículos, sin importar las fechas.

La excepción son los presupuestos: `approval_status` sí es una columna, y gana sobre las
fechas. Ver [Presupuestos](#presupuestos).

## Presupuestos

Un presupuesto es una campaña o un servicio que el cliente **todavía no aprobó**. No
tiene tabla ni endpoints propios: es una fila de `campaigns` con
`approval_status = 'presupuesto'`.

Se modeló así porque un presupuesto tiene exactamente la forma de aquello que
presupuesta —las mismas asignaciones, las mismas fechas, los mismos costos—, y porque
**aprobar tiene que ser cambiar un estado, no copiar una entidad a otra**: cuando el
cliente dice que sí, la campaña ya está armada.

Es una dimensión independiente de `kind`: se presupuestan campañas y servicios por igual.

| Estado | Qué significa | ¿Reserva stock y vehículos? |
|---|---|---|
| `presupuesto` | Mandado al cliente, esperando respuesta | No |
| `aprobada` | Trabajo en firme (lo que existía antes de los presupuestos) | Sí |
| `rechazada` | El cliente no lo tomó; queda archivado | No |

### Por qué un presupuesto no reserva

Si reservara, un presupuesto que nunca se cierra dejaría equipamiento bloqueado sin
trabajo detrás. Por eso todas las consultas de disponibilidad filtran por
`RESERVING_APPROVAL_STATUS` (`campaign.entity.ts`), que es `'aprobada'` y nada más.

La contracara es que entre que el presupuesto se manda y el cliente contesta, otra
campaña puede llevarse lo que estaba presupuestado. Eso se cubre de dos maneras:

- **Aviso, no bloqueo.** El endpoint `/schedule` sí devuelve las asignaciones de los
  presupuestos, marcadas con `isBudget: true`. El modal de asignación las muestra
  aparte ("pedido en presupuestos sin aprobar") sin descontarlas de la disponibilidad.
- **Revalidación al aprobar.** `GET .../approval-conflicts` lista qué se presupuestó y
  ya no está libre, y `POST .../approve` se niega si hay conflictos. `?force=true` lo
  aprueba igual, para cuando el conflicto se resuelve por fuera del sistema.

### Transiciones permitidas

`assertApprovalTransition` (en `campaigns.util.ts`) es la única puerta por la que se
mueve `approval_status`. Lo que no está en su tabla, no pasa:

```
presupuesto ──aprobar──> aprobada        (punto sin retorno)
     │  ▲
rechazar  reabrir
     ▼  │
   rechazada
```

| De | A | ¿Se puede? |
|---|---|---|
| presupuesto | aprobada | Sí, con revalidación de disponibilidad |
| presupuesto | rechazada | Sí |
| rechazada | presupuesto | Sí (reabrir) |
| rechazada | aprobada | **No**: hay que reabrirlo primero, para que alguien vuelva a mirar lo cargado y las fechas, que a esa altura pueden estar vencidas |
| aprobada | cualquiera | **No** |
| cualquiera | sí mismo | **No**: aprobar dos veces o rechazar algo ya rechazado pisaría la fecha del primer cambio |

**`aprobada` no vuelve atrás** a propósito. Al aprobar pasan dos cosas que no se
deshacen solas: el equipamiento queda reservado y nace el ítem de gestión para facturar.
Un "despresupuestar" tendría que liberar lo primero y borrar lo segundo, y para entonces
la campaña ya podría estar en curso. Si un trabajo en firme se cae, lo que corresponde
es eliminarlo.

Las otras acciones tienen su propia guarda, por el mismo criterio de no saltear estados:

| Acción | Requiere |
|---|---|
| `approve` / `reject` / `reopen` | La transición de la tabla de arriba |
| `extend` / `finish` | Estar aprobada y no finalizada |
| `update` (editar) | No estar finalizada: sus costos quedaron congelados y cambiar las fechas los movería |
| Asignar stock, vehículos, baqueanos, gastos | No estar finalizada (`assertCampaignEditable`). Un presupuesto sí se edita: es lo que se hace mientras se arma |

### Ciclo de vida

| Endpoint | Qué hace |
|---|---|
| `POST /admin/campaigns` | **Única forma de crear.** Nace siempre como presupuesto (el DTO no acepta otro estado) y **no** crea ítem de gestión: todavía no hay nada que facturar |
| `GET /admin/campaigns?approvalStatus=presupuesto` | Los lista. Sin el parámetro vienen solo las aprobadas, así los presupuestos no ensucian las pantallas de campañas y servicios |
| `GET .../approval-conflicts` | Qué ya no está disponible |
| `POST .../approve` | Reserva el equipamiento y crea el ítem de gestión |
| `POST .../reject` | Lo archiva |
| `POST .../reopen` | Devuelve un rechazado a pendientes |
| `GET .../budget.pdf` | El PDF que se le manda a la empresa |

### El PDF

`BudgetPdfService` arma el documento con `pdfkit`. Las líneas salen de las mismas
asignaciones de la campaña, sin números paralelos: cada asignación es una fila con su
mes, su categoría, su descripción y su importe.

La descripción sale de las **notas** de la asignación cuando las tiene —ahí es donde se
escribe lo que el cliente necesita leer, "traslado de personal con conductor
profesional y experiencia todoterreno"— y si no, se arma con el recurso y los días:
"7 días de alquiler Toyota Hilux DX 2023 4x4".

La descripción automática **nunca incluye el precio unitario**. El importe de una línea
puede venir de un `manual_cost` que no se deriva de ningún "x día", y ahí el desglose
sería directamente falso; el precio que vale es el de la columna Importe. Si en un caso
puntual se lo quiere mostrar, va en las notas de esa asignación, donde se escribe a
mano y se hace cargo quien lo escribe.

`tax_percentage` es el IVA del documento y vive en la campaña porque es del
presupuesto, no del recurso. **No entra en los costos internos**: el `grandTotal` de la
campaña se sigue calculando sin impuesto. Tampoco se aplica sobre las líneas de
baqueanos y animales cuando esas ya traen su propio `tax_percentage`, para no cobrarlo
dos veces.

El logo se lee de `assets/distanterra-logo.png` (copiado a `dist/assets` por
`nest-cli.json`). Si falta, el PDF sale igual con el nombre en texto.

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
