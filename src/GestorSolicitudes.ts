import * as fs from "fs";

// Gestor de solicitudes academicas
export class GestorSolicitudes {
  lst: any[] = [];
  estudiantes: any[] = [];
  responsables: any[] = [
    { id: 1, nombre: "Laura Gómez", area: "Alumnos" },
    { id: 2, nombre: "Martín Ruiz", area: "Coordinación" },
  ];
  archivo: string;
  ultimoId: number = 0;

  constructor(archivo: string) {
    this.archivo = archivo;
    this.cargar();
  }

  cargar() {
    try {
      const d = JSON.parse(fs.readFileSync(this.archivo, "utf-8"));
      this.lst = d.solicitudes;
      this.estudiantes = d.estudiantes;
      this.ultimoId = d.ultimoId;
    } catch (e) {}
  }

  guardar() {
    const d = { ultimoId: this.ultimoId, estudiantes: this.estudiantes, solicitudes: this.lst };
    fs.writeFileSync(this.archivo, JSON.stringify(d, null, 2));
  }

  registrarSolicitud(legajo: string, nombre: string, email: string, tipo: string, descripcion: string, fecha: string, urgente: boolean) {
    if (legajo == "" || legajo.length != 5) {
      console.log("Error: legajo invalido");
      return -1;
    }
    if (email.indexOf("@") == -1 || email.indexOf(".") == -1) {
      console.log("Error: email invalido");
      return -1;
    }
    if (descripcion.length < 10) {
      console.log("Error: la descripcion es muy corta");
      return -1;
    }
    let p = "";
    if (tipo == "certificado") {
      p = "baja";
    } else if (tipo == "equivalencia") {
      p = "media";
    } else if (tipo == "reclamo de nota") {
      p = "alta";
    } else if (tipo == "baja de materia") {
      p = "media";
    } else {
      console.log("Error: tipo de solicitud invalido");
      return -1;
    }
    if (urgente == true) {
      if (p == "baja") p = "media";
      else p = "alta";
    }
    let est = null;
    for (let i = 0; i < this.estudiantes.length; i++) {
      if (this.estudiantes[i].legajo == legajo) est = this.estudiantes[i];
    }
    if (est == null) {
      est = { legajo: legajo, nombre: nombre, email: email };
      this.estudiantes.push(est);
    }
    this.ultimoId++;
    const s = {
      id: this.ultimoId,
      legajo: legajo,
      tipo: tipo,
      descripcion: descripcion,
      fecha: fecha,
      prioridad: p,
      estado: "pendiente",
      responsable: null,
      fechaCierre: null,
    };
    this.lst.push(s);
    this.guardar();
    console.log("Solicitud #" + s.id + " registrada: " + tipo + " (prioridad " + p + ")");
    return s.id;
  }

  actualizarEmail(legajo: string, email: string) {
    if (email.indexOf("@") == -1 || email.indexOf(".") == -1) {
      console.log("Error: email invalido");
      return false;
    }
    let est = null;
    for (let i = 0; i < this.estudiantes.length; i++) {
      if (this.estudiantes[i].legajo == legajo) est = this.estudiantes[i];
    }
    if (est == null) {
      console.log("Error: no existe el estudiante " + legajo);
      return false;
    }
    est.email = email;
    this.guardar();
    console.log("Email actualizado para el legajo " + legajo);
    return true;
  }

  asignarResponsable(id: number) {
    let s = null;
    for (let i = 0; i < this.lst.length; i++) {
      if (this.lst[i].id == id) s = this.lst[i];
    }
    if (s == null) {
      console.log("Error: no existe la solicitud #" + id);
      return false;
    }
    if (s.estado == "resuelta" || s.estado == "rechazada") {
      console.log("Error: la solicitud #" + id + " ya esta cerrada");
      return false;
    }
    let area = "";
    if (s.tipo == "certificado") area = "Alumnos";
    else if (s.tipo == "equivalencia") area = "Coordinación";
    else if (s.tipo == "reclamo de nota") area = "Coordinación";
    else if (s.tipo == "baja de materia") area = "Alumnos";
    let r = null;
    for (let i = 0; i < this.responsables.length; i++) {
      if (this.responsables[i].area == area) r = this.responsables[i];
    }
    s.responsable = r.nombre;
    this.guardar();
    console.log("Solicitud #" + id + " asignada a " + r.nombre + " (" + area + ")");
    return true;
  }

  cambiarEstado(id: number, nuevo: string, fecha: string) {
    let s = null;
    for (let i = 0; i < this.lst.length; i++) {
      if (this.lst[i].id == id) s = this.lst[i];
    }
    if (s == null) {
      console.log("Error: no existe la solicitud #" + id);
      return false;
    }
    let ok = false;
    if (s.estado == "pendiente") {
      if (nuevo == "en curso" || nuevo == "rechazada") ok = true;
    } else if (s.estado == "en curso") {
      if (nuevo == "resuelta" || nuevo == "rechazada") ok = true;
    }
    if (!ok) {
      console.log("Error: no se puede pasar de " + s.estado + " a " + nuevo);
      return false;
    }
    if (nuevo == "en curso" && s.responsable == null) {
      console.log("Error: la solicitud #" + id + " no tiene responsable asignado");
      return false;
    }
    s.estado = nuevo;
    if (nuevo == "resuelta" || nuevo == "rechazada") s.fechaCierre = fecha;
    this.guardar();
    console.log("Solicitud #" + id + " ahora esta " + nuevo);
    return true;
  }

  buscar(tipo: string, estado: string, prioridad: string, desde: string, hasta: string) {
    const res = [];
    for (let i = 0; i < this.lst.length; i++) {
      const x = this.lst[i];
      if (tipo != "" && x.tipo != tipo) continue;
      if (estado != "" && x.estado != estado) continue;
      if (prioridad != "" && x.prioridad != prioridad) continue;
      if (desde != "" && x.fecha < desde) continue;
      if (hasta != "" && x.fecha > hasta) continue;
      res.push(x);
    }
    console.log("Resultados de la busqueda: " + res.length);
    for (let i = 0; i < res.length; i++) {
      const f = res[i].fecha.split("-");
      console.log("  #" + res[i].id + " | " + f[2] + "/" + f[1] + "/" + f[0] + " | " + res[i].tipo + " | " + res[i].prioridad + " | " + res[i].estado);
    }
    return res;
  }

  calcularDias(s: any, hoy: string) {
    const fin = s.fechaCierre != null ? s.fechaCierre : hoy;
    const d1 = new Date(s.fecha);
    const d2 = new Date(fin);
    return Math.round((d2.getTime() - d1.getTime()) / 86400000);
  }

  generarReporte(hoy: string, desde: string, hasta: string) {
    let pend = 0;
    let enc = 0;
    let res = 0;
    let rech = 0;
    const porTipo: any = {};
    let total = 0;
    let dias = 0;
    let cerradas = 0;
    const demoradas = [];
    for (let i = 0; i < this.lst.length; i++) {
      const s = this.lst[i];
      if (desde != "" && s.fecha < desde) continue;
      if (hasta != "" && s.fecha > hasta) continue;
      total++;
      if (s.estado == "pendiente") pend++;
      else if (s.estado == "en curso") enc++;
      else if (s.estado == "resuelta") res++;
      else if (s.estado == "rechazada") rech++;
      if (porTipo[s.tipo] == undefined) porTipo[s.tipo] = 0;
      porTipo[s.tipo]++;
      if (s.estado == "resuelta" || s.estado == "rechazada") {
        dias = dias + this.calcularDias(s, hoy);
        cerradas++;
      } else {
        if (this.calcularDias(s, hoy) > 7) demoradas.push(s);
      }
    }
    const f1 = desde.split("-");
    const f2 = hasta.split("-");
    let txt = "";
    txt += "===== REPORTE DE SOLICITUDES =====\n";
    txt += "Periodo: " + f1[2] + "/" + f1[1] + "/" + f1[0] + " al " + f2[2] + "/" + f2[1] + "/" + f2[0] + "\n";
    txt += "Total: " + total + "\n";
    txt += "Por estado: pendiente=" + pend + ", en curso=" + enc + ", resuelta=" + res + ", rechazada=" + rech + "\n";
    txt += "Por tipo:\n";
    for (const t in porTipo) txt += "  - " + t + ": " + porTipo[t] + "\n";
    if (cerradas > 0) txt += "Promedio de dias hasta el cierre: " + (dias / cerradas).toFixed(1) + "\n";
    else txt += "Promedio de dias hasta el cierre: sin datos\n";
    txt += "Solicitudes demoradas (mas de 7 dias abiertas): " + demoradas.length + "\n";
    for (let i = 0; i < demoradas.length; i++) {
      const f = demoradas[i].fecha.split("-");
      txt += "  #" + demoradas[i].id + " | " + f[2] + "/" + f[1] + "/" + f[0] + " | " + demoradas[i].tipo + " | " + this.calcularDias(demoradas[i], hoy) + " dias\n";
    }
    txt += "==================================";
    console.log(txt);
    return txt;
  }
}
