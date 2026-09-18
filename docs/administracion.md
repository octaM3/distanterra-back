# Administración

[← Volver al README](../README.md)

Dos módulos que trabajan juntos: el repositorio de documentos financieros y la vista de
estado de cada servicio prestado. Ambos internos, sin endpoints públicos.

## Documentos financieros

Un archivador de PDFs. Cada documento es de uno de cuatro tipos:

| Tipo | Qué es |
|---|---|
| `factura` | Factura emitida a una empresa cliente |
| `nota_credito` | Nota de crédito, cuando hubo un error en una factura |
| `recibo` | Comprobante de un cobro recibido |
| `resumen_banco` | Resumen bancario mensual |

Cada tipo se guarda en su propia subcarpeta dentro del árbol privado de uploads, así el
repositorio queda ordenado también en disco.

### Campos

| Campo | Notas |
|---|---|
| `docType` | Uno de los cuatro de arriba |
| `companyId` | La empresa a la que se le emitió, opcional |
| `serviceRecordId` | El servicio al que corresponde, opcional |
| `invoiceId` | Solo para notas de crédito: a qué factura pertenecen |
| `documentDate` | Fecha de emisión |
| `statementMonth` | Solo para resúmenes bancarios, en formato `AAAA-MM` |
| `documentNumber` | Número de comprobante |
| `amount` + `currency` | Importe, en `ARS` o `USD` |
| `filePath` | El PDF, obligatorio |

Borrado lógico. Al reemplazar el archivo de un documento existente, el anterior sí se
borra del disco.

## Estado de servicios

La vista que responde "¿esto ya lo facturé? ¿ya me lo pagaron?" para cada servicio
prestado a una empresa.

Cada registro tiene mes de servicio (`AAAA-MM`), empresa, una descripción del servicio y
opcionalmente la campaña asociada — porque no todo servicio es una campaña: puede ser
el alquiler suelto de una camioneta, por ejemplo.

### El estado no se marca a mano

Esto es lo importante del módulo: el estado de facturación y de cobro **se deriva de los
documentos cargados**, no hay un checkbox para marcarlo.

| Si existe... | Entonces el servicio figura como... |
|---|---|
| Una factura asociada | Facturado |
| Un recibo asociado | Cobrado |

La respuesta incluye, además de los booleanos, la fecha, el número, el importe, la
moneda y la URL del archivo de cada uno, más la cantidad de notas de crédito asociadas.

La consecuencia práctica: para marcar algo como facturado hay que subir la factura. No
se puede mentir el estado sin el respaldo.
