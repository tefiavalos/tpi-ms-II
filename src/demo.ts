import * as fs from "fs";
import { GestorSolicitudes } from "./GestorSolicitudes";
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

function registrar(
  legajo: string,
  nombre: string,
  email: string,
  tipo: string,
  descripcion: string,
  fecha: string,
  urgente: boolean,
): void {
  ejecutar(() =>
    mensajeRegistro(
      gestor.registrarSolicitud(
        legajo,
        nombre,
        email,
        tipo,
        descripcion,
        fecha,
        urgente,
      ),
    ),
  );
}

console.log("--- Registro de solicitudes ---");
registrar(
  "10001",
  "Ana Torres",
  "ana.torres@mail.com",
  "certificado",
  "Certificado de alumno regular",
  "2026-10-01",
  false,
);
registrar(
  "10002",
  "Bruno Díaz",
  "bruno.diaz@mail.com",
  "reclamo de nota",
  "Revision del segundo parcial",
  "2026-10-05",
  false,
);
registrar(
  "10003",
  "Carla Méndez",
  "carla.mendez@mail.com",
  "equivalencia",
  "Equivalencia de Programacion I",
  "2026-10-10",
  true,
);
registrar(
  "10001",
  "Ana Torres",
  "ana.torres@mail.com",
  "baja de materia",
  "Baja de Base de Datos I",
  "2026-10-20",
  false,
);
registrar(
  "10004",
  "Diego Sosa",
  "diego.sosa@mail.com",
  "certificado",
  "Certificado de examen final",
  "2026-10-25",
  true,
);

console.log("--- Registros con datos incorrectos ---");
registrar(
  "123",
  "Eva Luna",
  "eva.luna@mail.com",
  "certificado",
  "Certificado de alumno regular",
  "2026-10-26",
  false,
);
registrar(
  "10005",
  "Eva Luna",
  "eva.lunamail.com",
  "certificado",
  "Certificado de alumno regular",
  "2026-10-26",
  false,
);
registrar(
  "10005",
  "Eva Luna",
  "eva.luna@mail.com",
  "certificado",
  "Corto",
  "2026-10-26",
  false,
);
registrar(
  "10005",
  "Eva Luna",
  "eva.luna@mail.com",
  "titulo",
  "Tramite de titulo intermedio",
  "2026-10-26",
  false,
);

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
ejecutar(() => listadoDeBusqueda(gestor.buscar("", "pendiente", "", "", "")));
ejecutar(() =>
  listadoDeBusqueda(
    gestor.buscar("certificado", "", "", "2026-10-01", "2026-10-31"),
  ),
);

console.log("--- Reporte ---");
ejecutar(() => gestor.generarReporte("2026-10-30", "2026-10-01", "2026-10-31"));
