import * as fs from "fs";
import { GestorSolicitudes, type NuevaSolicitud } from "./GestorSolicitudes";
import { RangoFechas } from "./dominio/RangoFechas";
import { RepositorioJson } from "./repositorio/RepositorioJson";
import {
  ejecutar,
  listadoDeBusqueda,
  mensajeAsignacion,
  mensajeCambioDeEstado,
  mensajeEmailActualizado,
  mensajeRegistro,
} from "./consola/mensajes";

// Recorrido de prueba del sistema con datos ficticios.
const ARCHIVO = "data/solicitudes.json";
if (fs.existsSync(ARCHIVO)) fs.unlinkSync(ARCHIVO);
fs.mkdirSync("data", { recursive: true });

const gestor = new GestorSolicitudes(new RepositorioJson(ARCHIVO));

function registrar(datos: NuevaSolicitud): void {
  ejecutar(() => mensajeRegistro(gestor.registrarSolicitud(datos)));
}

console.log("--- Registro de solicitudes ---");
registrar({
  legajo: "10001",
  nombre: "Ana Torres",
  email: "ana.torres@mail.com",
  tipo: "certificado",
  descripcion: "Certificado de alumno regular",
  fecha: "2026-10-01",
  urgente: false,
});
registrar({
  legajo: "10002",
  nombre: "Bruno Díaz",
  email: "bruno.diaz@mail.com",
  tipo: "reclamo de nota",
  descripcion: "Revision del segundo parcial",
  fecha: "2026-10-05",
  urgente: false,
});
registrar({
  legajo: "10003",
  nombre: "Carla Méndez",
  email: "carla.mendez@mail.com",
  tipo: "equivalencia",
  descripcion: "Equivalencia de Programacion I",
  fecha: "2026-10-10",
  urgente: true,
});
registrar({
  legajo: "10001",
  nombre: "Ana Torres",
  email: "ana.torres@mail.com",
  tipo: "baja de materia",
  descripcion: "Baja de Base de Datos I",
  fecha: "2026-10-20",
  urgente: false,
});
registrar({
  legajo: "10004",
  nombre: "Diego Sosa",
  email: "diego.sosa@mail.com",
  tipo: "certificado",
  descripcion: "Certificado de examen final",
  fecha: "2026-10-25",
  urgente: true,
});

console.log("--- Registros con datos incorrectos ---");
const solicitudDeEva: NuevaSolicitud = {
  legajo: "10005",
  nombre: "Eva Luna",
  email: "eva.luna@mail.com",
  tipo: "certificado",
  descripcion: "Certificado de alumno regular",
  fecha: "2026-10-26",
  urgente: false,
};
registrar({ ...solicitudDeEva, legajo: "123" });
registrar({ ...solicitudDeEva, email: "eva.lunamail.com" });
registrar({ ...solicitudDeEva, descripcion: "Corto" });
registrar({
  ...solicitudDeEva,
  tipo: "titulo",
  descripcion: "Tramite de titulo intermedio",
});

console.log("--- Asignacion y cambios de estado ---");
ejecutar(() => mensajeAsignacion(gestor.asignarResponsable(1)));
ejecutar(() =>
  mensajeCambioDeEstado(gestor.cambiarEstado(1, "en curso", "2026-10-02")),
);
ejecutar(() =>
  mensajeCambioDeEstado(gestor.cambiarEstado(1, "resuelta", "2026-10-04")),
);
ejecutar(() => mensajeAsignacion(gestor.asignarResponsable(2)));
ejecutar(() =>
  mensajeCambioDeEstado(gestor.cambiarEstado(2, "en curso", "2026-10-06")),
);
ejecutar(() =>
  mensajeCambioDeEstado(gestor.cambiarEstado(3, "en curso", "2026-10-11")),
);
ejecutar(() =>
  mensajeCambioDeEstado(gestor.cambiarEstado(3, "rechazada", "2026-10-12")),
);
ejecutar(() =>
  mensajeCambioDeEstado(gestor.cambiarEstado(1, "en curso", "2026-10-15")),
);
ejecutar(() => mensajeAsignacion(gestor.asignarResponsable(1)));
ejecutar(() => mensajeAsignacion(gestor.asignarResponsable(99)));
ejecutar(() =>
  mensajeEmailActualizado(gestor.actualizarEmail("10002", "bruno.d@mail.com")),
);
ejecutar(() =>
  mensajeEmailActualizado(gestor.actualizarEmail("10002", "bruno.mail")),
);

console.log("--- Busquedas ---");
const octubre = new RangoFechas("2026-10-01", "2026-10-31");
ejecutar(() => listadoDeBusqueda(gestor.buscar({ estado: "pendiente" })));
ejecutar(() =>
  listadoDeBusqueda(gestor.buscar({ tipo: "certificado", rango: octubre })),
);

console.log("--- Reporte ---");
ejecutar(() => gestor.generarReporte("2026-10-30", octubre));
