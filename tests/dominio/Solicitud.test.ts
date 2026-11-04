import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { OperacionNoPermitida } from "../../src/dominio/errores";
import { Solicitud, type DatosSolicitud } from "../../src/dominio/Solicitud";

function crearSolicitud(cambios: Partial<DatosSolicitud> = {}): Solicitud {
  return new Solicitud({
    id: 1,
    legajo: "10001",
    tipo: "certificado",
    descripcion: "Certificado de alumno regular",
    fecha: "2026-10-01",
    prioridad: "baja",
    estado: "pendiente",
    responsable: null,
    fechaCierre: null,
    ...cambios,
  });
}

describe("Solicitud", () => {
  it("no pasa a 'en curso' si no tiene responsable", () => {
    // Arrange
    const solicitud = crearSolicitud();

    // Act
    const cambiar = () => solicitud.cambiarEstado("en curso", "2026-10-02");

    // Assert
    assert.throws(cambiar, OperacionNoPermitida);
    assert.equal(solicitud.estado, "pendiente");
  });

  it("pasa a 'en curso' cuando tiene responsable", () => {
    const solicitud = crearSolicitud();
    solicitud.asignarResponsable("Laura Gómez");

    solicitud.cambiarEstado("en curso", "2026-10-02");

    assert.equal(solicitud.estado, "en curso");
    assert.equal(solicitud.fechaCierre, null);
  });

  it("al resolverse guarda la fecha de cierre", () => {
    const solicitud = crearSolicitud({
      estado: "en curso",
      responsable: "Laura Gómez",
    });

    solicitud.cambiarEstado("resuelta", "2026-10-04");

    assert.equal(solicitud.estado, "resuelta");
    assert.equal(solicitud.fechaCierre, "2026-10-04");
  });

  it("no permite volver de 'resuelta' a 'en curso'", () => {
    const solicitud = crearSolicitud({
      estado: "resuelta",
      fechaCierre: "2026-10-04",
    });

    assert.throws(
      () => solicitud.cambiarEstado("en curso", "2026-10-05"),
      /no se puede pasar de resuelta a en curso/,
    );
  });

  it("no permite asignar responsable a una solicitud cerrada", () => {
    const solicitud = crearSolicitud({ estado: "rechazada" });

    assert.throws(
      () => solicitud.asignarResponsable("Laura Gómez"),
      OperacionNoPermitida,
    );
  });

  it("si está abierta cuenta los días hasta la fecha de corte", () => {
    const solicitud = crearSolicitud({ fecha: "2026-10-05" });

    assert.equal(solicitud.diasAbierta("2026-10-30"), 25);
  });

  it("si está cerrada cuenta los días hasta el cierre", () => {
    const solicitud = crearSolicitud({
      estado: "resuelta",
      fechaCierre: "2026-10-04",
    });

    assert.equal(solicitud.diasAbierta("2026-10-30"), 3);
  });

  it("aDatos devuelve los mismos datos con los que se creó", () => {
    const datos: DatosSolicitud = {
      id: 7,
      legajo: "10002",
      tipo: "equivalencia",
      descripcion: "Equivalencia de Programacion I",
      fecha: "2026-10-10",
      prioridad: "alta",
      estado: "en curso",
      responsable: "Martín Ruiz",
      fechaCierre: null,
    };

    assert.deepEqual(new Solicitud(datos).aDatos(), datos);
  });
});
