import * as fs from "fs";
import { Estudiante, type DatosEstudiante } from "../dominio/Estudiante";
import { Solicitud, type DatosSolicitud } from "../dominio/Solicitud";
import { RepositorioEnMemoria } from "./RepositorioEnMemoria";

/** Estructura del archivo JSON (la misma que usaba la versión inicial). */
interface ArchivoDeDatos {
  ultimoId: number;
  estudiantes: DatosEstudiante[];
  solicitudes: DatosSolicitud[];
}

/**
 * Repositorio que mantiene los datos en memoria y los escribe en un archivo
 * JSON cada vez que algo cambia.
 */
export class RepositorioJson extends RepositorioEnMemoria {
  private readonly archivo: string;

  constructor(archivo: string) {
    super();
    this.archivo = archivo;
    this.cargar();
  }

  override guardar(solicitud: Solicitud): void {
    super.guardar(solicitud);
    this.escribirArchivo();
  }

  override guardarEstudiante(estudiante: Estudiante): void {
    super.guardarEstudiante(estudiante);
    this.escribirArchivo();
  }

  private cargar(): void {
    try {
      const contenido = fs.readFileSync(this.archivo, "utf-8");
      const datos = JSON.parse(contenido) as ArchivoDeDatos;
      this.ultimoId = datos.ultimoId;
      for (const d of datos.estudiantes)
        super.guardarEstudiante(new Estudiante(d));
      for (const d of datos.solicitudes) super.guardar(new Solicitud(d));
    } catch {
      // Si el archivo todavía no existe, se empieza sin datos.
    }
  }

  private escribirArchivo(): void {
    const datos: ArchivoDeDatos = {
      ultimoId: this.ultimoId,
      estudiantes: [...this.estudiantes.values()].map((e) => e.aDatos()),
      solicitudes: this.listar().map((s) => s.aDatos()),
    };
    fs.writeFileSync(this.archivo, JSON.stringify(datos, null, 2));
  }
}
