import { OperacionNoPermitida } from "./errores";
import { diasEntre } from "./fechas";
import { esEstadoFinal, transicionPermitida } from "./reglas";
import type { Estado, Prioridad, TipoSolicitud } from "./tipos";

/** Datos de una solicitud tal como se guardan en el archivo. */
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

/**
 * Solicitud de un estudiante. Concentra las reglas que dependen de sus
 * propios datos: cambios de estado, asignación de responsable y días que
 * estuvo abierta.
 */
export class Solicitud {
  readonly id: number;
  readonly legajo: string;
  readonly tipo: TipoSolicitud;
  readonly descripcion: string;
  readonly fecha: string;
  readonly prioridad: Prioridad;
  private _estado: Estado;
  private _responsable: string | null;
  private _fechaCierre: string | null;

  constructor(datos: DatosSolicitud) {
    this.id = datos.id;
    this.legajo = datos.legajo;
    this.tipo = datos.tipo;
    this.descripcion = datos.descripcion;
    this.fecha = datos.fecha;
    this.prioridad = datos.prioridad;
    this._estado = datos.estado;
    this._responsable = datos.responsable;
    this._fechaCierre = datos.fechaCierre;
  }

  get estado(): Estado {
    return this._estado;
  }

  get responsable(): string | null {
    return this._responsable;
  }

  get fechaCierre(): string | null {
    return this._fechaCierre;
  }

  estaCerrada(): boolean {
    return esEstadoFinal(this._estado);
  }

  asignarResponsable(nombre: string): void {
    if (this.estaCerrada()) {
      throw new OperacionNoPermitida(
        `la solicitud #${this.id} ya esta cerrada`,
      );
    }
    this._responsable = nombre;
  }

  cambiarEstado(nuevoEstado: Estado, fecha: string): void {
    if (!transicionPermitida(this._estado, nuevoEstado)) {
      throw new OperacionNoPermitida(
        `no se puede pasar de ${this._estado} a ${nuevoEstado}`,
      );
    }
    if (nuevoEstado === "en curso" && this._responsable === null) {
      throw new OperacionNoPermitida(
        `la solicitud #${this.id} no tiene responsable asignado`,
      );
    }
    this._estado = nuevoEstado;
    if (this.estaCerrada()) this._fechaCierre = fecha;
  }

  /** Días desde que se registró hasta que se cerró (o hasta la fecha de corte si sigue abierta). */
  diasAbierta(fechaCorte: string): number {
    return diasEntre(this.fecha, this._fechaCierre ?? fechaCorte);
  }

  aDatos(): DatosSolicitud {
    return {
      id: this.id,
      legajo: this.legajo,
      tipo: this.tipo,
      descripcion: this.descripcion,
      fecha: this.fecha,
      prioridad: this.prioridad,
      estado: this._estado,
      responsable: this._responsable,
      fechaCierre: this._fechaCierre,
    };
  }
}
