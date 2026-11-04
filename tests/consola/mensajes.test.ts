import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";

import {
  ejecutar,
  listadoDeBusqueda,
  mensajeRegistro,
} from "../../src/consola/mensajes";
import { NoEncontrado } from "../../src/dominio/errores";
import { Solicitud } from "../../src/dominio/Solicitud";

const solicitud = new Solicitud({
  id: 4,
  legajo: "10001",
  tipo: "baja de materia",
  descripcion: "Baja de Base de Datos I",
  fecha: "2026-10-20",
  prioridad: "media",
  estado: "pendiente",
  responsable: null,
  fechaCierre: null,
});

describe("mensajes de consola", () => {
  it("arma el mensaje de registro", () => {
    assert.equal(
      mensajeRegistro(solicitud),
      "Solicitud #4 registrada: baja de materia (prioridad media)",
    );
  });

  it("arma el listado de una búsqueda", () => {
    assert.equal(
      listadoDeBusqueda([solicitud]),
      "Resultados de la busqueda: 1\n  #4 | 20/10/2026 | baja de materia | media | pendiente",
    );
  });

  it("muestra los errores esperados como 'Error: ...'", () => {
    const log = mock.method(console, "log", () => {});

    ejecutar(() => {
      throw new NoEncontrado("no existe la solicitud #99");
    });

    assert.equal(
      log.mock.calls[0].arguments[0],
      "Error: no existe la solicitud #99",
    );
    log.mock.restore();
  });

  it("no oculta los errores inesperados", () => {
    assert.throws(
      () =>
        ejecutar(() => {
          throw new TypeError("falla inesperada");
        }),
      TypeError,
    );
  });
});
