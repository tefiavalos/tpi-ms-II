import { validarEmail, validarLegajo } from "./validaciones";

/** Datos de un estudiante tal como se guardan en el archivo. */
export interface DatosEstudiante {
  legajo: string;
  nombre: string;
  email: string;
}

/** Estudiante que realiza solicitudes. Valida sus propios datos. */
export class Estudiante {
  readonly legajo: string;
  readonly nombre: string;
  private _email: string;

  constructor(datos: DatosEstudiante) {
    validarLegajo(datos.legajo);
    validarEmail(datos.email);
    this.legajo = datos.legajo;
    this.nombre = datos.nombre;
    this._email = datos.email;
  }

  get email(): string {
    return this._email;
  }

  cambiarEmail(nuevoEmail: string): void {
    validarEmail(nuevoEmail);
    this._email = nuevoEmail;
  }

  aDatos(): DatosEstudiante {
    return { legajo: this.legajo, nombre: this.nombre, email: this._email };
  }
}
