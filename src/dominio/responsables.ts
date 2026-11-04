import { NoEncontrado } from "./errores";
import type { Area } from "./tipos";

export interface Responsable {
  id: number;
  nombre: string;
  area: Area;
}

// Responsables de cada área (datos ficticios).
const RESPONSABLES: Responsable[] = [
  { id: 1, nombre: "Laura Gómez", area: "Alumnos" },
  { id: 2, nombre: "Martín Ruiz", area: "Coordinación" },
];

export function responsableDelArea(area: Area): Responsable {
  const responsable = RESPONSABLES.find((r) => r.area === area);
  if (responsable === undefined) {
    throw new NoEncontrado(`no hay responsable para el area ${area}`);
  }
  return responsable;
}
