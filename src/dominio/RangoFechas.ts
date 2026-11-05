import { DatoInvalido } from "./errores";
import { formatearFecha } from "./fechas";

/**
 * Período entre dos fechas ISO, ambas incluidas. Agrupa "desde" y "hasta",
 * que antes viajaban siempre juntos como dos parámetros sueltos.
 */
export class RangoFechas {
  readonly desde: string;
  readonly hasta: string;

  constructor(desde: string, hasta: string) {
    if (desde > hasta) {
      throw new DatoInvalido("el rango de fechas es invalido");
    }
    this.desde = desde;
    this.hasta = hasta;
  }

  contiene(fecha: string): boolean {
    return fecha >= this.desde && fecha <= this.hasta;
  }

  toString(): string {
    return `${formatearFecha(this.desde)} al ${formatearFecha(this.hasta)}`;
  }
}
