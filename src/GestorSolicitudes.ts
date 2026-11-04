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
import type { Estado } from "./dominio/tipos";
import type { RepositorioSolicitudes } from "./repositorio/RepositorioSolicitudes";
import {
  validarDescripcion,
  validarEmail,
  validarLegajo,
} from "./dominio/validaciones";

// Gestor de solicitudes academicas
export class GestorSolicitudes {
  private readonly repositorio: RepositorioSolicitudes;

  // Recibe el repositorio desde afuera (inyección de dependencias): el gestor
  // no sabe si los datos se guardan en un archivo, en memoria o en otra fuente.
  constructor(repositorio: RepositorioSolicitudes) {
    this.repositorio = repositorio;
  }

  registrarSolicitud(
    legajo: string,
    nombre: string,
    email: string,
    tipo: string,
    descripcion: string,
    fecha: string,
    urgente: boolean,
  ): Solicitud {
    validarLegajo(legajo);
    validarEmail(email);
    validarDescripcion(descripcion);
    if (!esTipoValido(tipo)) {
      throw new DatoInvalido("tipo de solicitud invalido");
    }
    this.registrarEstudianteSiNoExiste(legajo, nombre, email);
    const solicitud = new Solicitud({
      id: this.repositorio.siguienteId(),
      legajo: legajo,
      tipo: tipo,
      descripcion: descripcion,
      fecha: fecha,
      prioridad: prioridadInicial(tipo, urgente),
      estado: "pendiente",
      responsable: null,
      fechaCierre: null,
    });
    this.repositorio.guardar(solicitud);
    return solicitud;
  }

  registrarEstudianteSiNoExiste(legajo: string, nombre: string, email: string) {
    if (this.repositorio.buscarEstudiante(legajo) === undefined) {
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

  buscar(
    tipo: string,
    estado: string,
    prioridad: string,
    desde: string,
    hasta: string,
  ): Solicitud[] {
    return this.repositorio
      .listar()
      .filter(
        (solicitud) =>
          (tipo === "" || solicitud.tipo === tipo) &&
          (estado === "" || solicitud.estado === estado) &&
          (prioridad === "" || solicitud.prioridad === prioridad) &&
          this.estaEnRango(solicitud.fecha, desde, hasta),
      );
  }

  estaEnRango(fecha: string, desde: string, hasta: string) {
    return (desde === "" || fecha >= desde) && (hasta === "" || fecha <= hasta);
  }

  generarReporte(fechaCorte: string, desde: string, hasta: string): string {
    const delPeriodo = this.repositorio
      .listar()
      .filter((solicitud) => this.estaEnRango(solicitud.fecha, desde, hasta));
    let texto = "===== REPORTE DE SOLICITUDES =====\n";
    texto += `Periodo: ${formatearFecha(desde)} al ${formatearFecha(hasta)}\n`;
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
