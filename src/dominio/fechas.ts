// Funciones para trabajar con fechas en formato ISO (aaaa-mm-dd).

const MS_POR_DIA = 86_400_000;

/** Convierte "2026-10-01" en "01/10/2026". */
export function formatearFecha(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split("-");
  return `${dia}/${mes}/${anio}`;
}

/** Cantidad de días entre dos fechas ISO. */
export function diasEntre(desde: string, hasta: string): number {
  const diferencia = new Date(hasta).getTime() - new Date(desde).getTime();
  return Math.round(diferencia / MS_POR_DIA);
}
