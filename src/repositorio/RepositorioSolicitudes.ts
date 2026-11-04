import type { Estudiante } from "../dominio/Estudiante";
import type { Solicitud } from "../dominio/Solicitud";

/**
 * Lo único que necesita quien solo consulta solicitudes, como el reporte.
 * Separar esta interfaz evita que el reporte dependa de operaciones de
 * guardado que no usa (ISP).
 */
export interface LectorSolicitudes {
  listar(): Solicitud[];
}

/**
 * Operaciones de guardado y búsqueda que necesita la lógica del sistema.
 * La lógica depende de esta interfaz y no de un archivo o una base de datos
 * concretos (DIP): se puede cambiar dónde se guardan los datos sin tocarla.
 */
export interface RepositorioSolicitudes extends LectorSolicitudes {
  siguienteId(): number;
  buscarPorId(id: number): Solicitud | undefined;
  guardar(solicitud: Solicitud): void;
  buscarEstudiante(legajo: string): Estudiante | undefined;
  guardarEstudiante(estudiante: Estudiante): void;
}
