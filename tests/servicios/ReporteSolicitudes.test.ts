import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { RangoFechas } from "../../src/dominio/RangoFechas";
import { Solicitud, type DatosSolicitud } from "../../src/dominio/Solicitud";
import type { LectorSolicitudes } from "../../src/repositorio/RepositorioSolicitudes";
import { ReporteSolicitudes } from "../../src/servicios/ReporteSolicitudes";

const octubre = new RangoFechas("2026-10-01", "2026-10-31");

function solicitud(cambios: Partial<DatosSolicitud>): Solicitud {
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

// Stub: reemplaza al repositorio y devuelve siempre la misma lista.
function lectorStub(solicitudes: Solicitud[]): LectorSolicitudes {
  return { listar: () => solicitudes };
}

describe("ReporteSolicitudes", () => {
  it("cuenta por estado y por tipo solo las solicitudes del período", () => {
    // Arrange
    const reporte = new ReporteSolicitudes(
      lectorStub([
        solicitud({ id: 1 }),
        solicitud({ id: 2, tipo: "equivalencia", estado: "en curso" }),
        solicitud({ id: 3, fecha: "2026-11-05" }),
      ]),
    );

    // Act
    const texto = reporte.generar(octubre, "2026-10-05");

    // Assert
    assert.match(texto, /Total: 2/);
    assert.match(
      texto,
      /Por estado: pendiente=1, en curso=1, resuelta=0, rechazada=0/,
    );
    assert.match(texto, / {2}- certificado: 1\n {2}- equivalencia: 1/);
  });

  it("sin solicitudes cerradas muestra 'sin datos' en el promedio", () => {
    const reporte = new ReporteSolicitudes(lectorStub([solicitud({})]));

    const texto = reporte.generar(octubre, "2026-10-05");

    assert.match(texto, /Promedio de dias hasta el cierre: sin datos/);
  });

  it("promedia los días hasta el cierre de las cerradas", () => {
    const reporte = new ReporteSolicitudes(
      lectorStub([
        solicitud({ id: 1, estado: "resuelta", fechaCierre: "2026-10-04" }),
        solicitud({ id: 2, estado: "rechazada", fechaCierre: "2026-10-03" }),
      ]),
    );

    const texto = reporte.generar(octubre, "2026-10-30");

    assert.match(texto, /Promedio de dias hasta el cierre: 2.5/);
  });

  it("lista como demoradas las abiertas con más de 7 días", () => {
    const reporte = new ReporteSolicitudes(
      lectorStub([
        solicitud({ id: 1, fecha: "2026-10-20" }),
        solicitud({ id: 2, fecha: "2026-10-23" }),
      ]),
    );

    const texto = reporte.generar(octubre, "2026-10-30");

    assert.match(texto, /demoradas \(mas de 7 dias abiertas\): 1/);
    assert.match(texto, /#1 \| 20\/10\/2026 \| certificado \| 10 dias/);
  });
});
