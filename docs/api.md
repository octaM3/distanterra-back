# Referencia de la API

[← Volver al README](../README.md)

Todas las rutas van con el prefijo `/api`. La columna **Auth** indica si hace falta la
cookie de sesión de admin.

## Autenticación

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| POST | `/{ADMIN_LOGIN_PATH}` | — | Login. Devuelve la cookie de sesión |
| POST | `/admin/logout` | JWT | Borra la cookie |
| GET | `/admin/me` | JWT | Identidad del admin actual |
| POST | `/admin/change-password` | JWT | Cambiar la propia contraseña (requiere la actual) |

## Contenido del sitio

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| GET | `/experiences` | — | Experiencias activas |
| GET | `/admin/experiences` | JWT | Todas, incluidas las borradas |
| POST | `/admin/experiences` | JWT | Crear |
| PUT | `/admin/experiences/:id` | JWT | Editar |
| DELETE | `/admin/experiences/:id` | JWT | Borrado lógico |
| GET | `/comments` | — | Testimonios activos |
| GET | `/admin/comments` | JWT | Todos |
| POST | `/admin/comments` | JWT | Crear (multipart, campo `photo`) |
| PUT | `/admin/comments/:id` | JWT | Editar (multipart, `photo` opcional) |
| DELETE | `/admin/comments/:id` | JWT | Borrado lógico |
| GET | `/images` | — | Logos de partners |
| GET | `/admin/images` | JWT | Logos |
| POST | `/admin/images` | JWT | Subir logo (multipart, campo `image`) |
| PUT | `/admin/images/:id` | JWT | Editar metadatos |
| DELETE | `/admin/images/:id` | JWT | Borra archivo y fila |
| GET | `/gallery?offset=&limit=` | — | Galería paginada. `limit` por defecto 16, máximo 48. Responde `{ items, hasMore }` |
| GET | `/admin/gallery` | JWT | Galería completa, sin paginar |
| POST | `/admin/gallery` | JWT | Subir foto (multipart, `image`). Se optimiza |
| PUT | `/admin/gallery/:id` | JWT | Editar metadatos |
| DELETE | `/admin/gallery/:id` | JWT | Borra archivo y fila |
| POST | `/contact` | — | Enviar el formulario de contacto |
| GET | `/admin/contact-messages` | JWT | Mensajes, del más nuevo al más viejo |
| GET | `/admin/contact-messages/unread-count` | JWT | Cantidad de no leídos, para el badge |
| PUT | `/admin/contact-messages/:id/read` | JWT | Marcar como leído |
| DELETE | `/admin/contact-messages/:id` | JWT | Borrado físico |

## Catálogos de campañas

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| GET POST PUT DELETE | `/admin/companies[/:id]` | JWT | Empresas cliente. Borrado lógico |
| GET POST PUT DELETE | `/admin/stock-categories[/:id]` | JWT | Categorías del catálogo de stock |
| GET POST PUT DELETE | `/admin/stock-items[/:id]` | JWT | Catálogo de equipamiento. El listado incluye `lockedQuantity` y `availableQuantity` calculados (criterio conservador, sin mirar fechas) |
| GET | `/admin/stock-items/:id/schedule` | JWT | Asignaciones vigentes de ese ítem, para pintar el calendario del modal |
| GET POST PUT DELETE | `/admin/vehicles[/:id]` | JWT | Catálogo de vehículos. El listado incluye `isAvailable`, `lockedInCampaignId`, `lockedInCampaignName` |
| GET | `/admin/vehicles/:id/schedule` | JWT | Asignaciones vigentes de ese vehículo |

## Campañas

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| GET POST | `/admin/campaigns` | JWT | Listar y crear |
| GET PUT DELETE | `/admin/campaigns/:id` | JWT | Detalle completo (recursos, gastos, bitácora y totales), editar, borrado lógico |
| PUT | `/admin/campaigns/:id/extend` | JWT | Estirar la fecha de fin. Deja entrada en la bitácora |
| POST | `/admin/campaigns/:id/finish` | JWT | Terminar y liberar stock y vehículos |
| GET | `/admin/campaigns/:id/export` | JWT | Descargar el reporte en Excel |
| POST PUT DELETE | `/admin/campaigns/:id/stock-items[/:itemId]` | JWT | Asignar, editar o liberar stock |
| POST PUT DELETE | `/admin/campaigns/:id/vehicles[/:assignmentId]` | JWT | Asignar, editar o liberar un vehículo |
| POST PUT DELETE | `/admin/campaigns/:id/guides[/:assignmentId]` | JWT | Baqueanos. Precio e impuesto van en el request |
| POST PUT DELETE | `/admin/campaigns/:id/pack-animals[/:assignmentId]` | JWT | Animales de carga. Tipo, precio e impuesto van en el request |
| POST PUT DELETE | `/admin/campaigns/:id/expenses[/:expenseId]` | JWT | Gastos extra (multipart, `invoice` opcional) |
| POST PUT DELETE | `/admin/campaigns/:id/activity-logs[/:logId]` | JWT | Entradas de la bitácora |

Las asignaciones de los cuatro tipos requieren `startDate` y `endDate` dentro del rango
de la campaña. Stock y vehículos además se validan contra la disponibilidad.

## Empleados

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| GET | `/admin/employees` | JWT | Listado con el estado de cobertura de cada uno |
| GET | `/admin/employees/:id` | JWT | Detalle con exámenes y pólizas |
| POST | `/admin/employees` | JWT | Crear (multipart, fotos de DNI opcionales) |
| PUT | `/admin/employees/:id` | JWT | Editar |
| DELETE | `/admin/employees/:id` | JWT | Borrado lógico |
| POST PUT DELETE | `/admin/employees/:employeeId/medical-exams[/:id]` | JWT | Exámenes médicos (multipart, PDF) |
| POST PUT DELETE | `/admin/employees/:employeeId/insurance-policies[/:id]` | JWT | Pólizas de seguro (multipart, PDF) |

## Administración

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| GET | `/admin/financial-documents?docType=` | JWT | Documentos, filtrables por tipo |
| POST | `/admin/financial-documents` | JWT | Subir (multipart, PDF obligatorio) |
| PUT | `/admin/financial-documents/:id` | JWT | Editar. El PDF es opcional |
| DELETE | `/admin/financial-documents/:id` | JWT | Borrado lógico |
| GET | `/admin/service-records` | JWT | Estado de facturación y cobro de cada servicio |
| PUT | `/admin/service-records/:id` | JWT | Editar los datos del servicio |

## Mapa

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| GET POST PUT DELETE | `/admin/puntos-interes[/:id]` | JWT | Puntos de interés. El listado omite teléfono y comentario |
| GET | `/admin/trackings` | JWT | Listado de recorridos |
| GET | `/admin/trackings/:id` | JWT | Detalle con los puntos del recorrido |
| POST | `/admin/trackings` | JWT | Subir un `.kmz` (multipart) |
| PATCH | `/admin/trackings/:id` | JWT | Editar nombre y descripción |
| DELETE | `/admin/trackings/:id` | JWT | Borra archivo y fila |

## Archivos

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| GET | `/admin/files/<ruta>` | JWT | Entrega un archivo del árbol privado. La ruta es la relativa guardada en la base, por ejemplo `medical-exams/<uuid>.pdf` |

Los archivos públicos **no** pasan por acá: conservan su URL estática `/uploads/...`.
Ver [uploads.md](uploads.md).
