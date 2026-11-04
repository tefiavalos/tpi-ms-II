// Arma una tabla con métricas de cada función del código fuente:
// líneas, complejidad ciclomática y cantidad de parámetros.
// Usa ESLint con umbrales mínimos para que informe el valor de TODAS las
// funciones, y después ordena esos valores en una tabla.
import { ESLint } from "eslint";

const carpeta = process.argv[2] ?? "src";
const eslint = new ESLint({
  overrideConfig: {
    rules: {
      eqeqeq: "off",
      "no-var": "off",
      "prefer-const": "off",
      "no-empty": "off",
      "no-console": "off",
      "max-depth": "off",
      complexity: ["warn", 0],
      "max-params": ["warn", 0],
      "max-lines-per-function": [
        "warn",
        { max: 0, skipBlankLines: true, skipComments: true },
      ],
    },
  },
});

const metricas = new Map();
for (const archivo of await eslint.lintFiles([carpeta])) {
  const nombreArchivo = archivo.filePath.split(/[\\/]/).slice(-2).join("/");
  for (const m of archivo.messages) {
    const funcion = m.message.match(/^(.*?) has/)?.[1] ?? "?";
    const valor = Number(
      m.message
        .match(/\((\d+)\)|of (\d+)/)
        ?.slice(1)
        .find(Boolean),
    );
    const clave = `${nombreArchivo}:${m.line} ${funcion}`;
    const fila = metricas.get(clave) ?? {
      lineas: 0,
      complejidad: 1,
      parametros: 0,
    };
    if (m.ruleId === "max-lines-per-function") fila.lineas = valor;
    if (m.ruleId === "complexity") fila.complejidad = valor;
    if (m.ruleId === "max-params") fila.parametros = valor;
    metricas.set(clave, fila);
  }
}

console.log("Función".padEnd(62) + "Líneas  Complejidad  Parámetros");
for (const [clave, f] of metricas) {
  // Se omiten los inicializadores de campos y las funciones flecha internas.
  if (f.lineas === 0 || clave.includes("Arrow function")) continue;
  console.log(
    clave.padEnd(62) +
      String(f.lineas).padStart(6) +
      String(f.complejidad).padStart(13) +
      String(f.parametros).padStart(12),
  );
}
