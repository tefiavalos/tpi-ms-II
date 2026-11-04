import * as fs from "fs";
import {
  areaResponsable,
  esEstadoFinal,
  esTipoValido,
  prioridadInicial,
  transicionPermitida,
} from "./dominio/reglas";
import type { Estado } from "./dominio/tipos";

const MS_POR_DIA = 86400000;

// Gestor de solicitudes academicas
export class GestorSolicitudes {
  solicitudes: any[] = [];
  estudiantes: any[] = [];
  responsables: any[] = [
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
  ) {
    if (!this.datosValidos(legajo, email, descripcion)) return -1;
    if (!esTipoValido(tipo)) {
      console.log("Error: tipo de solicitud invalido");
      return -1;
    }
    const prioridad = prioridadInicial(tipo, urgente);
    this.registrarEstudianteSiNoExiste(legajo, nombre, email);
    this.ultimoId++;
    const solicitud = {
      id: this.ultimoId,
      legajo: legajo,
      tipo: tipo,
      descripcion: descripcion,
      fecha: fecha,
      prioridad: prioridad,
      estado: "pendiente",
      responsable: null,
      fechaCierre: null,
    };
    this.solicitudes.push(solicitud);
    this.guardar();
    console.log(
      "Solicitud #" +
        solicitud.id +
        " registrada: " +
        tipo +
        " (prioridad " +
        prioridad +
        ")",
    );
    return solicitud.id;
  }

  datosValidos(legajo: string, email: string, descripcion: string) {
    if (legajo.length !== 5) {
      console.log("Error: legajo invalido");
      return false;
    }
    if (!this.emailValido(email)) {
      console.log("Error: email invalido");
      return false;
    }
    if (descripcion.length < 10) {
      console.log("Error: la descripcion es muy corta");
      return false;
    }
    return true;
  }

  emailValido(email: string) {
    return email.includes("@") && email.includes(".");
  }

  registrarEstudianteSiNoExiste(legajo: string, nombre: string, email: string) {
    if (this.buscarEstudiante(legajo) === undefined) {
      this.estudiantes.push({ legajo: legajo, nombre: nombre, email: email });
    }
  }

  buscarEstudiante(legajo: string) {
    return this.estudiantes.find((estudiante) => estudiante.legajo === legajo);
  }

  buscarSolicitud(id: number) {
    return this.solicitudes.find((solicitud) => solicitud.id === id);
  }

  actualizarEmail(legajo: string, email: string) {
    if (!this.emailValido(email)) {
      console.log("Error: email invalido");
      return false;
    }
    const estudiante = this.buscarEstudiante(legajo);
    if (estudiante === undefined) {
      console.log("Error: no existe el estudiante " + legajo);
      return false;
    }
    estudiante.email = email;
    this.guardar();
    console.log("Email actualizado para el legajo " + legajo);
    return true;
  }

  asignarResponsable(id: number) {
    const solicitud = this.buscarSolicitud(id);
    if (solicitud === undefined) {
      console.log("Error: no existe la solicitud #" + id);
      return false;
    }
    if (esEstadoFinal(solicitud.estado)) {
      console.log("Error: la solicitud #" + id + " ya esta cerrada");
      return false;
    }
    const area = areaResponsable(solicitud.tipo);
    const responsable = this.responsables.find((r) => r.area === area);
    solicitud.responsable = responsable.nombre;
    this.guardar();
    console.log(
      "Solicitud #" +
        id +
        " asignada a " +
        responsable.nombre +
        " (" +
        area +
        ")",
    );
    return true;
  }

  cambiarEstado(id: number, nuevoEstado: Estado, fecha: string) {
    const solicitud = this.buscarSolicitud(id);
    if (solicitud === undefined) {
      console.log("Error: no existe la solicitud #" + id);
      return false;
    }
    if (!transicionPermitida(solicitud.estado, nuevoEstado)) {
      console.log(
        "Error: no se puede pasar de " + solicitud.estado + " a " + nuevoEstado,
      );
      return false;
    }
    if (nuevoEstado === "en curso" && solicitud.responsable === null) {
      console.log(
        "Error: la solicitud #" + id + " no tiene responsable asignado",
      );
      return false;
    }
    solicitud.estado = nuevoEstado;
    if (esEstadoFinal(solicitud.estado)) solicitud.fechaCierre = fecha;
    this.guardar();
    console.log("Solicitud #" + id + " ahora esta " + nuevoEstado);
    return true;
  }

  buscar(
    tipo: string,
    estado: string,
    prioridad: string,
    desde: string,
    hasta: string,
  ) {
    const resultados = this.solicitudes.filter(
      (solicitud) =>
        (tipo === "" || solicitud.tipo === tipo) &&
        (estado === "" || solicitud.estado === estado) &&
        (prioridad === "" || solicitud.prioridad === prioridad) &&
        this.estaEnRango(solicitud.fecha, desde, hasta),
    );
    console.log("Resultados de la busqueda: " + resultados.length);
    for (const solicitud of resultados) {
      console.log(
        "  #" +
          solicitud.id +
          " | " +
          this.formatearFecha(solicitud.fecha) +
          " | " +
          solicitud.tipo +
          " | " +
          solicitud.prioridad +
          " | " +
          solicitud.estado,
      );
    }
    return resultados;
  }

  estaEnRango(fecha: string, desde: string, hasta: string) {
    return (desde === "" || fecha >= desde) && (hasta === "" || fecha <= hasta);
  }

  formatearFecha(fechaIso: string) {
    const [anio, mes, dia] = fechaIso.split("-");
    return dia + "/" + mes + "/" + anio;
  }

  calcularDias(solicitud: any, fechaCorte: string) {
    const fin =
      solicitud.fechaCierre !== null ? solicitud.fechaCierre : fechaCorte;
    const inicio = new Date(solicitud.fecha);
    return Math.round(
      (new Date(fin).getTime() - inicio.getTime()) / MS_POR_DIA,
    );
  }

  generarReporte(fechaCorte: string, desde: string, hasta: string) {
    const delPeriodo = this.solicitudes.filter((solicitud) =>
      this.estaEnRango(solicitud.fecha, desde, hasta),
    );
    let texto = "===== REPORTE DE SOLICITUDES =====\n";
    texto +=
      "Periodo: " +
      this.formatearFecha(desde) +
      " al " +
      this.formatearFecha(hasta) +
      "\n";
    texto += "Total: " + delPeriodo.length + "\n";
    texto += this.lineaPorEstado(delPeriodo);
    texto += this.lineasPorTipo(delPeriodo);
    texto += this.lineaPromedioCierre(delPeriodo, fechaCorte);
    texto += this.lineasDemoradas(delPeriodo, fechaCorte);
    texto += "==================================";
    console.log(texto);
    return texto;
  }

  lineaPorEstado(solicitudes: any[]) {
    const contar = (estado: Estado) =>
      solicitudes.filter((solicitud) => solicitud.estado === estado).length;
    return (
      "Por estado: pendiente=" +
      contar("pendiente") +
      ", en curso=" +
      contar("en curso") +
      ", resuelta=" +
      contar("resuelta") +
      ", rechazada=" +
      contar("rechazada") +
      "\n"
    );
  }

  lineasPorTipo(solicitudes: any[]) {
    const cantidadPorTipo = new Map<string, number>();
    for (const solicitud of solicitudes) {
      cantidadPorTipo.set(
        solicitud.tipo,
        (cantidadPorTipo.get(solicitud.tipo) ?? 0) + 1,
      );
    }
    let texto = "Por tipo:\n";
    for (const [tipo, cantidad] of cantidadPorTipo) {
      texto += "  - " + tipo + ": " + cantidad + "\n";
    }
    return texto;
  }

  lineaPromedioCierre(solicitudes: any[], fechaCorte: string) {
    const cerradas = solicitudes.filter((solicitud) =>
      esEstadoFinal(solicitud.estado),
    );
    if (cerradas.length === 0) {
      return "Promedio de dias hasta el cierre: sin datos\n";
    }
    const totalDias = cerradas.reduce(
      (suma, solicitud) => suma + this.calcularDias(solicitud, fechaCorte),
      0,
    );
    return (
      "Promedio de dias hasta el cierre: " +
      (totalDias / cerradas.length).toFixed(1) +
      "\n"
    );
  }

  lineasDemoradas(solicitudes: any[], fechaCorte: string) {
    const demoradas = solicitudes.filter(
      (solicitud) =>
        !esEstadoFinal(solicitud.estado) &&
        this.calcularDias(solicitud, fechaCorte) > 7,
    );
    let texto =
      "Solicitudes demoradas (mas de 7 dias abiertas): " +
      demoradas.length +
      "\n";
    for (const solicitud of demoradas) {
      texto +=
        "  #" +
        solicitud.id +
        " | " +
        this.formatearFecha(solicitud.fecha) +
        " | " +
        solicitud.tipo +
        " | " +
        this.calcularDias(solicitud, fechaCorte) +
        " dias\n";
    }
    return texto;
  }
}
