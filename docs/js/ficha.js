// ==========================================================================
// Semillas de Lechuga — ficha de identidad de la variedad
//
// Es lo primero que hace el estudiante y lo único habilitado hasta que esté
// completa. No es burocracia: sin la fecha de siembra y el número inicial de
// plantas, la app no puede calcular ningún "días desde la siembra" ni ningún
// porcentaje de emergencia, que es la mitad del seguimiento.
//
// La variedad no se elige libremente si el teléfono ya canjeó un código: viene
// atada a la credencial. Mientras el servicio no esté publicado, se elige de
// la lista para poder empezar a trabajar igual.
// ==========================================================================

window.Ficha = (function () {
  const { esc, brindis } = window.Util;
  const CAMPOS = window.Etapas.IDENTIDAD;

  let borrador = null;
  let errores = {};
  let destino = null;
  let alGuardar = null;
  let lista = [];

  async function render(contenedor, cuandoGuarde) {
    destino = contenedor;
    alGuardar = cuandoGuarde;
    errores = {};

    lista = await window.Datos.variedades();
    const guardada = await window.SemDB.leerIdentidad();
    borrador = guardada ? JSON.parse(JSON.stringify(guardada)) : {};

    // Si el teléfono canjeó un código, la variedad la manda el servicio.
    const asignada = window.Acceso.variedad();
    if (asignada) borrador.variedad = asignada;

    pintar();
  }

  function pintar() {
    const asignada = !!window.Acceso.variedad();
    const v = lista.find((x) => x.id === borrador.variedad);

    destino.innerHTML = `
      <div class="tarjeta">
        <h2>Tu variedad</h2>
        ${asignada
          ? `<p class="nota">Viene con tu código de acceso. Si está mal, avisale al docente.</p>
             <p class="variedad-fija">${v ? esc(v.emoji + " " + v.nombre) : esc(borrador.variedad)}</p>`
          : `<div class="campo">
              <label for="campo-variedad">Variedad que vas a seguir</label>
              <span class="ayuda">Mientras no tengas código de acceso, elegila de la lista.</span>
              <select id="campo-variedad" class="dato${errores.variedad ? " mal" : ""}">
                <option value="">Elegir…</option>
                ${lista.map((x) => `<option value="${esc(x.id)}"${x.id === borrador.variedad ? " selected" : ""}>${esc(x.emoji + "  " + x.nombre + " — " + x.tipo)}</option>`).join("")}
              </select>
              ${errores.variedad ? `<span class="campo__error">${esc(errores.variedad)}</span>` : ""}
            </div>`}
        ${v ? `<p class="nota">${esc(v.tipo)} · ${esc(v.rol)} · ${v.proporcion} % del mix propuesto</p>` : ""}
      </div>

      <div class="tarjeta">
        <h2>Trazabilidad</h2>
        <p class="nota">De acá sale el rótulo del frasco. Dentro de tres años, esto es lo único que va a explicar de dónde salió esa semilla.</p>
        <div class="separado">${window.Campos.pintar(CAMPOS, borrador, errores)}</div>
      </div>

      <button class="boton boton--ancho" id="btn-guardar">Guardar la ficha</button>
      <p class="nota nota--pie">Se puede corregir cuando quieras. Cada vez que la guardes, reemplaza a la anterior en la planilla: no se acumulan fichas repetidas.</p>`;

    document.getElementById("btn-guardar").onclick = guardar;
  }

  async function guardar() {
    const leido = window.Campos.leer(CAMPOS, destino);
    errores = leido.errores;

    const sel = document.getElementById("campo-variedad");
    const variedad = window.Acceso.variedad() || (sel ? sel.value : "");
    if (!variedad) errores.variedad = "Elegí la variedad que vas a seguir.";

    if (Object.keys(errores).length) {
      borrador = Object.assign({}, leido.valores, { variedad: variedad });
      pintar();
      const primero = destino.querySelector(".mal");
      if (primero) primero.scrollIntoView({ block: "center" });
      brindis("Faltan datos o hay alguno mal cargado.");
      return;
    }

    const ficha = Object.assign({}, leido.valores, { variedad: variedad });
    await window.SemDB.guardarIdentidad(ficha);
    await window.SemDB.encolarUnico("identidad", ficha);
    brindis("Ficha guardada.");
    if (alGuardar) alGuardar();
  }

  // Un resumen corto para la pantalla de inicio.
  function resumen(ficha, variedad) {
    if (!ficha) return "";
    const dias = window.Etapas.dias(ficha.fecha_siembra, window.Util.hoy());
    return `
      <div class="resumen">
        <h2>${variedad ? esc(variedad.emoji + " " + variedad.nombre) : esc(ficha.variedad)}</h2>
        <p class="nota">${variedad ? esc(variedad.tipo) : ""}${ficha.estudiante ? " · " + esc(ficha.estudiante) : ""}</p>
        <dl>
          <div><dt>Sembrada:</dt><dd>${esc(window.Util.fecha(ficha.fecha_siembra))}</dd></div>
          ${dias !== null ? `<div><dt>Días:</dt><dd>${dias}</dd></div>` : ""}
          <div><dt>Plantas:</dt><dd>${esc(ficha.plantas_inicial)}</dd></div>
        </dl>
      </div>`;
  }

  return { render, resumen };
})();
