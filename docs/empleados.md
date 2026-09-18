# Empleados

[← Volver al README](../README.md)

Los legajos del personal: datos personales, documentación obligatoria y datos para
pagarles. Módulo interno, sin endpoints públicos.

Toda la documentación que se sube acá va al árbol privado de uploads y solo se puede
abrir con sesión de admin (ver [uploads.md](uploads.md)).

## Datos del legajo

| Campo | Tipo | Notas |
|---|---|---|
| `fullName` | Texto | |
| `dni` | Texto | Único entre los empleados vigentes, respaldado por un índice parcial |
| `birthDate` | Fecha | |
| `dniFrontImagePath` / `dniBackImagePath` | Imagen | Frente y dorso del documento. Opcionales, se optimizan al subirse |
| `hasPpe` | Booleano | Si ya se le entregó el equipo de protección personal |
| `employmentStatus` | Enum | `Monotributo`, `Mes de prueba` o `En blanco` |
| `bankCvu` / `bankAlias` / `bankHolder` | Texto | Para poder pagarle |
| `dailyRateArs` / `dailyRateUsd` | Numérico | Cuánto cobra por día, en cada moneda |
| `notes` | Texto libre | |

Borrado lógico: dar de baja a un empleado marca la fila, no la elimina.

## Exámenes médicos

Cada empleado puede tener varios. Cada uno lleva fecha de realización, fecha de
vencimiento y un PDF obligatorio.

Son obligatorios por normativa de seguridad e higiene: sin el preocupacional aprobado un
trabajador no puede empezar a trabajar. La app los guarda para tener a mano el
comprobante y para avisar cuándo vencen.

Endpoints anidados bajo el empleado: `/admin/employees/:employeeId/medical-exams`.

Borrado lógico.

## Pólizas de seguro

También varias por empleado. Cada una tiene tipo de seguro (texto libre: vida,
incapacidad, etc.), el rango de fechas que cubre y un PDF obligatorio.

Endpoints anidados: `/admin/employees/:employeeId/insurance-policies`.

Borrado lógico.

## Cómo se arma el listado

El listado de empleados no trae toda la documentación de cada uno. En su lugar hace dos
consultas agregadas que traen, por empleado, **el vencimiento más lejano** de cada tipo
de documento. Con eso alcanza para saber si hoy está cubierto, sin arrastrar todos los
documentos de todos.

El detalle de un empleado sí devuelve la lista completa de exámenes y pólizas, ordenados
por vencimiento descendente, cada uno con la URL de su archivo.

## Una limitación conocida

Al dar de baja a un empleado se marca la fila como borrada, pero **los archivos siguen en
disco**. Solo se borra el archivo anterior cuando se lo reemplaza por uno nuevo.

En la práctica eso significa que la documentación de alguien que ya no trabaja en la
empresa se conserva indefinidamente. Está protegida detrás del login, pero no hay
ninguna política de retención ni borrado automático. Si se define un plazo, hay que
implementarlo.
