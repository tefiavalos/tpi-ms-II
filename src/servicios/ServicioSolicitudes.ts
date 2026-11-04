import { DatoInvalido, NoEncontrado } from "../dominio/errores";
import { Estudiante } from "../dominio/Estudiante";
import type { RangoFechas } from "../dominio/RangoFechas";
import {
  areaResponsable,
  esTipoValido,
  prioridadInicial,
} from "../dominio/reglas";
import { responsableDelArea } from "../dominio/responsables";
import { Solicitud } from "../dominio/Solicitud";
import type { Estado, Prioridad, TipoSolicitud } from "../dominio/tipos";
import {
  validarDescripcion,
  validarEmail,
  validarLegajo,
} from "../dominio/validaciones";
import type { RepositorioSolicitudes } from "../repositorio/RepositorioSolicitudes";

/** Datos que se ingresan para registrar una solicitud. */
export interface NuevaSolicitud {
  legajo: string;
  nombre: string;
  email: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  urgente: boolean;
}

/** Criterios de búsqueda. Los que no se indican no filtran. */
export interface FiltroSolicitudes {
  tipo?: TipoSolicitud;
  estado?: Estado;
  prioridad?: Prioridad;
  rango?: RangoFechas;
}

/**
 * Casos de uso del sistema: registrar, asignar responsable, cambiar estado,
 * actualizar el email del estudiante y buscar. Coordina el dominio y el
 * repositorio; las reglas de cada entidad están en sus propias clases.
 */
export class ServicioSolicitudes {
  private readonly repositorio: RepositorioSolicitudes;

  // Recibe el repositorio desde afuera (inyección de dependencias): el
  // servicio no sabe si los datos se guardan en un archivo o en memoria.
  constructor(repositorio: RepositorioSolicitudes) {
    this.repositorio = repositorio;
  }

  registrarSolicitud(datos: NuevaSolicitud): Solicitud {
    const tipo = this.validarNuevaSolicitud(datos);
    this.registrarEstudianteSiNoExiste(datos);
    const solicitud = new Solicitud({
      id: this.repositorio.siguienteId(),
      legajo: datos.legajo,
      tipo: tipo,
      descripcion: datos.descripcion,
      fecha: datos.fecha,
      prioridad: prioridadInicial(tipo, datos.urgente),
      estado: "pendiente",
      responsable: null,
      fechaCierre: null,
    });
    this.repositorio.guardar(solicitud);
    return solicitud;
  }

  asignarResponsable(id: number): Solicitud {
    const solicitud = this.obtenerSolicitud(id);
    const responsable = responsableDelArea(areaResponsable(solicitud.tipo));
    solicitud.asignarResponsable(responsable.nombre);
    this.repositorio.guardar(solicitud);
    return solicitud;
  }

  cambiarEstado(id: number, nuevoEstado: Estado, fecha: string): Solicitud {
    const solicitud = this.obtenerSolicitud(id);
    solicitud.cambiarEstado(nuevoEstado, fecha);
    this.repositorio.guardar(solicitud);
    return solicitud;
  }

  actualizarEmail(legajo: string, nuevoEmail: string): Estudiante {
    validarEmail(nuevoEmail);
    const estudiante = this.repositorio.buscarEstudiante(legajo);
    if (estudiante === undefined) {
      throw new NoEncontrado(`no existe el estudiante ${legajo}`);
    }
    estudiante.cambiarEmail(nuevoEmail);
    this.repositorio.guardarEstudiante(estudiante);
    return estudiante;
  }

  buscar(filtro: FiltroSolicitudes): Solicitud[] {
    return this.repositorio
      .listar()
      .filter((solicitud) => cumpleFiltro(solicitud, filtro));
  }

  /** Valida los datos ingresados y devuelve el tipo ya verificado. */
  private validarNuevaSolicitud(datos: NuevaSolicitud): TipoSolicitud {
    validarLegajo(datos.legajo);
    validarEmail(datos.email);
    validarDescripcion(datos.descripcion);
    if (!esTipoValido(datos.tipo)) {
      throw new DatoInvalido("tipo de solicitud invalido");
    }
    return datos.tipo;
  }

  private registrarEstudianteSiNoExiste(datos: NuevaSolicitud): void {
    if (this.repositorio.buscarEstudiante(datos.legajo) === undefined) {
      const { legajo, nombre, email } = datos;
      this.repositorio.guardarEstudiante(
        new Estudiante({ legajo, nombre, email }),
      );
    }
  }

  private obtenerSolicitud(id: number): Solicitud {
    const solicitud = this.repositorio.buscarPorId(id);
    if (solicitud === undefined) {
      throw new NoEncontrado(`no existe la solicitud #${id}`);
    }
    return solicitud;
  }
}

function coincide<T>(valor: T, buscado: T | undefined): boolean {
  return buscado === undefined || valor === buscado;
}

function cumpleFiltro(
  solicitud: Solicitud,
  filtro: FiltroSolicitudes,
): boolean {
  return (
    coincide(solicitud.tipo, filtro.tipo) &&
    coincide(solicitud.estado, filtro.estado) &&
    coincide(solicitud.prioridad, filtro.prioridad) &&
    (filtro.rango?.contiene(solicitud.fecha) ?? true)
  );
}
