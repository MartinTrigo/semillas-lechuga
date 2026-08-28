// ==========================================================================
// Semillas de Lechuga — wiki
//
// Dos cosas distintas conviven acá:
//
//   Las seis fichas de variedad. Lo que se sabe de antemano, sacado del
//   obtentor o del semillero. Cada ficha termina con lo que NO se sabe: esas
//   preguntas son justamente las que el seguimiento tiene que contestar.
//
//   El material de método. Por qué la lechuga se puede multiplicar, cuánta
//   distancia hace falta, cómo se hace la selección masal, qué significa cada
//   punto de las escalas 1 a 5.
//
// Se lee sin conexión y sin haber cargado nada: es la única sección que no
// espera a la ficha de identidad.
// ==========================================================================

window.Wiki = (function () {
  const { esc } = window.Util;

  let destino = null;
  let ir = null;

  async function render(contenedor, ruta, navegar) {
    destino = contenedor;
    ir = navegar;

    const partes = ruta.split("/");        // wiki / variedad|tema / id

    if (partes[1] === "variedad" && partes[2]) {
      const v = await window.Datos.variedad(partes[2]);
      if (v) { ficha(v); return { titulo: v.nombre, subtitulo: v.tipo }; }
    }

    if (partes[1] === "tema" && partes[2]) {
      const g = await window.Datos.guia();
      const t = (g.temas || []).find((x) => x.id === partes[2]);
      if (t) { tema(t); return { titulo: t.titulo, subtitulo: "Material de consulta" }; }
    }

    await indice();
    return { titulo: "Wiki", subtitulo: "Variedades y método" };
  }

  // ---------- Índice ----------

  async function indice() {
    const variedades = await window.Datos.variedades();
    const guia = await window.Datos.guia();

    const suma = variedades.reduce((s, v) => s + (Number(v.proporcion) || 0), 0);

    destino.innerHTML = `
      <details class="grupo" open>
        <summary class="grupo__cab">
          <span class="grupo__icono">🥬</span>
          <span class="grupo__texto">
            <span class="grupo__nombre">Las seis variedades</span>
            <span class="grupo__cuenta">${variedades.length} fichas · el mix suma ${suma} %</span>
          </span>
          <span class="grupo__flecha"></span>
        </summary>
        <div class="grupo__cuerpo">
          <ul class="indice">
            ${variedades.map((v) => `
              <li><button class="indice__item" data-ir="wiki/variedad/${esc(v.id)}">
                <span class="indice__nombre">${esc(v.emoji + " " + v.nombre)}</span>
                <span class="indice__cientifico">${esc(v.tipo)} · ${esc(v.rol)} · ${v.proporcion} % del mix</span>
              </button></li>`).join("")}
          </ul>
        </div>
      </details>

      <details class="grupo">
        <summary class="grupo__cab">
          <span class="grupo__icono">📖</span>
          <span class="grupo__texto">
            <span class="grupo__nombre">Cómo se hace</span>
            <span class="grupo__cuenta">${(guia.temas || []).length} temas de método</span>
          </span>
          <span class="grupo__flecha"></span>
        </summary>
        <div class="grupo__cuerpo">
          <ul class="indice">
            ${(guia.temas || []).map((t) => `
              <li><button class="indice__item" data-ir="wiki/tema/${esc(t.id)}">
                <span class="indice__nombre">${esc(t.emoji + " " + t.titulo)}</span>
                <span class="indice__cientifico">${esc(t.resumen)}</span>
              </button></li>`).join("")}
          </ul>
        </div>
      </details>

      <div class="tarjeta tarjeta--fuente separado">
        <h2>Referencias técnicas</h2>
        <ul class="lista">${(guia.referencias || []).map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      </div>`;

    enlazar();
  }

  // ---------- Ficha de una variedad ----------

  function ficha(v) {
    const datos = Object.entries(v.datos || {})
      .map(([k, val]) => `<div><dt>${esc(k)}:</dt><dd>${esc(val)}</dd></div>`).join("");

    // La foto viene del catálogo del semillero y está ahí para reconocer la
    // variedad antes de tener plantas propias. Se reemplaza por la foto del
    // curso apenas haya (ver docs/img/variedades/LEEME.md). Las proporciones
    // se reservan con aspect-ratio para que el texto no salte al cargar.
    const foto = v.foto ? `
      <figure class="foto">
        <img src="img/variedades/${esc(v.foto.archivo)}" alt="Lechuga ${esc(v.nombre)}" loading="lazy">
        <figcaption>${esc(v.foto.pie)}
          <span class="foto__credito">Foto: ${esc(v.foto.credito)}</span></figcaption>
      </figure>` : "";

    destino.innerHTML = `
      <p class="cientifico"><em>Lactuca sativa</em> L. · ${esc(v.tipo)}
        <span class="sello-comarca">${v.proporcion} % del mix</span></p>

      ${v.nombre_largo ? `<p class="nota">Nombre completo: ${esc(v.nombre_largo)}</p>` : ""}

      ${foto}

      <p class="resumen-ficha">${esc(v.resumen)}</p>

      <div class="etiquetas">
        <span class="etiqueta">${esc(v.color)}</span>
        <span class="etiqueta">${esc(v.rol)}</span>
        <span class="etiqueta">${esc(v.proveedor)}</span>
      </div>

      ${datos ? `<div class="tarjeta separado"><h2>Datos de la variedad</h2>
        <dl class="datos-rapidos">${datos}</dl>
        <p class="nota">Obtentor: ${esc(v.obtentor)}</p></div>` : ""}

      <div class="tarjeta">
        <h2>Fortalezas</h2>
        <ul class="lista">${(v.fortalezas || []).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </div>

      <div class="tarjeta">
        <h2>🍃 En el mix baby leaf</h2>
        <p>${esc(v.babyleaf)}</p>
      </div>

      ${(v.cuidados || []).length ? `<div class="tarjeta tarjeta--cuidado">
        <h2>Cuidados</h2>
        <ul class="lista">${v.cuidados.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
      </div>` : ""}

      <div class="tarjeta tarjeta--cuidado">
        <h2>¿Se puede multiplicar?</h2>
        <p>${esc(v.multiplicable)}</p>
        <p class="nota">Antes de multiplicar cualquier semilla comprada hay que verificar que sea de polinización abierta y que no tenga restricción de propiedad vegetal. La semilla de un híbrido F1 no conserva el tipo.</p>
      </div>

      <div class="tarjeta tarjeta--pendiente">
        <h2>Lo que tenemos que averiguar nosotros</h2>
        <p class="nota">Esto no está publicado en ningún lado para nuestra zona. Es lo que tu seguimiento va a contestar.</p>
        <ul class="lista">${(v.a_confirmar || []).map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
      </div>

      <div class="tarjeta tarjeta--fuente">
        <h2>De dónde salieron estos datos</h2>
        <ul class="lista">${(v.fuentes || []).map((f) =>
          `<li><a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.titulo)}</a></li>`).join("")}</ul>
      </div>

      <button class="boton boton--secundario boton--ancho" data-ir="wiki">Volver a la wiki</button>`;

    enlazar();
  }

  // ---------- Un tema de método ----------

  function tema(t) {
    const cuerpo = (t.bloques || []).map((b) => {
      if (b.tipo === "parrafo") return `<p>${esc(b.texto)}</p>`;
      if (b.tipo === "aviso") return `<p class="aviso aviso--info">${esc(b.texto)}</p>`;
      if (b.tipo === "lista") return `<h2>${esc(b.titulo)}</h2>
        <ul class="lista">${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
      if (b.tipo === "pasos") return `<h2>${esc(b.titulo)}</h2>
        <ol class="pasos">${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>`;
      if (b.tipo === "escala") return `<h2>${esc(b.titulo)}</h2>
        <ul class="lista lista--escala">${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
      return "";
    }).join("");

    destino.innerHTML = `
      <p class="resumen-ficha">${esc(t.resumen)}</p>
      <div class="tarjeta separado">${cuerpo}</div>
      <button class="boton boton--secundario boton--ancho" data-ir="wiki">Volver a la wiki</button>`;

    enlazar();
  }

  function enlazar() {
    destino.querySelectorAll("[data-ir]").forEach((b) => { b.onclick = () => ir(b.dataset.ir); });
  }

  return { render };
})();
