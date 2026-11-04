import type { Area, Estado, Prioridad, TipoSolicitud } from "./tipos";

interface ReglaDeTipo {
  prioridad: Prioridad;
  area: Area;
}

// Reglas de cada tipo de solicitud. Para agregar un tipo nuevo alcanza con
// sumar una entrada a esta tabla; la lógica que la usa no cambia (OCP).
const REGLAS_POR_TIPO: Record<TipoSolicitud, ReglaDeTipo> = {
  certificado: { prioridad: "baja", area: "Alumnos" },
  equivalencia: { prioridad: "media", area: "Coordinación" },
  "reclamo de nota": { prioridad: "alta", area: "Coordinación" },
  "baja de materia": { prioridad: "media", area: "Alumnos" },
};

// Estados a los que se puede pasar desde cada estado.
const TRANSICIONES: Record<Estado, Estado[]> = {
  pendiente: ["en curso", "rechazada"],
  "en curso": ["resuelta", "rechazada"],
  resuelta: [],
  rechazada: [],
};

// Prioridad que corresponde cuando la solicitud se marca como urgente.
const PRIORIDAD_SI_ES_URGENTE: Record<Prioridad, Prioridad> = {
  baja: "media",
  media: "alta",
  alta: "alta",
};

/** Indica si el texto recibido corresponde a un tipo de solicitud conocido. */
export function esTipoValido(tipo: string): tipo is TipoSolicitud {
  return Object.hasOwn(REGLAS_POR_TIPO, tipo);
}

/** Prioridad con la que se registra una solicitud según su tipo. */
export function prioridadInicial(
  tipo: TipoSolicitud,
  urgente: boolean,
): Prioridad {
  const prioridad = REGLAS_POR_TIPO[tipo].prioridad;
  return urgente ? PRIORIDAD_SI_ES_URGENTE[prioridad] : prioridad;
}

/** Área que debe atender cada tipo de solicitud. */
export function areaResponsable(tipo: TipoSolicitud): Area {
  return REGLAS_POR_TIPO[tipo].area;
}

/** Indica si se puede pasar del estado actual al nuevo. */
export function transicionPermitida(actual: Estado, nuevo: Estado): boolean {
  return TRANSICIONES[actual].includes(nuevo);
}

/** Un estado es final (solicitud cerrada) si no admite más cambios. */
export function esEstadoFinal(estado: Estado): boolean {
  return TRANSICIONES[estado].length === 0;
}
