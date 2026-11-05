# Code review

Revisión del código refactorizado (tag `etapa-pruebas`) antes de darlo por terminado. Se revisó por categorías, con el checklist de abajo, y cada observación se corrigió en un commit propio.

Revisora: Andrea Ayala. Código revisado: la versión refactorizada, escrita por Estefanía Avalos.

## Checklist técnico

| Categoría              | Pregunta                                                           | Resultado                                         |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| Lógica y funcionalidad | ¿Hace lo que tiene que hacer? (prueba de caracterización en verde) | Cumple                                            |
| Lógica y funcionalidad | ¿Cubre los casos de borde?                                         | Observado: CR-02, CR-04                           |
| Legibilidad            | ¿Los nombres son descriptivos?                                     | Cumple                                            |
| Legibilidad            | ¿Hay números o textos "mágicos" sin explicar?                      | Observado: CR-01                                  |
| Legibilidad            | ¿Un desarrollador nuevo lo entiende sin preguntar?                 | Cumple (comentarios en clases e interfaces)       |
| Diseño y arquitectura  | ¿Cada clase tiene una sola responsabilidad (SRP)?                  | Cumple                                            |
| Diseño y arquitectura  | ¿Se puede extender sin modificar lo que funciona (OCP)?            | Cumple (tabla de reglas)                          |
| Diseño y arquitectura  | ¿Depende de abstracciones (DIP)?                                   | Cumple (repositorio por interfaz)                 |
| Diseño y arquitectura  | ¿Hay código duplicado (DRY)?                                       | Cumple                                            |
| Manejo de errores      | ¿Hay errores silenciados o catch vacíos?                           | Observado: CR-03                                  |
| Manejo de errores      | ¿Se usan excepciones en lugar de códigos de error?                 | Cumple                                            |
| Estilo y compilación   | ¿Pasa Prettier, ESLint y compila sin advertencias?                 | Observado: CR-05                                  |
| Pruebas                | ¿Los cambios tienen pruebas y la cobertura supera el 80%?          | Cumple (98,6% de líneas)                          |
| Seguridad              | ¿Hay datos personales reales o sensibles en el repositorio?        | Cumple: datos ficticios y `data/` en `.gitignore` |
| Rendimiento            | ¿Hay recorridos innecesarios?                                      | Cumple para el volumen actual (ver CR-06)         |

## Observaciones y feedback

| ID    | Categoría         | Ubicación                                                | Observación y feedback                                                                                                                                                                                                                                                                                                                                                                  | Acción                                                                                     |
| ----- | ----------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| CR-01 | Legibilidad       | `src/servicios/ReporteSolicitudes.ts` l. 79 y 87         | El 7 de "solicitud demorada" aparece en el cálculo y en el texto. Si cambia el criterio hay que acordarse de los dos lugares. Propuesta: una constante con nombre.                                                                                                                                                                                                                      | Corregido en el commit `fix(CR-01)`: constante `DIAS_PARA_DEMORA`.                         |
| CR-02 | Casos de borde    | `src/dominio/RangoFechas.ts` l. 11                       | Se puede crear un rango con `desde` posterior a `hasta`; la búsqueda devuelve una lista vacía sin avisar y el error pasa desapercibido. Propuesta: validar en el constructor y lanzar `DatoInvalido`.                                                                                                                                                                                   | Corregido en el commit `fix(CR-02)`, con prueba nueva.                                     |
| CR-03 | Manejo de errores | `src/repositorio/RepositorioJson.ts` l. 44               | El `catch` tiene un comentario, por eso el linter no lo marca, pero sigue ocultando todos los errores: si el archivo existe y está dañado, se arranca vacío y en el siguiente guardado se pierden los datos (el mismo riesgo de CS-08). Está bien que un archivo inexistente no sea un error; propuesta: tratar solo ese caso y lanzar un error claro si el contenido no se puede leer. | Corregido en el commit `fix(CR-03)`: `ErrorDePersistencia` y prueba con un archivo dañado. |
| CR-04 | Pruebas           | `tests/dominio/reglas.test.ts` l. 21                     | Falta el caso de una solicitud urgente que ya tiene prioridad alta (debe quedar en alta). Propuesta: agregar ese caso.                                                                                                                                                                                                                                                                  | Corregido en el commit `test(CR-04)`.                                                      |
| CR-05 | Compilación       | `tsconfig.json` l. 7                                     | Sigue `"strict": false` de la versión inicial. Hoy el código compila en modo estricto, pero sin la opción activada el compilador no va a avisar si alguien agrega código sin tipos. Propuesta: activar `strict`, `noUnusedLocals` y `noImplicitReturns`.                                                                                                                                | Corregido en el commit `fix(CR-05)`.                                                       |
| CR-06 | Rendimiento       | `ServicioSolicitudes.buscar`                             | La búsqueda recorre todas las solicitudes. Para el volumen del sistema es suficiente; si se pasa a una base de datos, el filtro debería hacerse en la consulta.                                                                                                                                                                                                                         | Sin cambios (mejora futura)                                                                |
| CR-07 | Legibilidad       | `src/dominio/validaciones.ts`, `src/consola/mensajes.ts` | Los mensajes que ve el usuario no tienen tildes ("invalido", "esta"). Se heredan de la versión inicial; corregirlos cambia la salida visible.                                                                                                                                                                                                                                           | Sin cambios: se mantiene igual el comportamiento externo. Mejora futura.                   |

Aspectos positivos: la tabla de reglas deja cada tipo de solicitud en un solo lugar; el servicio recibe el repositorio por constructor y eso permitió probarlo sin escribir en disco; las pruebas de contrato muestran que las dos implementaciones del repositorio son intercambiables.

## Criterios de aceptación técnica

| Criterio                                                    | Cómo se verifica                                    | Estado                    |
| ----------------------------------------------------------- | --------------------------------------------------- | ------------------------- |
| Compila sin errores en modo estricto                        | `npm run build`                                     | Cumple (después de CR-05) |
| El 100% de las pruebas pasa                                 | `npm test`                                          | Cumple                    |
| Cobertura mínima del 80% (líneas, ramas, funciones)         | `npm test` falla si no se alcanza                   | Cumple                    |
| Formato y estilo del proyecto                               | `npm run format:check` y `npm run lint`             | Cumple                    |
| Funciones con complejidad ≤ 8, ≤ 40 líneas y ≤ 4 parámetros | Reglas de ESLint                                    | Cumple                    |
| No hay errores silenciados                                  | Revisión manual y regla `no-empty`                  | Cumple (después de CR-03) |
| La lógica no escribe en consola ni accede a archivos        | Regla `no-console`; solo `RepositorioJson` usa `fs` | Cumple                    |
| No cambia el comportamiento externo                         | Prueba de caracterización                           | Cumple                    |
| No hay datos personales reales                              | Revisión manual                                     | Cumple                    |

## Resultado de la revisión

Con las correcciones aplicadas se volvió a ejecutar todo el control: Prettier y ESLint sin errores, compilación en modo estricto, 58 pruebas en verde (incluida la de caracterización) y cobertura superior al 80%. Se cumplen todos los criterios de aceptación técnica y el código se aprueba. CR-06 y CR-07 quedan registradas como mejoras futuras.
