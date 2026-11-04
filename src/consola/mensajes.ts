// Capa de presentación por consola: arma los textos que ve el usuario.
// La lógica del sistema no escribe en pantalla; solo devuelve datos o
// lanza errores, y esta capa decide cómo mostrarlos.
import type { DatosEstudiante, DatosSolicitud } from "../GestorSolicitudes";
import { ErrorDeSolicitud } from "../dominio/errores";
import { formatearFecha } from "../dominio/fechas";
import { areaResponsable } from "../dominio/reglas";

/**
 * Ejecuta una acción y muestra su resultado. Los errores esperados del
 * sistema se muestran como "Error: ..."; cualquier otro error se propaga
 * para no ocultar fallas inesperadas.
 */
export function ejecutar(accion: () => string): void {
  try {
    console.log(accion());
  } catch (error) {
    if (!(error instanceof ErrorDeSolicitud)) throw error;
    console.log(`Error: ${error.message}`);
  }
}

export function mensajeRegistro(solicitud: DatosSolicitud): string {
  return `Solicitud #${solicitud.id} registrada: ${solicitud.tipo} (prioridad ${solicitud.prioridad})`;
}

export function mensajeAsignacion(solicitud: DatosSolicitud): string {
  const area = areaResponsable(solicitud.tipo);
  return `Solicitud #${solicitud.id} asignada a ${solicitud.responsable} (${area})`;
}

export function mensajeCambioDeEstado(solicitud: DatosSolicitud): string {
  return `Solicitud #${solicitud.id} ahora esta ${solicitud.estado}`;
}

export function mensajeEmailActualizado(estudiante: DatosEstudiante): string {
  return `Email actualizado para el legajo ${estudiante.legajo}`;
}

export function listadoDeBusqueda(resultados: DatosSolicitud[]): string {
  const filas = resultados.map(
    (s) =>
      `  #${s.id} | ${formatearFecha(s.fecha)} | ${s.tipo} | ${s.prioridad} | ${s.estado}`,
  );
  return [`Resultados de la busqueda: ${resultados.length}`, ...filas].join(
    "\n",
  );
}
