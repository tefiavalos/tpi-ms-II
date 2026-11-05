// Errores esperados del sistema. Reemplazan a los códigos -1 y false: quien
// llama no puede ignorarlos sin querer y el mensaje explica el motivo.

export class ErrorDeSolicitud extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = this.constructor.name;
  }
}

/** Un dato ingresado no cumple las reglas (legajo, email, descripción, tipo). */
export class DatoInvalido extends ErrorDeSolicitud {}

/** No existe la solicitud o el estudiante buscado. */
export class NoEncontrado extends ErrorDeSolicitud {}

/** La operación no se puede hacer en el estado actual de la solicitud. */
export class OperacionNoPermitida extends ErrorDeSolicitud {}

/**
 * Falla al leer los datos guardados. No es un error del usuario: no se
 * muestra como mensaje común, se deja propagar para no seguir trabajando
 * con datos incompletos.
 */
export class ErrorDePersistencia extends Error {}
