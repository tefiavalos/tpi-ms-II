import * as fs from "fs";
import { GestorSolicitudes } from "./GestorSolicitudes";

// Recorrido de prueba del sistema con datos ficticios.
const ARCHIVO = "data/solicitudes.json";
if (fs.existsSync(ARCHIVO)) fs.unlinkSync(ARCHIVO);
fs.mkdirSync("data", { recursive: true });

const g = new GestorSolicitudes(ARCHIVO);

console.log("--- Registro de solicitudes ---");
g.registrarSolicitud("10001", "Ana Torres", "ana.torres@mail.com", "certificado", "Certificado de alumno regular", "2026-10-01", false);
g.registrarSolicitud("10002", "Bruno Díaz", "bruno.diaz@mail.com", "reclamo de nota", "Revision del segundo parcial", "2026-10-05", false);
g.registrarSolicitud("10003", "Carla Méndez", "carla.mendez@mail.com", "equivalencia", "Equivalencia de Programacion I", "2026-10-10", true);
g.registrarSolicitud("10001", "Ana Torres", "ana.torres@mail.com", "baja de materia", "Baja de Base de Datos I", "2026-10-20", false);
g.registrarSolicitud("10004", "Diego Sosa", "diego.sosa@mail.com", "certificado", "Certificado de examen final", "2026-10-25", true);

console.log("--- Registros con datos incorrectos ---");
g.registrarSolicitud("123", "Eva Luna", "eva.luna@mail.com", "certificado", "Certificado de alumno regular", "2026-10-26", false);
g.registrarSolicitud("10005", "Eva Luna", "eva.lunamail.com", "certificado", "Certificado de alumno regular", "2026-10-26", false);
g.registrarSolicitud("10005", "Eva Luna", "eva.luna@mail.com", "certificado", "Corto", "2026-10-26", false);
g.registrarSolicitud("10005", "Eva Luna", "eva.luna@mail.com", "titulo", "Tramite de titulo intermedio", "2026-10-26", false);

console.log("--- Asignacion y cambios de estado ---");
g.asignarResponsable(1);
g.cambiarEstado(1, "en curso", "2026-10-02");
g.cambiarEstado(1, "resuelta", "2026-10-04");
g.asignarResponsable(2);
g.cambiarEstado(2, "en curso", "2026-10-06");
g.cambiarEstado(3, "en curso", "2026-10-11");
g.cambiarEstado(3, "rechazada", "2026-10-12");
g.cambiarEstado(1, "en curso", "2026-10-15");
g.asignarResponsable(1);
g.asignarResponsable(99);
g.actualizarEmail("10002", "bruno.d@mail.com");
g.actualizarEmail("10002", "bruno.mail");

console.log("--- Busquedas ---");
g.buscar("", "pendiente", "", "", "");
g.buscar("certificado", "", "", "2026-10-01", "2026-10-31");

console.log("--- Reporte ---");
g.generarReporte("2026-10-30", "2026-10-01", "2026-10-31");
