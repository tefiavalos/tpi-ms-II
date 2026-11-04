import * as fs from "fs";
import {
  DatoInvalido,
  NoEncontrado,
  OperacionNoPermitida,
} from "./dominio/errores";
import { diasEntre, formatearFecha } from "./dominio/fechas";
import {
  areaResponsable,
  esEstadoFinal,
  esTipoValido,
  prioridadInicial,
  transicionPermitida,
} from "./dominio/reglas";
import type { Area, Estado, Prioridad, TipoSolicitud } from "./dominio/tipos";
import {
  validarDescripcion,
  validarEmail,
  validarLegajo,
} from "./dominio/validaciones";

export interface DatosSolicitud {
  id: number;
  legajo: string;
  tipo: TipoSolicitud;
  descripcion: string;
  fecha: string;
  prioridad: Prioridad;
  estado: Estado;
  responsable: string | null;
  fechaCierre: string | null;
}

export interface DatosEstudiante {
  legajo: string;
  nombre: string;
  email: string;
}

export interface Responsable {
  id: number;
  nombre: string;
  area: Area;
}

// Gestor de solicitudes academicas
export class GestorSolicitudes {
  solicitudes: DatosSolicitud[] = [];
  estudiantes: DatosEstudiante[] = [];
  responsables: Responsable[] = [
    { id: 1, nombre: "Laura Gómez", area: "Alumnos" },
    { id: 2, nombre: "Martín Ruiz", area: "Coordinación" },
  ];
  archivo: string;
  ultimoId: number = 0;

  constructor(archivo: string) {
    this.archivo = archivo;
    this.cargar();
  }

  cargar() {
    try {
      const datos = JSON.parse(fs.readFileSync(this.archivo, "utf-8"));
      this.solicitudes = datos.solicitudes;
      this.estudiantes = datos.estudiantes;
      this.ultimoId = datos.ultimoId;
    } catch (e) {}
  }

  guardar() {
    const datos = {
      ultimoId: this.ultimoId,
      estudiantes: this.estudiantes,
      solicitudes: this.solicitudes,
    };
    fs.writeFileSync(this.archivo, JSON.stringify(datos, null, 2));
  }

  registrarSolicitud(
    legajo: string,
    nombre: string,
    email: string,
    tipo: string,
    descripcion: string,
    fecha: string,
    urgente: boolean,
  ): DatosSolicitud {
    validarLegajo(legajo);
    validarEmail(email);
    validarDescripcion(descripcion);
    if (!esTipoValido(tipo)) {
      throw new DatoInvalido("tipo de solicitud invalido");
    }
    this.registrarEstudianteSiNoExiste(legajo, nombre, email);
    this.ultimoId++;
    const solicitud: DatosSolicitud = {
      id: this.ultimoId,
      legajo: legajo,
      tipo: tipo,
      descripcion: descripcion,
      fecha: fecha,
      prioridad: prioridadInicial(tipo, urgente),
      estado: "pendiente",
      responsable: null,
      fechaCierre: null,
    };
    this.solicitudes.push(solicitud);
    this.guardar();
    return solicitud;
  }

  registrarEstudianteSiNoExiste(legajo: string, nombre: string, email: string) {
    if (this.buscarEstudiante(legajo) === undefined) {
      this.estudiantes.push({ legajo: legajo, nombre: nombre, email: email });
    }
  }

  buscarEstudiante(legajo: string) {
    return this.estudiantes.find((estudiante) => estudiante.legajo === legajo);
  }

  obtenerSolicitud(id: number): DatosSolicitud {
    const solicitud = this.solicitudes.find((s) => s.id === id);
    if (solicitud === undefined) {
      throw new NoEncontrado(`no existe la solicitud #${id}`);
    }
    return solicitud;
  }

  actualizarEmail(legajo: string, email: string): DatosEstudiante {
    validarEmail(email);
    const estudiante = this.buscarEstudiante(legajo);
    if (estudiante === undefined) {
      throw new NoEncontrado(`no existe el estudiante ${legajo}`);
    }
    estudiante.email = email;
    this.guardar();
    return estudiante;
  }

  asignarResponsable(id: number): DatosSolicitud {
    const solicitud = this.obtenerSolicitud(id);
    if (esEstadoFinal(solicitud.estado)) {
      throw new OperacionNoPermitida(`la solicitud #${id} ya esta cerrada`);
    }
    const area = areaResponsable(solicitud.tipo);
    const responsable = this.responsables.find((r) => r.area === area);
    solicitud.responsable = responsable.nombre;
    this.guardar();
    return solicitud;
  }

  cambiarEstado(
    id: number,
    nuevoEstado: Estado,
    fecha: string,
  ): DatosSolicitud {
    const solicitud = this.obtenerSolicitud(id);
    if (!transicionPermitida(solicitud.estado, nuevoEstado)) {
      throw new OperacionNoPermitida(
        `no se puede pasar de ${solicitud.estado} a ${nuevoEstado}`,
      );
    }
    if (nuevoEstado === "en curso" && solicitud.responsable === null) {
      throw new OperacionNoPermitida(
        `la solicitud #${id} no tiene responsable asignado`,
      );
    }
    solicitud.estado = nuevoEstado;
    if (esEstadoFinal(nuevoEstado)) solicitud.fechaCierre = fecha;
    this.guardar();
    return solicitud;
  }

  buscar(
    tipo: string,
    estado: string,
    prioridad: string,
    desde: string,
    hasta: string,
  ): DatosSolicitud[] {
    return this.solicitudes.filter(
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

  calcularDias(solicitud: DatosSolicitud, fechaCorte: string) {
    return diasEntre(solicitud.fecha, solicitud.fechaCierre ?? fechaCorte);
  }

  generarReporte(fechaCorte: string, desde: string, hasta: string): string {
    const delPeriodo = this.solicitudes.filter((solicitud) =>
      this.estaEnRango(solicitud.fecha, desde, hasta),
    );
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

  lineaPorEstado(solicitudes: DatosSolicitud[]) {
    const contar = (estado: Estado) =>
      solicitudes.filter((solicitud) => solicitud.estado === estado).length;
    return (
      `Por estado: pendiente=${contar("pendiente")}, en curso=${contar("en curso")}, ` +
      `resuelta=${contar("resuelta")}, rechazada=${contar("rechazada")}\n`
    );
  }

  lineasPorTipo(solicitudes: DatosSolicitud[]) {
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

  lineaPromedioCierre(solicitudes: DatosSolicitud[], fechaCorte: string) {
    const cerradas = solicitudes.filter((s) => esEstadoFinal(s.estado));
    if (cerradas.length === 0) {
      return "Promedio de dias hasta el cierre: sin datos\n";
    }
    const totalDias = cerradas.reduce(
      (suma, solicitud) => suma + this.calcularDias(solicitud, fechaCorte),
      0,
    );
    const promedio = (totalDias / cerradas.length).toFixed(1);
    return `Promedio de dias hasta el cierre: ${promedio}\n`;
  }

  lineasDemoradas(solicitudes: DatosSolicitud[], fechaCorte: string) {
    const demoradas = solicitudes.filter(
      (solicitud) =>
        !esEstadoFinal(solicitud.estado) &&
        this.calcularDias(solicitud, fechaCorte) > 7,
    );
    let texto = `Solicitudes demoradas (mas de 7 dias abiertas): ${demoradas.length}\n`;
    for (const solicitud of demoradas) {
      const dias = this.calcularDias(solicitud, fechaCorte);
      texto += `  #${solicitud.id} | ${formatearFecha(solicitud.fecha)} | ${solicitud.tipo} | ${dias} dias\n`;
    }
    return texto;
  }
}
