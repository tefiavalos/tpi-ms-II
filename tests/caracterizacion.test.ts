import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Prueba de caracterización ("golden master"): ejecuta el recorrido completo
// del sistema (npm run demo) y compara lo que se muestra por consola y el
// archivo de datos generado con lo que producía la versión inicial.
// Si un refactoring cambia el comportamiento externo, esta prueba falla.
const RAIZ = path.resolve(__dirname, "../..");
const ESPERADOS = path.join(RAIZ, "tests", "caracterizacion");

describe("Caracterización del comportamiento externo", () => {
  const carpeta = mkdtempSync(path.join(tmpdir(), "solicitudes-"));
  const salida = execFileSync(
    process.execPath,
    [path.join(RAIZ, "dist", "src", "demo.js")],
    { cwd: carpeta, encoding: "utf-8" },
  );

  it("la salida por consola es igual a la de la versión inicial", () => {
    const esperada = readFileSync(
      path.join(ESPERADOS, "salida-esperada.txt"),
      "utf-8",
    );
    assert.equal(salida, esperada);
  });

  it("el archivo de datos es igual al de la versión inicial", () => {
    const datos = readFileSync(
      path.join(carpeta, "data", "solicitudes.json"),
      "utf-8",
    );
    const esperados = readFileSync(
      path.join(ESPERADOS, "datos-esperados.json"),
      "utf-8",
    );
    assert.deepEqual(JSON.parse(datos), JSON.parse(esperados));
  });
});
