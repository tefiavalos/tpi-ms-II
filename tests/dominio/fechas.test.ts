import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { diasEntre, formatearFecha } from "../../src/dominio/fechas";
import { DatoInvalido } from "../../src/dominio/errores";
import { RangoFechas } from "../../src/dominio/RangoFechas";

describe("fechas", () => {
  it("formatea una fecha ISO como dd/mm/aaaa", () => {
    assert.equal(formatearFecha("2026-10-01"), "01/10/2026");
  });

  it("calcula los días entre dos fechas", () => {
    assert.equal(diasEntre("2026-10-01", "2026-10-04"), 3);
    assert.equal(diasEntre("2026-10-01", "2026-10-01"), 0);
  });
});

describe("RangoFechas", () => {
  const octubre = new RangoFechas("2026-10-01", "2026-10-31");

  it("incluye las fechas de los extremos", () => {
    assert.equal(octubre.contiene("2026-10-01"), true);
    assert.equal(octubre.contiene("2026-10-31"), true);
  });

  it("excluye las fechas de afuera", () => {
    assert.equal(octubre.contiene("2026-09-30"), false);
    assert.equal(octubre.contiene("2026-11-01"), false);
  });

  it("se muestra con formato dd/mm/aaaa", () => {
    assert.equal(octubre.toString(), "01/10/2026 al 31/10/2026");
  });

  it("no permite un rango con 'desde' posterior a 'hasta'", () => {
    assert.throws(
      () => new RangoFechas("2026-10-31", "2026-10-01"),
      DatoInvalido,
    );
  });
});
