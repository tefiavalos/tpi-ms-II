import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { ErrorDePersistencia } from "../../src/dominio/errores";
import { Estudiante } from "../../src/dominio/Estudiante";
import { Solicitud } from "../../src/dominio/Solicitud";
import { RepositorioEnMemoria } from "../../src/repositorio/RepositorioEnMemoria";
import { RepositorioJson } from "../../src/repositorio/RepositorioJson";
import type { RepositorioSolicitudes } from "../../src/repositorio/RepositorioSolicitudes";

const carpeta = mkdtempSync(path.join(tmpdir(), "repositorio-"));
after(() => rmSync(carpeta, { recursive: true, force: true }));
let numeroDeArchivo = 0;
function archivoNuevo(): string {
  numeroDeArchivo++;
  return path.join(carpeta, `datos-${numeroDeArchivo}.json`);
}

function solicitudDePrueba(id: number): Solicitud {
  return new Solicitud({
    id,
    legajo: "10001",
    tipo: "certificado",
    descripcion: "Certificado de alumno regular",
    fecha: "2026-10-01",
    prioridad: "baja",
    estado: "pendiente",
    responsable: null,
    fechaCierre: null,
  });
}

// Contrato: las mismas pruebas se ejecutan sobre cada implementación.
// Si las dos las pasan, se pueden intercambiar sin romper el sistema (LSP).
function contratoDeRepositorio(
  nombre: string,
  crear: () => RepositorioSolicitudes,
): void {
  describe(`Contrato del repositorio: ${nombre}`, () => {
    it("genera ids correlativos desde 1", () => {
      const repositorio = crear();
      assert.equal(repositorio.siguienteId(), 1);
      assert.equal(repositorio.siguienteId(), 2);
    });

    it("guarda y encuentra una solicitud por id", () => {
      const repositorio = crear();
      repositorio.guardar(solicitudDePrueba(1));

      assert.equal(repositorio.buscarPorId(1)?.id, 1);
      assert.equal(repositorio.buscarPorId(2), undefined);
      assert.equal(repositorio.listar().length, 1);
    });

    it("guardar dos veces la misma solicitud no la duplica", () => {
      const repositorio = crear();
      const solicitud = solicitudDePrueba(1);
      repositorio.guardar(solicitud);
      repositorio.guardar(solicitud);

      assert.equal(repositorio.listar().length, 1);
    });

    it("guarda y encuentra estudiantes por legajo", () => {
      const repositorio = crear();
      repositorio.guardarEstudiante(
        new Estudiante({
          legajo: "10001",
          nombre: "Ana Torres",
          email: "ana.torres@mail.com",
        }),
      );

      assert.equal(repositorio.buscarEstudiante("10001")?.nombre, "Ana Torres");
      assert.equal(repositorio.buscarEstudiante("10002"), undefined);
    });
  });
}

contratoDeRepositorio("en memoria", () => new RepositorioEnMemoria());
contratoDeRepositorio("JSON", () => new RepositorioJson(archivoNuevo()));

describe("RepositorioJson", () => {
  it("conserva los datos al volver a abrir el archivo", () => {
    // Arrange
    const archivo = archivoNuevo();
    const primero = new RepositorioJson(archivo);
    primero.guardar(solicitudDePrueba(primero.siguienteId()));

    // Act
    const segundo = new RepositorioJson(archivo);

    // Assert
    assert.equal(segundo.listar().length, 1);
    assert.equal(segundo.siguienteId(), 2);
  });

  it("si el archivo está dañado avisa y no lo pisa", () => {
    // Arrange
    const archivo = archivoNuevo();
    writeFileSync(archivo, "{ esto no es JSON");

    // Act
    const abrir = () => new RepositorioJson(archivo);

    // Assert
    assert.throws(abrir, ErrorDePersistencia);
    assert.equal(readFileSync(archivo, "utf-8"), "{ esto no es JSON");
  });
});
