import { Estudiante } from "./dominio/Estudiante";
import { DatoInvalido, NoEncontrado } from "./dominio/errores";
import { formatearFecha } from "./dominio/fechas";
import { responsableDelArea } from "./dominio/responsables";
import {
  areaResponsable,
  esTipoValido,
  prioridadInicial,
} from "./dominio/reglas";
import { Solicitud } from "./dominio/Solicitud";
import { RangoFechas } from "./dominio/RangoFechas";
import type { Estado, Prioridad, TipoSolicitud } from "./dominio/tipos";
import type { RepositorioSolicitudes } from "./repositorio/RepositorioSolicitudes";
import {
  validarDescripcion,
  validarEmail,
  validarLegajo,
} from "./dominio/validaciones";

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

// Gestor de solicitudes academicas
export class GestorSolicitudes {
  private readonly repositorio: RepositorioSolicitudes;

  // Recibe el repositorio desde afuera (inyección de dependencias): el gestor
  // no sabe si los datos se guardan en un archivo, en memoria o en otra fuente.
  constructor(repositorio: RepositorioSolicitudes) {
    this.repositorio = repositorio;
  }

  registrarSolicitud(datos: NuevaSolicitud): Solicitud {
    validarLegajo(datos.legajo);
    validarEmail(datos.email);
    validarDescripcion(datos.descripcion);
    if (!esTipoValido(datos.tipo)) {
      throw new DatoInvalido("tipo de solicitud invalido");
    }
    this.registrarEstudianteSiNoExiste(datos);
    const solicitud = new Solicitud({
      id: this.repositorio.siguienteId(),
      legajo: datos.legajo,
      tipo: datos.tipo,
      descripcion: datos.descripcion,
      fecha: datos.fecha,
      prioridad: prioridadInicial(datos.tipo, datos.urgente),
      estado: "pendiente",
      responsable: null,
      fechaCierre: null,
    });
    this.repositorio.guardar(solicitud);
    return solicitud;
  }

  registrarEstudianteSiNoExiste(datos: NuevaSolicitud) {
    if (this.repositorio.buscarEstudiante(datos.legajo) === undefined) {
      const { legajo, nombre, email } = datos;
      this.repositorio.guardarEstudiante(
        new Estudiante({ legajo, nombre, email }),
      );
    }
  }

  obtenerSolicitud(id: number): Solicitud {
    const solicitud = this.repositorio.buscarPorId(id);
    if (solicitud === undefined) {
      throw new NoEncontrado(`no existe la solicitud #${id}`);
    }
    return solicitud;
  }

  actualizarEmail(legajo: string, email: string): Estudiante {
    validarEmail(email);
    const estudiante = this.repositorio.buscarEstudiante(legajo);
    if (estudiante === undefined) {
      throw new NoEncontrado(`no existe el estudiante ${legajo}`);
    }
    estudiante.cambiarEmail(email);
    this.repositorio.guardarEstudiante(estudiante);
    return estudiante;
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

  buscar(filtro: FiltroSolicitudes): Solicitud[] {
    return this.repositorio
      .listar()
      .filter((solicitud) => this.cumpleFiltro(solicitud, filtro));
  }

  cumpleFiltro(solicitud: Solicitud, filtro: FiltroSolicitudes): boolean {
    const coincide = <T>(valor: T, buscado?: T) =>
      buscado === undefined || valor === buscado;
    return (
      coincide(solicitud.tipo, filtro.tipo) &&
      coincide(solicitud.estado, filtro.estado) &&
      coincide(solicitud.prioridad, filtro.prioridad) &&
      (filtro.rango?.contiene(solicitud.fecha) ?? true)
    );
  }

  generarReporte(fechaCorte: string, periodo: RangoFechas): string {
    const delPeriodo = this.buscar({ rango: periodo });
    let texto = "===== REPORTE DE SOLICITUDES =====\n";
    texto += `Periodo: ${periodo.toString()}\n`;
    texto += `Total: ${delPeriodo.length}\n`;
    texto += this.lineaPorEstado(delPeriodo);
    texto += this.lineasPorTipo(delPeriodo);
    texto += this.lineaPromedioCierre(delPeriodo, fechaCorte);
    texto += this.lineasDemoradas(delPeriodo, fechaCorte);
    texto += "==================================";
    return texto;
  }

  lineaPorEstado(solicitudes: Solicitud[]) {
    const contar = (estado: Estado) =>
      solicitudes.filter((solicitud) => solicitud.estado === estado).length;
    return (
      `Por estado: pendiente=${contar("pendiente")}, en curso=${contar("en curso")}, ` +
      `resuelta=${contar("resuelta")}, rechazada=${contar("rechazada")}\n`
    );
  }

  lineasPorTipo(solicitudes: Solicitud[]) {
    const cantidadPorTipo = new Map<string, number>();
    for (const solicitud of solicitudes) {
      const cantidad = cantidadPorTipo.get(solicitud.tipo) ?? 0;
      cantidadPorTipo.set(solicitud.tipo, cantidad + 1);
    }
    let texto = "Por tipo:\n";
    for (const [tipo, cantidad] of cantidadPorTipo) {
      texto += `  - ${tipo}: ${cantidad}\n`;
    }
    return texto;
  }

  lineaPromedioCierre(solicitudes: Solicitud[], fechaCorte: string) {
    const cerradas = solicitudes.filter((s) => s.estaCerrada());
    if (cerradas.length === 0) {
      return "Promedio de dias hasta el cierre: sin datos\n";
    }
    const totalDias = cerradas.reduce(
      (suma, solicitud) => suma + solicitud.diasAbierta(fechaCorte),
      0,
    );
    const promedio = (totalDias / cerradas.length).toFixed(1);
    return `Promedio de dias hasta el cierre: ${promedio}\n`;
  }

  lineasDemoradas(solicitudes: Solicitud[], fechaCorte: string) {
    const demoradas = solicitudes.filter(
      (solicitud) =>
        !solicitud.estaCerrada() && solicitud.diasAbierta(fechaCorte) > 7,
    );
    let texto = `Solicitudes demoradas (mas de 7 dias abiertas): ${demoradas.length}\n`;
    for (const solicitud of demoradas) {
      const dias = solicitud.diasAbierta(fechaCorte);
      texto += `  #${solicitud.id} | ${formatearFecha(solicitud.fecha)} | ${solicitud.tipo} | ${dias} dias\n`;
    }
    return texto;
  }
}
