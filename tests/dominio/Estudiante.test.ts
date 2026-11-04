import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { DatoInvalido } from "../../src/dominio/errores";
import { Estudiante } from "../../src/dominio/Estudiante";

const datosValidos = {
  legajo: "10001",
  nombre: "Ana Torres",
  email: "ana.torres@mail.com",
};

describe("Estudiante", () => {
  it("rechaza un legajo que no tiene 5 caracteres", () => {
    assert.throws(
      () => new Estudiante({ ...datosValidos, legajo: "123" }),
      DatoInvalido,
    );
  });

  it("rechaza un email sin @", () => {
    assert.throws(
      () => new Estudiante({ ...datosValidos, email: "ana.mail.com" }),
      /email invalido/,
    );
  });

  it("cambia el email si es válido", () => {
    const estudiante = new Estudiante(datosValidos);

    estudiante.cambiarEmail("ana.t@mail.com");

    assert.equal(estudiante.email, "ana.t@mail.com");
  });

  it("si el email nuevo es inválido conserva el anterior", () => {
    const estudiante = new Estudiante(datosValidos);

    assert.throws(() => estudiante.cambiarEmail("ana"), DatoInvalido);
    assert.equal(estudiante.email, "ana.torres@mail.com");
  });
});
