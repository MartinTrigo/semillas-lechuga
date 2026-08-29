// ==========================================================================
// Semillas de Lechuga — servicio Apps Script
//
// Un solo servicio y una sola planilla para todo el curso. Cada registro dice
// de qué variedad viene y se escribe en la hoja de su etapa. Que las seis
// variedades compartan planilla no es una simplificación: es el objetivo. Lo
// que se quiere comparar al final son las seis columnas una al lado de la otra,
// y eso con seis archivos distintos no se hace.
//
// EL CONTROL DE ACCESO ESTÁ DESDE EL PRIMER DÍA, A PROPÓSITO.
// En MonAgric se agregó después, y en el medio hubo un período en que
// cualquiera con la dirección del servicio —que está en el código público—
// podía inventar registros y borrar una temporada entera. Acá no se repite.
//
// El detalle del modelo de acceso y cómo operarlo está en SEGURIDAD.md.
//
// PARA EMPEZAR (no hace falta tocar este código):
//   1. Crear en Drive la carpeta "Semillas de Lechuga — Datos".
//   2. Adentro, dos planillas: "Semillas · Registros" y "Semillas · Accesos".
//   3. En el editor: Configuración del proyecto (engranaje) → Propiedades del
//      script → cargar REGISTROS, ACCESOS y CLAVE_ADMIN, y APRETAR EL BOTÓN
//      "Guardar propiedades del script". Si no se aprieta, no se guarda nada.
//   4. Ejecutar revisarConfiguracion() y después prepararPlanillas().
//   5. Ejecutar crearInvitaciones() para sacar los seis códigos.
//   6. Implementar → Nueva implementación → Aplicación web → Ejecutar como: yo,
//      Quién tiene acceso: cualquier persona. Copiar la URL a docs/js/sincro.js.
// ==========================================================================

// ---------- Lo que se configura sin tocar el código ----------
//
// Nada de esto vive acá adentro: va en Configuración del proyecto (engranaje)
// → Propiedades del script. Así el repositorio, que es público, no lleva
// identificadores ni claves.
//
//   REGISTROS    id de la planilla "Semillas · Registros"
//   ACCESOS      id de la planilla "Semillas · Accesos"
//   CLAVE_ADMIN  clave de administración, larga y al azar
//
function propiedad(nombre) {
  return String(PropertiesService.getScriptProperties().getProperty(nombre) || "").trim();
}

// Acepta tanto el id pelado como la dirección completa de la planilla.
//
// Copiar la URL entera es lo que sale natural: se abre la planilla y se copia
// de la barra del navegador. Pedir que además recorten el pedazo del medio es
// pedir un paso que se va a errar. Se recorta acá.
function idDe(valor) {
  var s = String(valor || "").trim();
  var enUrl = s.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (enUrl) return enUrl[1];
  return s;
}

function idDePropiedad(nombre) {
  var crudo = propiedad(nombre);
  if (!crudo) {
    throw new Error("Falta la propiedad " + nombre + ". Se carga en Configuración del "
      + "proyecto (engranaje) → Propiedades del script.");
  }
  var id = idDe(crudo);
  if (!/^[a-zA-Z0-9_-]{20,}$/.test(id)) {
    throw new Error("La propiedad " + nombre + " no parece un id de planilla ni una "
      + "dirección de Google Sheets. Dice: " + crudo);
  }
  return id;
}

// Abre la planilla y, si no puede, explica cuál es y por qué.
function abrirPlanilla(nombre) {
  var id = idDePropiedad(nombre);
  try {
    return SpreadsheetApp.openById(id);
  } catch (err) {
    throw new Error("No se pudo abrir la planilla de " + nombre + " (id " + id + "). "
      + "Suele ser una de tres: el id es de otro archivo, la planilla está en otra "
      + "cuenta de Google, o el archivo no es una hoja de cálculo. Detalle: " + err);
  }
}

function planillaRegistros() {
  return abrirPlanilla("REGISTROS");
}

// Planilla aparte con quién tiene acceso. No es la de los datos: si un
// estudiante pudiera abrirla, vería las huellas de todos los demás.
function libroAccesos() {
  return abrirPlanilla("ACCESOS");
}

// ==========================================================================
// DIAGNÓSTICO
//
// Se ejecuta A MANO cuando algo no arranca. No toca nada: solo mira y cuenta
// en castellano qué encontró y qué falta. Es lo primero que conviene correr si
// prepararPlanillas() falla.
// ==========================================================================

function revisarConfiguracion() {
  var lineas = [];
  var todoBien = true;

  // Lo primero: qué propiedades ve el script REALMENTE. Si acá no aparece
  // ninguna, o aparecen con otro nombre, ese es todo el problema: los nombres
  // distinguen mayúsculas y no se guardan hasta apretar el botón de guardar.
  var cargadas = Object.keys(PropertiesService.getScriptProperties().getProperties());
  lineas.push(cargadas.length
    ? "Propiedades que ve el script: " + cargadas.join(", ")
    : "El script NO VE NINGUNA PROPIEDAD. Si las cargaste, faltó apretar "
      + "«Guardar propiedades del script» abajo del formulario.");
  lineas.push("");

  ["REGISTROS", "ACCESOS"].forEach(function (nombre) {
    var crudo = propiedad(nombre);
    if (!crudo) {
      lineas.push("✗ " + nombre + ": la propiedad no está cargada.");
      todoBien = false;
      return;
    }
    try {
      var libro = abrirPlanilla(nombre);
      var hojas = libro.getSheets().map(function (h) { return h.getName(); });
      lineas.push("✓ " + nombre + ": abre bien → " + libro.getName()
                  + "  [hojas: " + hojas.join(", ") + "]");
    } catch (err) {
      lineas.push("✗ " + nombre + ": " + err.message);
      todoBien = false;
    }
  });

  var clave = propiedad("CLAVE_ADMIN");
  if (!clave) {
    lineas.push("✗ CLAVE_ADMIN: la propiedad no está cargada.");
    todoBien = false;
  } else if (clave.length < 12) {
    lineas.push("⚠ CLAVE_ADMIN: cargada, pero es corta (" + clave.length
                + " caracteres). Conviene una de 20 o más, al azar.");
  } else {
    lineas.push("✓ CLAVE_ADMIN: cargada (" + clave.length + " caracteres).");
  }

  if (propiedad("REGISTROS") && propiedad("REGISTROS") === propiedad("ACCESOS")) {
    lineas.push("✗ REGISTROS y ACCESOS apuntan a la MISMA planilla. Tienen que ser dos "
                + "archivos distintos: si no, quien abra los datos del curso ve también "
                + "las credenciales.");
    todoBien = false;
  }

  lineas.push("");
  lineas.push(todoBien
    ? "Todo en orden. Ya se puede ejecutar prepararPlanillas()."
    : "Corregí lo marcado con ✗ y volvé a ejecutar esta función.");

  var texto = lineas.join("\n");
  Logger.log(texto);
  return texto;
}

// Las seis variedades del proyecto. Tienen que ser los mismos identificadores
// que docs/datos/variedades.json: es lo que ata el código de invitación con la
// ficha de la wiki y con la columna de la planilla.
var VARIEDADES = {
  "reina-de-mayo":       "Reina de Mayo (mantecosa verde claro)",
  "gallega-de-invierno": "Gallega de Invierno (mantecosa, frío)",
  "brisa":               "Brisa (crespa verde)",
  "kantu":               "Hoja de Roble Kantu (roble verde)",
  "granate":             "Hoja de Roble Granate (roble roja)",
  "lilar":               "Lilar (mantecosa morada)"
};

var INVITACIONES_ENCABEZADOS = ["Código", "Variedad", "Para quién", "Estado", "Creada",
                                "Usada el", "Dispositivo"];
var DISPOSITIVOS_ENCABEZADOS = ["Dispositivo", "Variedad", "Persona", "Activo", "Alta",
                                "Última actividad", "Registros", "Huella"];

// ==========================================================================
// LAS HOJAS DE DATOS
//
// Cada etapa es una hoja y cada columna es un par [encabezado, clave]. Las
// claves son las mismas que en docs/js/etapas.js, en el mismo orden, para que
// se puedan leer los dos archivos en paralelo y ver que coinciden.
//
// A las columnas declaradas acá el servicio les agrega siempre, y solas:
//   adelante   Id, Variedad, Estudiante
//   atrás      Cargado por (el teléfono), Recibido (cuándo llegó)
// ==========================================================================

var HOJAS = {
  emergencia: {
    nombre: "Emergencia",
    columnas: [
      ["Fecha", "fecha"],
      ["Plántulas emergidas", "emergidas"],
      ["Temp. máxima (°C)", "temp_max"],
      ["Temp. mínima (°C)", "temp_min"],
      ["Uniformidad (1-5)", "uniformidad"],
      ["Vigor inicial (1-5)", "vigor"],
      ["Observaciones", "observaciones"]
    ]
  },

  almacigo: {
    nombre: "Almácigo",
    columnas: [
      ["Fecha", "fecha"],
      ["Altura (cm)", "altura"],
      ["Hojas verdaderas", "hojas"],
      ["Diámetro roseta (cm)", "diametro"],
      ["Color (1-5)", "color"],
      ["Uniformidad (1-5)", "uniformidad"],
      ["Sanidad (1-5)", "sanidad"],
      ["Observaciones", "observaciones"]
    ]
  },

  trasplante: {
    nombre: "Trasplante",
    columnas: [
      ["Fecha", "fecha"],
      ["Momento", "momento"],
      ["Plantas trasplantadas", "trasplantadas"],
      ["Plantas vivas", "vivas"],
      ["Distancia de plantación", "marco"],
      ["Diámetro roseta (cm)", "diametro"],
      ["Peso por planta (g)", "peso_planta"],
      ["Uniformidad (1-5)", "uniformidad"],
      ["Sanidad (1-5)", "sanidad"],
      ["Plantas con daños", "danios"],
      ["Plantas espigadas", "espigadas"],
      ["Observaciones", "observaciones"]
    ]
  },

  babyleaf: {
    nombre: "Baby leaf",
    columnas: [
      ["Fecha", "fecha"],
      ["Corte", "corte"],
      ["Superficie (m2)", "superficie"],
      ["Peso fresco (g)", "peso_fresco"],
      ["Altura de corte (cm)", "altura_corte"],
      ["Largo de hoja (cm)", "largo_hoja"],
      ["Ancho de hoja (cm)", "ancho_hoja"],
      ["Color (1-5)", "color"],
      ["Textura (1-5)", "textura"],
      ["Uniformidad (1-5)", "uniformidad"],
      ["Descarte (g)", "descarte"],
      ["Observaciones", "observaciones"]
    ]
  },

  floracion: {
    nombre: "Floración",
    columnas: [
      ["Fecha", "fecha"],
      ["Qué se observó", "momento"],
      ["Plantas espigadas", "espigadas"],
      ["Altura del tallo floral (cm)", "altura_tallo"],
      ["Sanidad (1-5)", "sanidad"],
      ["Plantas seleccionadas", "seleccionadas"],
      ["Criterios de selección", "criterios"],
      ["Aislamiento", "aislamiento"],
      ["Observaciones", "observaciones"]
    ]
  },

  semilla: {
    nombre: "Semilla",
    columnas: [
      ["Fecha", "fecha"],
      ["Operación", "operacion"],
      ["Plantas cosechadas", "plantas_cosechadas"],
      ["Peso bruto (g)", "peso_bruto"],
      ["Peso limpio (g)", "peso_limpio"],
      ["Método de limpieza", "metodo_limpieza"],
      ["Secado", "secado"],
      ["Envase", "envase"],
      ["Rótulo", "rotulo"],
      ["Guardado en", "guardado_en"],
      ["Observaciones", "observaciones"]
    ]
  },

  sintesis: {
    nombre: "Síntesis",
    columnas: [
      ["Fecha", "fecha"],
      ["Adaptación (1-5)", "adaptacion"],
      ["Rendimiento (1-5)", "rendimiento"],
      ["Calidad (1-5)", "calidad"],
      ["Complementariedad (1-5)", "complementa"],
      ["¿La recomienda?", "recomienda"],
      ["Proporción propuesta (%)", "proporcion"],
      ["Por qué", "por_que"],
      ["Qué haría distinto", "aprendizaje"]
    ]
  }
};

// La ficha de identidad va aparte: no se acumula, se reescribe. Una fila por
// variedad, y punto.
var IDENTIDAD = {
  nombre: "Identidad",
  columnas: [
    ["Variedad", "variedad"],
    ["Estudiante", "estudiante"],
    ["Comisión", "comision"],
    ["Origen de la semilla", "origen"],
    ["Lote", "lote"],
    ["Fecha de siembra", "fecha_siembra"],
    ["Plantas iniciales", "plantas_inicial"],
    ["Sustrato", "sustrato"],
    ["Lugar", "lugar"],
    ["Condiciones de cultivo", "condiciones"],
    ["Cargado por", "_dispositivo"],
    ["Actualizado", "_recibido"]
  ]
};

function encabezadosDe(def) {
  return def.columnas.map(function (c) { return c[0]; });
}

function comoTexto(valor) {
  if (Array.isArray(valor)) return valor.join(", ");
  return valor === undefined || valor === null ? "" : valor;
}

// Arma la fila de un registro: id, variedad y estudiante adelante; las
// columnas declaradas en el medio; teléfono y fecha de llegada atrás.
function filaDe(def, registro) {
  var d = registro.datos || {};
  var fila = [registro.id, comoTexto(d.variedad), comoTexto(d.estudiante)];
  def.columnas.forEach(function (c) { fila.push(comoTexto(d[c[1]])); });
  fila.push(comoTexto(registro.dispositivo));
  fila.push(new Date());
  return fila;
}

function encabezadosCompletos(def) {
  return ["Id", "Variedad", "Estudiante"]
    .concat(encabezadosDe(def))
    .concat(["Cargado por", "Recibido"]);
}

// ==========================================================================
// ACCESOS
// ==========================================================================

function hojaAccesos(nombre, encabezados) {
  return hojaSuelta(libroAccesos(), nombre, encabezados);
}

// De la credencial sale siempre la misma huella, pero de la huella no se puede
// volver a la credencial. Así, ni leyendo la planilla de accesos se saca nada
// que sirva para entrar.
function huella(texto) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
                                      String(texto), Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    return ("0" + (b < 0 ? b + 256 : b).toString(16)).slice(-2);
  }).join("");
}

// Sin I, O, 0 ni 1: se confunden al dictarlos en el aula o al copiarlos del
// pizarrón.
function alAzar(largo) {
  var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var s = "";
  for (var i = 0; i < largo; i++) s += letras.charAt(Math.floor(Math.random() * letras.length));
  return s;
}

function esAdmin(clave) {
  var guardada = propiedad("CLAVE_ADMIN");
  return !!guardada && String(clave || "") === guardada;
}

// Se ejecuta A MANO desde el editor. Saca de una los seis códigos, uno por
// variedad, y los deja anotados en la planilla de accesos y en el registro de
// ejecución para copiarlos y repartirlos.
//
// No se expone como entrada del servicio: si cualquiera pudiera pedir
// invitaciones, no habría control de acceso.
function crearInvitaciones() {
  var hoja = hojaAccesos("Invitaciones", INVITACIONES_ENCABEZADOS);
  var salida = [];

  Object.keys(VARIEDADES).forEach(function (id) {
    var codigo = alAzar(4) + "-" + alAzar(4);
    hoja.appendRow([codigo, id, "", "Nueva", new Date(), "", ""]);
    salida.push(codigo + "   →   " + VARIEDADES[id]);
  });

  var texto = salida.join("\n");
  Logger.log("Códigos creados:\n" + texto);
  return texto;
}

// Para un código suelto: si alguien pierde el teléfono o se suma un estudiante.
function crearInvitacion() {
  var variedad = "brisa";             // ← editar antes de ejecutar
  var persona = "";                   // ← opcional

  if (!VARIEDADES[variedad]) throw new Error("Variedad desconocida: " + variedad);
  var codigo = alAzar(4) + "-" + alAzar(4);
  hojaAccesos("Invitaciones", INVITACIONES_ENCABEZADOS)
    .appendRow([codigo, variedad, persona, "Nueva", new Date(), "", ""]);
  Logger.log("Código para " + VARIEDADES[variedad] + ": " + codigo);
  return codigo;
}

// Canjea el código por una credencial. El código queda usado y no sirve más.
// De acá sale también la variedad: el estudiante no la elige, se la asigna el
// código. Así no hay dos personas cargando en la misma.
function canjearInvitacion(codigo, persona, dispositivo) {
  codigo = String(codigo || "").trim().toUpperCase();
  if (!codigo) return rechazo("Falta el código.");
  if (!dispositivo) return rechazo("Falta el identificador del teléfono.");

  // Sin el candado, dos personas canjeando el mismo código en el mismo momento
  // podrían quedar las dos adentro.
  var candado = LockService.getScriptLock();
  candado.waitLock(20000);
  try {
    var hoja = hojaAccesos("Invitaciones", INVITACIONES_ENCABEZADOS);
    if (hoja.getLastRow() < 2) return rechazo("Ese código no existe.");

    var filas = hoja.getRange(2, 1, hoja.getLastRow() - 1, INVITACIONES_ENCABEZADOS.length)
                    .getValues();

    for (var i = 0; i < filas.length; i++) {
      if (String(filas[i][0]).trim().toUpperCase() !== codigo) continue;
      if (String(filas[i][3]).toLowerCase() === "usado") {
        return rechazo("Ese código ya se usó en otro teléfono.");
      }

      var variedad = String(filas[i][1] || "").trim();
      if (!VARIEDADES[variedad]) return rechazo("Ese código no tiene variedad asignada. Avisale al docente.");

      var credencial = alAzar(8) + "-" + alAzar(8) + "-" + alAzar(8);
      var quien = persona || String(filas[i][2] || "");
      registrarDispositivo(variedad, dispositivo, quien, credencial);

      hoja.getRange(i + 2, 4, 1, 4).setValues([["Usado", filas[i][4], new Date(), dispositivo]]);
      return { ok: true, credencial: credencial, variedad: variedad,
               nombre: VARIEDADES[variedad], persona: quien };
    }
    return rechazo("Ese código no existe.");
  } finally {
    candado.releaseLock();
  }
}

function registrarDispositivo(variedad, dispositivo, persona, credencial) {
  hojaAccesos("Dispositivos", DISPOSITIVOS_ENCABEZADOS)
    .appendRow([dispositivo, variedad, persona, "SÍ", new Date(), new Date(), 0,
                huella(credencial)]);
}

// Comprueba que el teléfono esté registrado, activo y sea de esa variedad.
// Para dar de baja uno: poner NO en la columna "Activo" de su fila.
function permitido(variedad, credencial, dispositivo) {
  if (!credencial) return rechazo("Este teléfono todavía no tiene acceso.");

  var hoja = libroAccesos().getSheetByName("Dispositivos");
  if (!hoja || hoja.getLastRow() < 2) return rechazo("Este teléfono todavía no tiene acceso.");

  var buscada = huella(credencial);
  var filas = hoja.getRange(2, 1, hoja.getLastRow() - 1, DISPOSITIVOS_ENCABEZADOS.length)
                  .getValues();

  for (var i = 0; i < filas.length; i++) {
    if (String(filas[i][7]) !== buscada) continue;
    if (String(filas[i][1]).toLowerCase() !== String(variedad).toLowerCase()) {
      return rechazo("Esa credencial es de otra variedad.");
    }
    if (String(filas[i][3]).toUpperCase().indexOf("S") !== 0) {
      return rechazo("Este teléfono fue dado de baja. Pedí un código nuevo.");
    }
    return { ok: true, fila: i + 2, persona: String(filas[i][2] || "") };
  }
  return rechazo("Credencial desconocida. Pedí un código nuevo.");
}

// Deja constancia de que ese teléfono estuvo activo y cuánto cargó.
function marcarActividad(fila, cuantos) {
  try {
    var hoja = libroAccesos().getSheetByName("Dispositivos");
    hoja.getRange(fila, 6).setValue(new Date());
    if (cuantos) {
      var previos = Number(hoja.getRange(fila, 7).getValue()) || 0;
      hoja.getRange(fila, 7).setValue(previos + cuantos);
    }
  } catch (err) { /* que no se pierda un registro por no poder anotar la visita */ }
}

function rechazo(motivo) {
  return { ok: false, sin_permiso: true, error: motivo };
}

// ==========================================================================
// PREPARAR LA PLANILLA
//
// Se ejecuta A MANO desde el editor, una vez al desplegar. Deja las hojas
// creadas con sus encabezados. No hace falta correrla para que la app
// funcione —el servicio crea la hoja que necesita cuando llega el primer
// registro—, pero conviene: así la planilla ya se ve armada cuando el curso
// entra a mirarla, y los encabezados salen del mismo código que después
// escribe las filas, con lo cual no pueden quedar corridos.
//
// Es idempotente: correrla dos veces no rompe ni duplica nada.
// ==========================================================================

function prepararPlanillas() {
  var hechas = [];

  hojaAccesos("Invitaciones", INVITACIONES_ENCABEZADOS);
  hojaAccesos("Dispositivos", DISPOSITIVOS_ENCABEZADOS);
  limpiarHojaSobrante(libroAccesos());
  hechas.push("Accesos: Invitaciones y Dispositivos");

  var libro = planillaRegistros();

  var identidad = libro.getSheetByName(IDENTIDAD.nombre) || libro.insertSheet(IDENTIDAD.nombre);
  ponerEncabezados(identidad, encabezadosDe(IDENTIDAD));
  identidad.autoResizeColumns(1, IDENTIDAD.columnas.length);
  hechas.push("Registros: " + IDENTIDAD.nombre);

  Object.keys(HOJAS).forEach(function (tipo) {
    obtenerHoja(libro, HOJAS[tipo]);
    hechas.push("Registros: " + HOJAS[tipo].nombre);
  });

  limpiarHojaSobrante(libro);

  var resumen = hechas.join("\n");
  Logger.log(resumen);
  return resumen;
}

// La hoja vacía que Google crea sola con cada planilla nueva.
function limpiarHojaSobrante(libro) {
  ["Hoja 1", "Hoja1", "Sheet1"].forEach(function (nombre) {
    var sobrante = libro.getSheetByName(nombre);
    if (sobrante && libro.getSheets().length > 1 && sobrante.getLastRow() === 0) {
      libro.deleteSheet(sobrante);
    }
  });
}

// ==========================================================================
// ENTRADAS DEL SERVICIO
// ==========================================================================

// Todo va envuelto: si algo falla, Apps Script devuelve una página HTML de
// error que no dice nada. Así al menos vuelve el motivo en el JSON.
function doGet(e) {
  try {
    return atender((e && e.parameter) || {});
  } catch (err) {
    return respuesta({ ok: false, error: String(err), donde: "doGet" });
  }
}

function atender(p) {
  // Lo único abierto: canjear el código de invitación.
  if (p.canjear) {
    return respuesta(canjearInvitacion(p.canjear, p.persona || "", p.dispositivo || ""));
  }

  // Sin credencial solo se sabe que el servicio existe.
  return respuesta({ ok: true, servicio: "Semillas de Lechuga", hora: new Date().toISOString() });
}

function doPost(e) {
  try {
    var cuerpo = JSON.parse(e.postData.contents);
    var variedad = cuerpo.variedad || "";
    var registros = cuerpo.registros || [];

    // Nada se escribe sin credencial.
    var permiso = esAdmin(cuerpo.clave)
      ? { ok: true, fila: 0 }
      : permitido(variedad, cuerpo.credencial, cuerpo.dispositivo);
    if (!permiso.ok) return respuesta(permiso);

    var libro = planillaRegistros();
    var guardados = 0;

    var candado = LockService.getScriptLock();
    candado.waitLock(20000);
    try {
      // La ficha de identidad se reescribe; el resto se acumula.
      registros.forEach(function (r) {
        if (r.tipo !== "identidad") return;
        guardarIdentidad(libro, r, variedad);
        guardados++;
      });

      var porTipo = {};
      registros.forEach(function (r) {
        if (!HOJAS[r.tipo]) return;
        (porTipo[r.tipo] = porTipo[r.tipo] || []).push(r);
      });

      Object.keys(porTipo).forEach(function (tipo) {
        var def = HOJAS[tipo];
        var hoja = obtenerHoja(libro, def);
        var existentes = idsExistentes(hoja);
        var ancho = encabezadosCompletos(def).length;
        var nuevas = [];

        porTipo[tipo].forEach(function (r) {
          // La variedad la manda la credencial, no el teléfono: si vinieran
          // distintas, gana la de la credencial.
          r.datos = r.datos || {};
          r.datos.variedad = variedad;

          var fila = existentes[r.id];
          if (fila) {
            // Ya estaba: es una corrección del mismo registro, se reemplaza.
            hoja.getRange(fila, 1, 1, ancho).setValues([filaDe(def, r)]);
            guardados++;
            return;
          }
          nuevas.push(filaDe(def, r));
        });

        if (nuevas.length) {
          hoja.getRange(hoja.getLastRow() + 1, 1, nuevas.length, ancho).setValues(nuevas);
          guardados += nuevas.length;
        }
      });
    } finally {
      candado.releaseLock();
    }

    if (permiso.fila) marcarActividad(permiso.fila, guardados);
    return respuesta({ ok: true, recibidos: registros.length, guardados: guardados });
  } catch (err) {
    return respuesta({ ok: false, error: String(err) });
  }
}

// ==========================================================================
// FICHA DE IDENTIDAD (hoja Identidad)
//
// Una fila por variedad. Si la variedad ya tiene fila, se reemplaza; si no, se
// agrega. Así no se juntan seis versiones de la misma ficha.
// ==========================================================================

function guardarIdentidad(libro, registro, variedad) {
  var d = registro.datos || {};

  // Una ficha sin estudiante o sin fecha de siembra es casi seguro un error:
  // no se pisa lo que había con eso.
  if (!d.estudiante || !d.fecha_siembra) {
    throw new Error("Ficha incompleta: no se guarda para no pisar la anterior.");
  }

  var hoja = libro.getSheetByName(IDENTIDAD.nombre) || libro.insertSheet(IDENTIDAD.nombre);
  ponerEncabezados(hoja, encabezadosDe(IDENTIDAD));

  var fila = IDENTIDAD.columnas.map(function (c) {
    if (c[1] === "_dispositivo") return comoTexto(registro.dispositivo);
    if (c[1] === "_recibido") return new Date();
    if (c[1] === "variedad") return variedad;
    return comoTexto(d[c[1]]);
  });

  var ancho = IDENTIDAD.columnas.length;
  var donde = 0;
  if (hoja.getLastRow() > 1) {
    var actuales = hoja.getRange(2, 1, hoja.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < actuales.length; i++) {
      if (String(actuales[i][0]).toLowerCase() === String(variedad).toLowerCase()) {
        donde = i + 2;
        break;
      }
    }
  }
  if (!donde) donde = hoja.getLastRow() + 1;
  hoja.getRange(donde, 1, 1, ancho).setValues([fila]);
}

// ==========================================================================
// AUXILIARES
// ==========================================================================

function hojaSuelta(libro, nombre, encabezados) {
  var hoja = libro.getSheetByName(nombre);
  if (!hoja) {
    var primera = libro.getSheets()[0];
    hoja = (libro.getSheets().length === 1 && primera.getLastRow() === 0)
      ? primera.setName(nombre)
      : libro.insertSheet(nombre);
    ponerEncabezados(hoja, encabezados);
    hoja.autoResizeColumns(1, encabezados.length);
  }
  return hoja;
}

function obtenerHoja(libro, def) {
  var encabezados = encabezadosCompletos(def);
  var hoja = libro.getSheetByName(def.nombre);
  if (!hoja) {
    hoja = libro.insertSheet(def.nombre);
    ponerEncabezados(hoja, encabezados);
    hoja.autoResizeColumns(1, encabezados.length);
    return hoja;
  }
  // Si las columnas cambiaron y la hoja todavía no tiene datos, se rehace el
  // encabezado: si no, las filas nuevas entrarían corridas de lugar.
  if (hoja.getLastRow() <= 1) {
    var actuales = hoja.getLastColumn()
      ? hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].join("|") : "";
    if (actuales !== encabezados.join("|")) {
      hoja.clear();
      ponerEncabezados(hoja, encabezados);
    }
  }
  return hoja;
}

function ponerEncabezados(hoja, encabezados) {
  hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados])
      .setFontWeight("bold").setBackground("#2F6B2A").setFontColor("#FFFFFF");
  hoja.setFrozenRows(1);
}

// Devuelve { id: número de fila }. Sirve para dos cosas: descartar un reintento
// y encontrar la fila cuando el estudiante corrige un registro ya enviado.
// Solo se miran las últimas mil filas: alcanza, y no se hace más lento a
// medida que la planilla crece.
function idsExistentes(hoja) {
  var mapa = {};
  var ultima = hoja.getLastRow();
  if (ultima < 2) return mapa;
  var desde = Math.max(2, ultima - 1000);
  hoja.getRange(desde, 1, ultima - desde + 1, 1).getValues().forEach(function (f, i) {
    if (f[0]) mapa[f[0]] = desde + i;
  });
  return mapa;
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
