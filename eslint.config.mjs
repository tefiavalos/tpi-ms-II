// Configuración de ESLint (linter) del proyecto.
// ESLint analiza JavaScript; para revisar los archivos .ts primero se les
// quitan los tipos con la función de Node "stripTypeScriptTypes", que deja
// el código en las mismas líneas y columnas (los errores apuntan a la línea
// correcta del archivo original).
import { stripTypeScriptTypes } from "node:module";

// Evita el aviso de "función experimental" de Node en la consola.
process.removeAllListeners("warning");

const quitarTipos = {
  preprocess: (codigo) => [stripTypeScriptTypes(codigo)],
  postprocess: (mensajes) => mensajes.flat(),
};

export const reglas = {
  eqeqeq: "error",
  "no-var": "error",
  "prefer-const": "error",
  "no-empty": "error",
  "no-console": "error",
  complexity: ["error", 8],
  "max-depth": ["error", 3],
  "max-params": ["error", 4],
  "max-lines-per-function": [
    "error",
    { max: 40, skipBlankLines: true, skipComments: true },
  ],
};

export default [
  { ignores: ["dist/**", "node_modules/**", "data/**"] },
  {
    files: ["**/*.ts"],
    plugins: { local: { processors: { "quitar-tipos": quitarTipos } } },
    processor: "local/quitar-tipos",
    languageOptions: { ecmaVersion: 2022, sourceType: "module" },
    rules: reglas,
  },
  {
    // La consola solo se usa en la capa de presentación y en los tests.
    files: ["src/demo.ts", "src/consola/**/*.ts", "tests/**/*.ts"],
    rules: { "no-console": "off" },
  },
  {
    files: ["tests/**/*.ts"],
    rules: { "max-lines-per-function": "off" },
  },
];
