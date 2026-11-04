import { formatearFecha } from "../dominio/fechas";
import type { RangoFechas } from "../dominio/RangoFechas";
import type { Solicitud } from "../dominio/Solicitud";
import type { Estado } from "../dominio/tipos";
import type { LectorSolicitudes } from "../repositorio/RepositorioSolicitudes";

/**
 * Arma el reporte de solicitudes de un período. Solo necesita leer
 * solicitudes, por eso depende de LectorSolicitudes y no del repositorio
 * completo (ISP).
 */
export class ReporteSolicitudes {
  private readonly lector: LectorSolicitudes;

  constructor(lector: LectorSolicitudes) {
    this.lector = lector;
  }

  generar(periodo: RangoFechas, fechaCorte: string): string {
    const delPeriodo = this.lector
      .listar()
      .filter((solicitud) => periodo.contiene(solicitud.fecha));
    return [
      "===== REPORTE DE SOLICITUDES =====",
      `Periodo: ${periodo.toString()}`,
      `Total: ${delPeriodo.length}`,
      lineaPorEstado(delPeriodo),
      ...lineasPorTipo(delPeriodo),
      lineaPromedioDeCierre(delPeriodo, fechaCorte),
      ...lineasDemoradas(delPeriodo, fechaCorte),
      "==================================",
    ].join("\n");
  }
}

function lineaPorEstado(solicitudes: Solicitud[]): string {
  const contar = (estado: Estado) =>
    solicitudes.filter((solicitud) => solicitud.estado === estado).length;
  return (
    `Por estado: pendiente=${contar("pendiente")}, en curso=${contar("en curso")}, ` +
    `resuelta=${contar("resuelta")}, rechazada=${contar("rechazada")}`
  );
}

function lineasPorTipo(solicitudes: Solicitud[]): string[] {
  const cantidadPorTipo = new Map<string, number>();
  for (const solicitud of solicitudes) {
    const cantidad = cantidadPorTipo.get(solicitud.tipo) ?? 0;
    cantidadPorTipo.set(solicitud.tipo, cantidad + 1);
  }
  const lineas = [...cantidadPorTipo].map(
    ([tipo, cantidad]) => `  - ${tipo}: ${cantidad}`,
  );
  return ["Por tipo:", ...lineas];
}

function lineaPromedioDeCierre(
  solicitudes: Solicitud[],
  fechaCorte: string,
): string {
  const cerradas = solicitudes.filter((solicitud) => solicitud.estaCerrada());
  if (cerradas.length === 0) {
    return "Promedio de dias hasta el cierre: sin datos";
  }
  const totalDias = cerradas.reduce(
    (suma, solicitud) => suma + solicitud.diasAbierta(fechaCorte),
    0,
  );
  const promedio = (totalDias / cerradas.length).toFixed(1);
  return `Promedio de dias hasta el cierre: ${promedio}`;
}

function lineasDemoradas(
  solicitudes: Solicitud[],
  fechaCorte: string,
): string[] {
  const demoradas = solicitudes.filter(
    (solicitud) =>
      !solicitud.estaCerrada() && solicitud.diasAbierta(fechaCorte) > 7,
  );
  const lineas = demoradas.map(
    (solicitud) =>
      `  #${solicitud.id} | ${formatearFecha(solicitud.fecha)} | ` +
      `${solicitud.tipo} | ${solicitud.diasAbierta(fechaCorte)} dias`,
  );
  return [
    `Solicitudes demoradas (mas de 7 dias abiertas): ${demoradas.length}`,
    ...lineas,
  ];
}
