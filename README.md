# Gestión de Solicitudes Académicas

Trabajo Práctico Integrador de Metodología de Sistemas II (TUP – UTN).
Integrantes: Andrea Ayala y Estefanía Avalos.

Sistema para registrar solicitudes de estudiantes (certificados, equivalencias, reclamos de nota y bajas de materia), clasificarlas por tipo, prioridad y estado, asignarles un responsable, buscarlas y generar un reporte. El trabajo parte de una versión inicial que funcionaba pero tenía problemas de calidad interna, y la mejora mediante refactoring seguro.

## Participación

- Estefanía Avalos: sistema base, diagnóstico y refactorings (commits 1 a 12).
- Andrea Ayala: pruebas, code review, correcciones y documentación final (commits 13 a 23).

## Funcionalidades

- Registrar una solicitud (valida legajo, email, descripción y tipo; calcula la prioridad).
- Asignar el responsable del área que corresponde al tipo de solicitud.
- Cambiar el estado: pendiente → en curso → resuelta, o rechazada.
- Actualizar el email de un estudiante.
- Buscar solicitudes por tipo, estado, prioridad y rango de fechas.
- Generar un reporte por período: totales por estado y tipo, promedio de días hasta el cierre y solicitudes demoradas.

Los datos se guardan en `data/solicitudes.json`. Todos los datos de ejemplo son ficticios.

## Tecnologías

- TypeScript 6 y Node.js 22.13 o superior.
- `node:test` para las pruebas y la cobertura.
- Prettier (formato) y ESLint (linter).
- Pre-commit hook de Git.

## Instalación y uso

```bash
npm install          # instala las herramientas y activa el pre-commit hook
npm run demo         # compila y ejecuta un recorrido completo del sistema
npm test             # compila, corre las pruebas y mide la cobertura
```

| Script                 | Qué hace                                               |
| ---------------------- | ------------------------------------------------------ |
| `npm run build`        | Compila con `tsc` a `dist/`.                           |
| `npm run demo`         | Ejecuta el recorrido de prueba (`src/demo.ts`).        |
| `npm test`             | Pruebas y cobertura; falla si baja del 80%.            |
| `npm run lint`         | ESLint sobre `src` y `tests`.                          |
| `npm run format:check` | Verifica el formato con Prettier.                      |
| `npm run metricas`     | Tabla de líneas, complejidad y parámetros por función. |

## Estructura

```
src/
  dominio/       Solicitud, Estudiante, RangoFechas, tipos, reglas, validaciones y errores
  servicios/     ServicioSolicitudes (casos de uso) y ReporteSolicitudes
  repositorio/   interfaces y repositorios en memoria y JSON
  consola/       mensajes que ve el usuario
  demo.ts        recorrido de prueba
tests/           pruebas unitarias, de contrato y de caracterización
docs/            diagnóstico, refactorings, pruebas, code review, decisiones, UML y evidencias
scripts/         script de métricas
```

## Etapas del trabajo (tags)

| Tag                    | Contenido                                                          |
| ---------------------- | ------------------------------------------------------------------ |
| `estado-inicial`       | Versión inicial del sistema, con los problemas de diseño.          |
| `etapa-diagnostico`    | Herramientas de análisis, prueba de caracterización y diagnóstico. |
| `etapa-refactoring`    | Refactorings aplicados, uno por commit.                            |
| `etapa-pruebas`        | Pruebas unitarias, cobertura y pre-commit hook.                    |
| `etapa-docs`           | Code review, correcciones y documentación.                         |
| `estado-refactorizado` | Versión final.                                                     |

Para ver la versión inicial: `git checkout estado-inicial` y luego `npm run demo`.

## Documentación

- [Diagnóstico](docs/diagnostico.md)
- [Refactorings](docs/refactorings.md)
- [Pruebas](docs/pruebas.md)
- [Code review](docs/code-review.md)
- [Decisiones técnicas](docs/decisiones-tecnicas.md)
- Diagramas de clases: [antes](docs/uml/antes.png) y [después](docs/uml/despues.png)
- Evidencias: `docs/evidencias/antes` y `docs/evidencias/despues`
