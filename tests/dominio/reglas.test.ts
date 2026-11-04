import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  areaResponsable,
  esEstadoFinal,
  esTipoValido,
  prioridadInicial,
  transicionPermitida,
} from "../../src/dominio/reglas";

describe("reglas por tipo de solicitud", () => {
  it("asigna la prioridad base de cada tipo", () => {
    // Arrange / Act / Assert
    assert.equal(prioridadInicial("certificado", false), "baja");
    assert.equal(prioridadInicial("equivalencia", false), "media");
    assert.equal(prioridadInicial("reclamo de nota", false), "alta");
    assert.equal(prioridadInicial("baja de materia", false), "media");
  });

  it("si es urgente sube la prioridad un nivel", () => {
    assert.equal(prioridadInicial("certificado", true), "media");
    assert.equal(prioridadInicial("equivalencia", true), "alta");
  });

  it("asigna el área responsable según el tipo", () => {
    assert.equal(areaResponsable("certificado"), "Alumnos");
    assert.equal(areaResponsable("reclamo de nota"), "Coordinación");
  });

  it("reconoce solo los tipos definidos", () => {
    assert.equal(esTipoValido("equivalencia"), true);
    assert.equal(esTipoValido("titulo"), false);
    // Caso de borde: propiedades que todo objeto tiene no son tipos válidos.
    assert.equal(esTipoValido("toString"), false);
  });
});

describe("reglas de cambio de estado", () => {
  it("permite los pasos del circuito", () => {
    assert.equal(transicionPermitida("pendiente", "en curso"), true);
    assert.equal(transicionPermitida("pendiente", "rechazada"), true);
    assert.equal(transicionPermitida("en curso", "resuelta"), true);
  });

  it("no permite saltear pasos ni volver atrás", () => {
    assert.equal(transicionPermitida("pendiente", "resuelta"), false);
    assert.equal(transicionPermitida("resuelta", "en curso"), false);
  });

  it("resuelta y rechazada son estados finales", () => {
    assert.equal(esEstadoFinal("resuelta"), true);
    assert.equal(esEstadoFinal("rechazada"), true);
    assert.equal(esEstadoFinal("en curso"), false);
  });
});
