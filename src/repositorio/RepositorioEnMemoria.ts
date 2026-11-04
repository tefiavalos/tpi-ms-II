import type { Estudiante } from "../dominio/Estudiante";
import type { Solicitud } from "../dominio/Solicitud";
import type { RepositorioSolicitudes } from "./RepositorioSolicitudes";

/** Guarda los datos en memoria. Se usa en las pruebas y como base del repositorio JSON. */
export class RepositorioEnMemoria implements RepositorioSolicitudes {
  protected ultimoId = 0;
  protected readonly solicitudes = new Map<number, Solicitud>();
  protected readonly estudiantes = new Map<string, Estudiante>();

  listar(): Solicitud[] {
    return [...this.solicitudes.values()];
  }

  siguienteId(): number {
    this.ultimoId++;
    return this.ultimoId;
  }

  buscarPorId(id: number): Solicitud | undefined {
    return this.solicitudes.get(id);
  }

  guardar(solicitud: Solicitud): void {
    this.solicitudes.set(solicitud.id, solicitud);
  }

  buscarEstudiante(legajo: string): Estudiante | undefined {
    return this.estudiantes.get(legajo);
  }

  guardarEstudiante(estudiante: Estudiante): void {
    this.estudiantes.set(estudiante.legajo, estudiante);
  }
}
