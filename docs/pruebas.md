# Pruebas y verificación del comportamiento

## Cómo se verificó que el refactoring no cambió el comportamiento

1. **Prueba de caracterización (golden master)**. Antes de tocar el código se guardó lo que producía la versión inicial al ejecutar `npm run demo`: la salida por consola (`tests/caracterizacion/salida-esperada.txt`) y el archivo de datos (`tests/caracterizacion/datos-esperados.json`). La prueba `tests/caracterizacion.test.ts` vuelve a ejecutar el recorrido y compara. Se corrió después de cada refactoring y siempre dio verde.
2. **Comparación de la ejecución antes/después**. `docs/evidencias/antes/demo.txt` y `docs/evidencias/despues/demo.txt` son idénticos (`docs/evidencias/despues/diferencias-demo.txt`).
3. **Pruebas unitarias** de cada capa, con el patrón AAA (Arrange, Act, Assert), casos de borde y errores esperados.
4. **Cobertura mínima del 80%** de líneas, ramas y funciones. Si no se alcanza, `npm test` falla.
5. **Pre-commit hook** (`.githooks/pre-commit`): antes de cada commit corre Prettier, ESLint, la compilación y los tests. Si algo falla, el commit se cancela.

## Casos de prueba

| Archivo                                       | Casos | Qué verifica                                                                                                                         |
| --------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/caracterizacion.test.ts`               | 2     | Salida por consola y archivo de datos iguales a la versión inicial.                                                                  |
| `tests/dominio/reglas.test.ts`                | 8     | Prioridad por tipo, urgencia (incluida la prioridad alta), área, tipos válidos y circuito de estados.                                |
| `tests/dominio/Solicitud.test.ts`             | 8     | Cambios de estado permitidos y prohibidos, responsable obligatorio, fecha de cierre, días abierta.                                   |
| `tests/dominio/Estudiante.test.ts`            | 4     | Validación de legajo y email; un email inválido no reemplaza al anterior.                                                            |
| `tests/dominio/fechas.test.ts`                | 6     | Formato de fecha, días entre fechas, límites de `RangoFechas` y rango inválido.                                                      |
| `tests/servicios/ServicioSolicitudes.test.ts` | 12    | Registro, datos inválidos sin guardar nada, asignación, cambio de estado (con mock del repositorio), email y búsquedas.              |
| `tests/servicios/ReporteSolicitudes.test.ts`  | 4     | Conteos, promedio de cierre, demoradas y período (con stub del repositorio).                                                         |
| `tests/repositorio/contrato.test.ts`          | 10    | Las 4 pruebas de contrato se ejecutan sobre `RepositorioEnMemoria` y `RepositorioJson` (LSP); además, persistencia y archivo dañado. |
| `tests/consola/mensajes.test.ts`              | 4     | Textos que ve el usuario; los errores inesperados no se ocultan.                                                                     |

## Dobles de prueba

- **Stub**: en el reporte se reemplaza el repositorio por un objeto que devuelve una lista fija (`lectorStub`). Así se prueba el cálculo sin depender de cómo se guardan los datos.
- **Mock**: en el servicio se registra cuántas veces se llama a `guardar` (`mock.method`). Se verifica que un cambio de estado guarda una sola vez y que una operación rechazada no guarda nada.

## Resultado

```
ℹ tests 58
ℹ pass 58
ℹ fail 0
all files | line 98.33% | branch 95.54% | funcs 96.74%
```

El detalle completo está en `docs/evidencias/despues/tests.txt`.
