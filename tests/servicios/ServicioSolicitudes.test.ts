import { beforeEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";

import { DatoInvalido, NoEncontrado } from "../../src/dominio/errores";
import { RangoFechas } from "../../src/dominio/RangoFechas";
import { RepositorioEnMemoria } from "../../src/repositorio/RepositorioEnMemoria";
import {
  ServicioSolicitudes,
  type NuevaSolicitud,
} from "../../src/servicios/ServicioSolicitudes";

const nuevaSolicitud: NuevaSolicitud = {
  legajo: "10001",
  nombre: "Ana Torres",
  email: "ana.torres@mail.com",
  tipo: "certificado",
  descripcion: "Certificado de alumno regular",
  fecha: "2026-10-01",
  urgente: false,
};

describe("ServicioSolicitudes", () => {
  let repositorio: RepositorioEnMemoria;
  let servicio: ServicioSolicitudes;

  beforeEach(() => {
    // Se usa el repositorio en memoria: las pruebas no escriben en disco.
    repositorio = new RepositorioEnMemoria();
    servicio = new ServicioSolicitudes(repositorio);
  });

  describe("registrarSolicitud", () => {
    it("registra la solicitud pendiente, con id y prioridad", () => {
      // Act
      const solicitud = servicio.registrarSolicitud(nuevaSolicitud);

      // Assert
      assert.equal(solicitud.id, 1);
      assert.equal(solicitud.estado, "pendiente");
      assert.equal(solicitud.prioridad, "baja");
      assert.equal(repositorio.buscarPorId(1), solicitud);
    });

    it("registra al estudiante una sola vez", () => {
      servicio.registrarSolicitud(nuevaSolicitud);
      servicio.registrarSolicitud({ ...nuevaSolicitud, nombre: "Otro" });

      assert.equal(repositorio.buscarEstudiante("10001")?.nombre, "Ana Torres");
      assert.equal(repositorio.listar().length, 2);
    });

    it("rechaza cada dato inválido sin guardar nada", () => {
      const invalidos: Partial<NuevaSolicitud>[] = [
        { legajo: "123" },
        { email: "ana.mail.com" },
        { descripcion: "Corto" },
        { tipo: "titulo" },
      ];

      for (const cambio of invalidos) {
        assert.throws(
          () => servicio.registrarSolicitud({ ...nuevaSolicitud, ...cambio }),
          DatoInvalido,
        );
      }
      assert.equal(repositorio.listar().length, 0);
      assert.equal(repositorio.buscarEstudiante("10001"), undefined);
    });
  });

  describe("asignarResponsable y cambiarEstado", () => {
    it("asigna el responsable del área que corresponde al tipo", () => {
      servicio.registrarSolicitud({ ...nuevaSolicitud, tipo: "equivalencia" });

      const solicitud = servicio.asignarResponsable(1);

      assert.equal(solicitud.responsable, "Martín Ruiz");
    });

    it("guarda la solicitud una vez al cambiar el estado (mock)", () => {
      servicio.registrarSolicitud(nuevaSolicitud);
      servicio.asignarResponsable(1);
      const guardar = mock.method(repositorio, "guardar");

      servicio.cambiarEstado(1, "en curso", "2026-10-02");

      assert.equal(guardar.mock.callCount(), 1);
      assert.equal(guardar.mock.calls[0].arguments[0].estado, "en curso");
    });

    it("si el cambio no está permitido no guarda nada (mock)", () => {
      servicio.registrarSolicitud(nuevaSolicitud);
      const guardar = mock.method(repositorio, "guardar");

      assert.throws(() => servicio.cambiarEstado(1, "resuelta", "2026-10-02"));
      assert.equal(guardar.mock.callCount(), 0);
    });

    it("informa cuando la solicitud no existe", () => {
      assert.throws(() => servicio.asignarResponsable(99), NoEncontrado);
      assert.throws(
        () => servicio.cambiarEstado(99, "en curso", "2026-10-02"),
        /no existe la solicitud #99/,
      );
    });
  });

  describe("actualizarEmail", () => {
    it("actualiza el email de un estudiante existente", () => {
      servicio.registrarSolicitud(nuevaSolicitud);

      servicio.actualizarEmail("10001", "ana.t@mail.com");

      assert.equal(
        repositorio.buscarEstudiante("10001")?.email,
        "ana.t@mail.com",
      );
    });

    it("informa cuando el estudiante no existe", () => {
      assert.throws(
        () => servicio.actualizarEmail("99999", "x@mail.com"),
        NoEncontrado,
      );
    });
  });

  describe("buscar", () => {
    beforeEach(() => {
      servicio.registrarSolicitud(nuevaSolicitud);
      servicio.registrarSolicitud({
        ...nuevaSolicitud,
        tipo: "reclamo de nota",
        fecha: "2026-10-15",
      });
      servicio.registrarSolicitud({ ...nuevaSolicitud, fecha: "2026-11-02" });
    });

    it("sin criterios devuelve todas", () => {
      assert.equal(servicio.buscar({}).length, 3);
    });

    it("combina tipo y rango de fechas", () => {
      const octubre = new RangoFechas("2026-10-01", "2026-10-31");

      const resultado = servicio.buscar({
        tipo: "certificado",
        rango: octubre,
      });

      assert.deepEqual(
        resultado.map((s) => s.id),
        [1],
      );
    });

    it("filtra por prioridad y estado", () => {
      assert.equal(servicio.buscar({ prioridad: "alta" }).length, 1);
      assert.equal(servicio.buscar({ estado: "resuelta" }).length, 0);
    });
  });
});
