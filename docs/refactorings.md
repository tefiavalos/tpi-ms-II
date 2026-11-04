# Refactorings aplicados

Cada refactoring se hizo en un commit separado y, antes de registrarlo, se ejecutó `npm test` para confirmar que la prueba de caracterización seguía en verde (misma salida por consola y mismo archivo de datos que la versión inicial).

| ID   | Técnica                                                   | Smells que resuelve    | Commit           |
| ---- | --------------------------------------------------------- | ---------------------- | ---------------- |
| R-01 | Extract Method y nombres descriptivos                     | CS-02, CS-04, CS-09    | `refactor(R-01)` |
| R-02 | Reemplazar condicionales por una tabla de reglas          | CS-05, CS-06           | `refactor(R-02)` |
| R-03 | Reemplazar códigos de error por excepciones               | CS-07, CS-10 (consola) | `refactor(R-03)` |
| R-04 | Move Method y reubicación de responsabilidades            | CS-11                  | `refactor(R-04)` |
| R-05 | Extract Class del repositorio e inyección de dependencias | CS-10, CS-01           | `refactor(R-05)` |
| R-06 | Introduce Parameter Object                                | CS-03                  | `refactor(R-06)` |
| R-07 | Extract Class: servicio y reporte                         | CS-01, CS-02           | `refactor(R-07)` |

## R-01 Extract Method

Antes, `generarReporte` filtraba, contaba, calculaba promedios y armaba el texto en un solo método de 48 líneas (complejidad 17). Ahora cada parte es una función con nombre propio:

```ts
return [
  "===== REPORTE DE SOLICITUDES =====",
  `Periodo: ${periodo.toString()}`,
  `Total: ${delPeriodo.length}`,
  lineaPorEstado(delPeriodo),
  ...lineasPorTipo(delPeriodo),
  lineaPromedioDeCierre(delPeriodo, fechaCorte),
  ...lineasDemoradas(delPeriodo, fechaCorte),
  "==================================",
].join("\n");
```

También se extrajeron las búsquedas por id y por legajo y la validación del email, que estaban repetidas.

## R-02 Tabla de reglas en lugar de if-else

Antes (prioridad en `registrarSolicitud` y área en `asignarResponsable`, dos lugares distintos):

```ts
if (tipo == "certificado") { p = "baja"; }
else if (tipo == "equivalencia") { p = "media"; }
...
if (s.tipo == "certificado") area = "Alumnos";
else if (s.tipo == "equivalencia") area = "Coordinación";
```

Después (`src/dominio/reglas.ts`), cada tipo tiene sus reglas en un solo lugar:

```ts
const REGLAS_POR_TIPO: Record<TipoSolicitud, ReglaDeTipo> = {
  certificado: { prioridad: "baja", area: "Alumnos" },
  equivalencia: { prioridad: "media", area: "Coordinación" },
  "reclamo de nota": { prioridad: "alta", area: "Coordinación" },
  "baja de materia": { prioridad: "media", area: "Alumnos" },
};
```

## R-03 Excepciones en lugar de códigos de error

Antes: `console.log("Error: email invalido"); return -1;`. Después: `throw new DatoInvalido("email invalido");`. La capa de consola (`src/consola/mensajes.ts`) es la única que muestra el mensaje, con el mismo texto que antes.

## R-04 Move Method

`calcularDias(s, hoy)` estaba en `GestorSolicitudes` pero solo usaba datos de la solicitud. Pasó a `Solicitud.diasAbierta(fechaCorte)`:

```ts
diasAbierta(fechaCorte: string): number {
  return diasEntre(this.fecha, this._fechaCierre ?? fechaCorte);
}
```

Con el mismo criterio, las reglas de cambio de estado y de asignación de responsable pasaron a la clase `Solicitud`.

## R-05 Extract Class del repositorio (DIP)

La lectura y escritura del archivo salió de la lógica. El servicio recibe una interfaz por constructor:

```ts
constructor(repositorio: RepositorioSolicitudes) {
  this.repositorio = repositorio;
}
```

`RepositorioJson` guarda en archivo y `RepositorioEnMemoria` se usa en las pruebas.

## R-06 Introduce Parameter Object

Antes: `registrarSolicitud(legajo, nombre, email, tipo, descripcion, fecha, urgente)` y `buscar(tipo, estado, prioridad, desde, hasta)`.

Después: `registrarSolicitud(datos: NuevaSolicitud)`, `buscar(filtro: FiltroSolicitudes)` y `RangoFechas` para `desde`/`hasta`:

```ts
const octubre = new RangoFechas("2026-10-01", "2026-10-31");
servicio.buscar({ tipo: "certificado", rango: octubre });
```

## R-07 Extract Class: servicio y reporte

`GestorSolicitudes` se eliminó. Sus responsabilidades quedaron repartidas en `ServicioSolicitudes` (casos de uso) y `ReporteSolicitudes` (reporte). El reporte depende de `LectorSolicitudes`, que solo tiene `listar()` (ISP).
