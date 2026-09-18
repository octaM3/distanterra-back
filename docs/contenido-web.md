# Contenido del sitio

[← Volver al README](../README.md)

Los módulos que alimentan la landing pública. Todos tienen lectura pública sin
autenticación y un ABM bajo `/api/admin/...` protegido por JWT.

## Módulos

### Experiencias

Los proyectos y servicios que se muestran en el sitio. Cada uno tiene título, ubicación
opcional y una descripción rica (ver [Bloques de descripción](#bloques-de-descripción)).

Borrado lógico: al eliminar una, se marca como borrada pero la fila queda.

### Comentarios (testimonios)

Nombre del cliente, foto y comentario. La foto se guarda tal como llega, sin optimizar.

Borrado lógico.

### Imágenes (logos)

Los logos de partners que aparecen al pie de la landing. Se guardan sin optimizar.

Borrado físico: al eliminar uno, se borran juntos el archivo y la fila.

### Galería

Fotos con orden de visualización. El listado público es paginado (`limit` por defecto
16, máximo 48) y responde `{ items, hasMore }`.

Las imágenes se optimizan al subirlas (ver [uploads.md](uploads.md)).

Borrado físico: archivo y fila juntos.

### Mensajes de contacto

El formulario del pie y el de `/contacto` hacen `POST /contact`, sin autenticación. El
panel los lista, los marca como leídos (hay un contador de no leídos para el badge del
menú) y los borra.

Borrado físico: acá no hay borrado lógico, un mensaje eliminado desaparece.

Este endpoint es el único público que acepta escritura, así que tiene tres capas contra
spam — rate limit propio, honeypot y enfriamiento por email. Están explicadas en
[autenticacion-y-seguridad.md](autenticacion-y-seguridad.md#protecciones-del-formulario-de-contacto).

## Contenido bilingüe

Todo campo con texto redactable se guarda dos veces, con sufijo `Es` y `En`:
`commentEs` / `commentEn`, `titleEs` / `titleEn`, y así.

El sitio público elige el campo según el idioma activo de `i18next`. El panel muestra
los dos campos lado a lado al editar.

## Bloques de descripción

`descriptionEs` y `descriptionEn` de una experiencia no son texto plano sino un array
JSON de bloques, para poder mezclar párrafos y listas en cualquier orden:

```json
[
  { "type": "text", "content": "Un párrafo..." },
  { "type": "list", "items": ["Primer ítem", "Segundo ítem"] },
  { "type": "text", "content": "Párrafo de cierre..." }
]
```

## Resumen de borrados

Cuál borra de verdad y cuál solo marca:

| Módulo | Tipo de borrado |
|---|---|
| Experiencias | Lógico |
| Comentarios | Lógico |
| Logos | Físico (archivo + fila) |
| Galería | Físico (archivo + fila) |
| Mensajes de contacto | Físico |
