// ==========================================================================
// Semillas de Lechuga — armazón de la app
//
// Maneja la navegación entre secciones y el bloqueo del menú hasta que la
// ficha de identidad de la variedad esté completa.
// ==========================================================================

(function () {
  const { esc } = window.Util;

  const VERSION = "0.1.0 · fase 1";

  const vista = document.getElementById("vista");
  const titulo = document.getElementById("titulo-vista");
  const subtitulo = document.getElementById("subtitulo-vista");
  const botonVolver = document.getElementById("btn-volver");

  let ficha = null;
  let instalador = null;   // evento de instalación que ofrece Android

  // Las secciones que todavía no están programadas se muestran igual, con la
  // fase en la que llegan: así el estudiante sabe qué va a poder hacer y no
  // parece que la app estuviera rota.
  const SECCIONES = {
    registro: {
      icono: "📋",
      titulo: "Registrar",
      detalle: "Emergencia, almácigo, trasplante, baby leaf, floración, semilla",
      subtitulo: "Las siete etapas del seguimiento",
      listo: true,          // la atiende js/registro.js
    },
    wiki: {
      icono: "📖",
      titulo: "Wiki",
      detalle: "Las seis variedades y cómo se hace",
      subtitulo: "Variedades y método",
      listo: true,          // la atiende js/wiki.js
      // Única sección que no espera a la ficha: es material de lectura y no
      // necesita saber nada de la variedad.
      sinFicha: true,
    },
    enviar: {
      icono: "📤",
      titulo: "Enviar a la planilla",
      detalle: "Activar el teléfono y subir lo cargado",
      subtitulo: "Sincronización",
      listo: true,          // la atiende js/sincro.js
    },
    mix: {
      icono: "🥗",
      titulo: "Comparar el mix",
      detalle: "Las seis variedades una al lado de la otra",
      subtitulo: "Comparación entre variedades",
      fase: 3,
      queVa: `Cuando las seis fichas estén cargando datos en la misma planilla,
        acá se van a ver las seis variedades una al lado de la otra: días al
        primer corte, rendimiento en g/m², color, textura y espigado. Es la
        pantalla con la que se decide la composición final del mix.`,
    },
  };

  // ---------- Navegación ----------

  const rutaActual = () => (location.hash || "#/inicio").replace("#/", "");

  function ir(ruta) { location.hash = "#/" + ruta; }

  async function mostrar() {
    const ruta = rutaActual();
    const base = ruta.split("/")[0];      // "wiki/variedad/lilar" → "wiki"
    ficha = await window.SemDB.leerIdentidad();
    const habilitada = window.SemDB.identidadCompleta(ficha);

    botonVolver.hidden = ruta === "inicio";
    window.scrollTo(0, 0);

    // Nadie entra a registrar con la ficha incompleta, ni siquiera escribiendo
    // la dirección a mano: sin fecha de siembra ni número de plantas, la mitad
    // de los cálculos darían cualquier cosa. La wiki es la excepción.
    const libre = base === "inicio" || base === "ficha" || base === "enviar"
                  || (SECCIONES[base] || {}).sinFicha;
    if (!libre && !habilitada) { ir("ficha"); return; }

    if (base === "ficha") {
      encabezado("Mi variedad", "Ficha de identidad y trazabilidad");
      await window.Ficha.render(vista, () => ir("inicio"));
      return;
    }

    if (base === "wiki") {
      const cabecera = await window.Wiki.render(vista, ruta, ir);
      encabezado(cabecera.titulo, cabecera.subtitulo);
      return;
    }

    if (base === "registro") {
      const cabecera = await window.Registro.render(vista, ruta, ir);
      encabezado(cabecera.titulo, cabecera.subtitulo);
      return;
    }

    if (base === "enviar") {
      encabezado("Enviar a la planilla", "Sincronización");
      await window.Sincro.render(vista, ir);
      return;
    }

    if (SECCIONES[base]) {
      const s = SECCIONES[base];
      encabezado(s.titulo, s.subtitulo);
      enConstruccion(s);
      return;
    }

    encabezado("Semillas de Lechuga", "Seguimiento del mix baby leaf");
    await inicio(habilitada);
  }

  function encabezado(t, sub) {
    titulo.textContent = t;
    subtitulo.textContent = sub;
    document.title = t === "Semillas de Lechuga" ? "Semillas de Lechuga" : t + " · Semillas de Lechuga";
  }

  // ---------- Inicio ----------

  async function inicio(habilitada) {
    const variedad = ficha ? await window.Datos.variedad(ficha.variedad).catch(() => null) : null;
    const pendientes = await window.Sincro.cuantosPendientes().catch(() => 0);

    const menu = Object.entries(SECCIONES).map(([ruta, s]) => {
      const abierta = habilitada || s.sinFicha || ruta === "enviar";
      const detalle = ruta === "enviar" && pendientes
        ? pendientes + (pendientes === 1 ? " registro sin enviar" : " registros sin enviar")
        : s.detalle;
      return `
      <button class="menu__boton" data-ir="${ruta}" ${abierta ? "" : "disabled"}>
        <span class="menu__icono">${s.icono}</span>
        <span>
          <span class="menu__titulo">${esc(s.titulo)}</span>
          <span class="menu__detalle">${abierta ? esc(detalle) : "Completá primero tu ficha"}</span>
        </span>
      </button>`;
    }).join("");

    vista.innerHTML = `
      ${habilitada ? window.Ficha.resumen(ficha, variedad) : `
        <p class="aviso aviso--info">
          <strong>Empezá por tu ficha.</strong> Necesitamos saber qué variedad
          seguís, de dónde salió la semilla, cuándo se sembró y cuántas plantas
          hay. Sin eso no se puede calcular ni un porcentaje de emergencia.
          La <strong>Wiki</strong> se puede leer desde ahora.
        </p>`}

      <div class="menu">
        ${menu}
        <button class="menu__boton menu__boton--ficha" data-ir="ficha">
          <span class="menu__icono">🏷️</span>
          <span>
            <span class="menu__titulo">Mi variedad</span>
            <span class="menu__detalle">Ficha de identidad y trazabilidad</span>
          </span>
        </button>
      </div>

      ${instalador ? `<button class="boton boton--secundario boton--ancho separado"
                        id="btn-instalar">Instalar en el celular</button>` : ""}

      <p class="nota nota--pie">
        Esta aplicación funciona sin señal: todo lo que cargues queda guardado en
        el teléfono y se envía a la planilla del proyecto cuando haya conexión.
      </p>`;

    vista.querySelectorAll("[data-ir]").forEach((b) => { b.onclick = () => ir(b.dataset.ir); });

    const instalar = document.getElementById("btn-instalar");
    if (instalar) instalar.onclick = async () => {
      instalador.prompt();
      await instalador.userChoice;
      instalador = null;
      mostrar();
    };
  }

  // ---------- Secciones que todavía no están ----------

  function enConstruccion(s) {
    vista.innerHTML = `
      <div class="tarjeta">
        <h2>${s.icono} ${esc(s.titulo)}</h2>
        <p>${s.queVa}</p>
        <p class="aviso aviso--info al-final">
          Esta sección llega en la <strong>fase ${s.fase}</strong> del desarrollo.
        </p>
      </div>
      <button class="boton boton--ancho" data-ir="inicio">Volver al inicio</button>`;

    vista.querySelectorAll("[data-ir]").forEach((b) => { b.onclick = () => ir(b.dataset.ir); });
  }

  // ---------- Arranque ----------

  // La flecha sube un nivel, no salta al inicio: desde un registro vuelve a la
  // lista de esa etapa, y recién desde ahí al inicio.
  botonVolver.onclick = () => {
    const partes = rutaActual().split("/");
    if (partes.length > 1) { partes.pop(); ir(partes.join("/")); return; }
    ir("inicio");
  };
  window.addEventListener("hashchange", mostrar);

  window.addEventListener("beforeinstallprompt", (evento) => {
    evento.preventDefault();
    instalador = evento;
    if (rutaActual() === "inicio") mostrar();
  });

  document.getElementById("pie-version").textContent = "versión " + VERSION;

  window.SemDB.abrir()
    .then(mostrar)
    .catch((err) => {
      vista.innerHTML = `<p class="aviso aviso--error">No se pudo abrir el almacenamiento
        del teléfono, así que la app no puede guardar nada. Suele pasar en modo
        incógnito o con el almacenamiento del navegador bloqueado.<br><br>
        Detalle: ${esc(err.message || err)}</p>`;
    });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
  }
})();
