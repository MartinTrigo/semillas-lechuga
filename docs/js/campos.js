// ==========================================================================
// Semillas de Lechuga — formularios armados a partir de la lista de campos
//
// Una sola función dibuja todos los formularios de la app y una sola los lee.
// La ficha de identidad y las siete etapas usan las dos mismas: por eso
// agregar una variable al seguimiento es agregar un renglón en etapas.js y
// nada más.
// ==========================================================================

window.Campos = (function () {
  const { esc, aNumero, hoy } = window.Util;

  // Qué significa cada punto de la escala. El detalle largo está en la wiki;
  // acá va la palabra que alcanza para elegir sin salir de la pantalla.
  //
  // No es la misma escala para todo: un 1 en uniformidad no es "muy bajo",
  // es "muy dispareja". Poner la palabra correcta debajo del número es lo que
  // hace que seis personas puntúen parecido, que es de lo que depende que los
  // datos se puedan comparar al final.
  // Las palabras son cortas porque entran en un botón de 60 px de ancho: si
  // se parten en tres líneas, la fila de botones se vuelve una pared. El
  // significado completo de cada punto está en la wiki, en "Las escalas 1 a 5".
  const ESCALAS = {
    general:     ["", "Muy bajo", "Bajo", "Medio", "Bueno", "Muy alto"],
    uniformidad: ["", "Muy dispar", "Dispar", "Media", "Pareja", "Muy pareja"],
    sanidad:     ["", "Muy mala", "Mala", "Leve", "Casi sana", "Sana"],
    calidad:     ["", "Fuera de tipo", "Apagado", "Aceptable", "Bueno", "Excelente"],
  };

  // Se elige por el nombre del campo: así al agregar una variable nueva a
  // etapas.js la escala correcta sale sola, sin declarar nada.
  function escalaDe(clave) {
    if (clave === "uniformidad") return ESCALAS.uniformidad;
    if (clave === "sanidad") return ESCALAS.sanidad;
    if (["color", "textura", "calidad"].indexOf(clave) >= 0) return ESCALAS.calidad;
    return ESCALAS.general;
  }

  // ---------- Dibujar ----------

  function pintar(campos, valores, errores) {
    valores = valores || {};
    errores = errores || {};
    return campos.map((c) => uno(c, valores[c.clave], errores[c.clave])).join("");
  }

  function uno(c, valor, error) {
    const id = "campo-" + c.clave;
    const mal = error ? " mal" : "";
    const ayuda = c.ayuda ? `<span class="ayuda">${esc(c.ayuda)}</span>` : "";
    const unidad = c.unidad ? ` <span class="unidad">(${esc(c.unidad)})</span>` : "";
    const aviso = error ? `<span class="campo__error">${esc(error)}</span>` : "";
    const v = valor === undefined || valor === null ? "" : String(valor);

    let control;

    switch (c.tipo) {
      case "fecha":
        control = `<input type="date" id="${id}" class="dato${mal}"
                     data-tipo="fecha" value="${esc(v || (c.hoy ? hoy() : ""))}">`;
        break;

      case "escala":
        control = escala(id, v, mal, escalaDe(c.clave));
        break;

      case "opcion":
        control = `<select id="${id}" class="dato${mal}" data-tipo="texto">
            <option value="">Elegir…</option>
            ${c.opciones.map((o) =>
              `<option value="${esc(o)}"${o === v ? " selected" : ""}>${esc(o)}</option>`).join("")}
          </select>`;
        break;

      case "siNo":
        control = `<select id="${id}" class="dato${mal}" data-tipo="texto">
            <option value="">Elegir…</option>
            <option value="Sí"${v === "Sí" ? " selected" : ""}>Sí</option>
            <option value="No"${v === "No" ? " selected" : ""}>No</option>
          </select>`;
        break;

      case "largo":
        control = `<textarea id="${id}" class="dato${mal}" data-tipo="texto" rows="3">${esc(v)}</textarea>`;
        break;

      // Los números van como texto a propósito: ver el comentario de aNumero
      // en util.js. inputmode le pide al celular el teclado numérico igual.
      case "numero":
      case "entero":
        control = `<input type="text" id="${id}" class="dato${mal}" data-tipo="${c.tipo}"
                     inputmode="decimal" autocomplete="off" value="${esc(v)}">`;
        break;

      default:
        control = `<input type="text" id="${id}" class="dato${mal}" data-tipo="texto"
                     autocomplete="off" value="${esc(v)}">`;
    }

    return `<div class="campo">
        <label for="${id}">${esc(c.etiqueta)}${unidad}${c.obligatorio ? ' <span class="obliga">·</span>' : ""}</label>
        ${ayuda}${control}${aviso}
      </div>`;
  }

  // Cinco botones grandes en fila. Con guantes y al sol, un desplegable de
  // cinco opciones se erra; un botón de 56 px no.
  function escala(id, valor, mal, palabras) {
    const botones = [1, 2, 3, 4, 5].map((n) => `
      <label class="escala__punto${String(n) === String(valor) ? " elegido" : ""}">
        <input type="radio" name="${id}" value="${n}"${String(n) === String(valor) ? " checked" : ""}>
        <span class="escala__n">${n}</span>
        <span class="escala__que">${palabras[n]}</span>
      </label>`).join("");
    return `<div class="escala${mal}" id="${id}" data-tipo="escala">${botones}</div>`;
  }

  // ---------- Leer ----------
  //
  // Devuelve { valores, errores }. Nunca tira: si algo está mal, vuelve en
  // errores con el texto que se le muestra al estudiante.

  function leer(campos, raiz) {
    const valores = {};
    const errores = {};

    campos.forEach((c) => {
      const id = "campo-" + c.clave;
      let v = "";

      if (c.tipo === "escala") {
        const marcado = raiz.querySelector(`input[name="${id}"]:checked`);
        v = marcado ? marcado.value : "";
      } else {
        const control = raiz.querySelector("#" + CSS.escape(id));
        v = control ? String(control.value || "").trim() : "";
      }

      if (!v) {
        if (c.obligatorio) errores[c.clave] = "Falta completar este dato.";
        valores[c.clave] = "";
        return;
      }

      if (c.tipo === "numero" || c.tipo === "entero") {
        const n = aNumero(v);
        if (!Number.isFinite(n)) {
          errores[c.clave] = "Poné un número. Se puede con coma: 12,5";
          valores[c.clave] = v;
          return;
        }
        if (n < 0) {
          errores[c.clave] = "No puede ser negativo.";
          valores[c.clave] = v;
          return;
        }
        if (c.tipo === "entero" && Math.round(n) !== n) {
          errores[c.clave] = "Tiene que ser un número entero: no hay media planta.";
          valores[c.clave] = v;
          return;
        }
        valores[c.clave] = n;
        return;
      }

      valores[c.clave] = v;
    });

    return { valores, errores };
  }

  // El botón elegido de la escala se pinta al tocarlo. Va como un solo oyente
  // en el documento y no uno por formulario: los formularios se redibujan
  // enteros todo el tiempo, y así no hay que acordarse de reconectarlo nunca.
  document.addEventListener("change", (evento) => {
    const input = evento.target;
    if (!input || !input.matches || !input.matches(".escala__punto input")) return;
    const caja = input.closest(".escala");
    if (!caja) return;
    caja.querySelectorAll(".escala__punto").forEach((p) => p.classList.remove("elegido"));
    input.closest(".escala__punto").classList.add("elegido");
  });

  // Cuenta cuántos datos tiene cargados un registro, sin contar la fecha.
  // Sirve para que la lista muestre "8 datos" y se note el que quedó a medias.
  function cuantos(campos, datos) {
    return campos.filter((c) => c.clave !== "fecha")
      .filter((c) => { const v = (datos || {})[c.clave]; return v !== "" && v !== undefined && v !== null; })
      .length;
  }

  return { pintar, leer, cuantos, ESCALAS, escalaDe };
})();
