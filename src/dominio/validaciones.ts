import { DatoInvalido } from "./errores";

const LARGO_LEGAJO = 5;
const LARGO_MINIMO_DESCRIPCION = 10;

export function validarLegajo(legajo: string): void {
  if (legajo.length !== LARGO_LEGAJO) {
    throw new DatoInvalido("legajo invalido");
  }
}

export function validarEmail(email: string): void {
  if (!email.includes("@") || !email.includes(".")) {
    throw new DatoInvalido("email invalido");
  }
}

export function validarDescripcion(descripcion: string): void {
  if (descripcion.length < LARGO_MINIMO_DESCRIPCION) {
    throw new DatoInvalido("la descripcion es muy corta");
  }
}
