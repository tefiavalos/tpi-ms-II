// Tipos del dominio. Son uniones de textos: el compilador avisa si en
// cualquier parte del código se escribe mal un estado, un tipo o una prioridad.

export type Estado = "pendiente" | "en curso" | "resuelta" | "rechazada";

export type Prioridad = "baja" | "media" | "alta";

export type TipoSolicitud =
  | "certificado"
  | "equivalencia"
  | "reclamo de nota"
  | "baja de materia";

export type Area = "Alumnos" | "Coordinación";
