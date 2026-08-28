// ==========================================================================
// Semillas de Lechuga — envío a la planilla
//
// La app funciona entera sin esto: se carga todo en el teléfono y se sincroniza
// cuando hay señal. Acá se hacen las dos cosas que necesitan conexión:
//
//   1. Canjear el código de acceso que da el docente. Se hace una sola vez por
//      teléfono y de ahí sale la credencial y la variedad asignada.
//   2. Mandar la cola de registros pendientes.
//
// Cada registro viaja con SU id. Si el envío se corta por la mitad y se
// reintenta, el servicio reconoce los ids que ya tiene y no los duplica: en la
// planilla nunca aparece la misma medición dos veces.
// ==========================================================================

window.Sincro = (function () {
  const { esc, brindis } = window.Util;

  // ---------- Dirección del servicio ----------
  //
  // Se completa después de publicar el Apps Script (ver INSTALACION.md, paso 4).
  // Mientras esté vacía, la app avisa que todavía no hay a dónde enviar y sigue
  // guardando todo en el teléfono sin perder nada.
  const SERVICIO = "";

  const hayServicio = () => !!SERVICIO;

  let destino = null;
  let ir = null;
  let trabajando = false;

  async function render(contenedor, navegar) {
    destino = contenedor;
    ir = navegar;
    await pintar();
  }

  async function pintar(mensaje) {
    const cola = await window.SemDB.pendientes();
    const tiene = window.Acceso.tieneAcceso();

    destino.innerHTML = `
      ${mensaje || ""}

      <div class="resumen">
        <h2>${cola.length === 0 ? "Todo enviado" : cola.length + (cola.length === 1 ? " registro sin enviar" : " registros sin enviar")}</h2>
        <p class="nota">${cola.length === 0
          ? "No queda nada pendiente en este teléfono."
          : "Están guardados acá. No se pierden aunque cierres la app."}</p>
      </div>

      ${!hayServicio() ? `
        <p class="aviso aviso--info">
          <strong>El servicio todavía no está publicado.</strong> Podés seguir
          cargando todo: queda guardado en el teléfono y se envía apenas esté.
        </p>` : !tiene ? `
        <div class="tarjeta">
          <h2>Activar este teléfono</h2>
          <p>Pedile el código al docente. Se usa una sola vez y ya viene con tu
             variedad asignada.</p>
          <div class="campo separado">
            <label for="campo-codigo">Código de acceso</label>
            <span class="ayuda">Ocho letras y números, con un guión en el medio.</span>
            <input type="text" id="campo-codigo" autocomplete="off"
                   autocapitalize="characters" spellcheck="false" placeholder="ABCD-2345">
          </div>
          <button class="boton boton--ancho" id="btn-canjear">Activar</button>
        </div>` : `
        <button class="boton boton--ancho" id="btn-enviar"${cola.length ? "" : " disabled"}>
          ${cola.length ? "Enviar a la planilla" : "No hay nada para enviar"}
        </button>`}

      ${tiene ? `<p class="nota nota--pie">Este teléfono está activado para la variedad
         <strong>${esc(window.Acceso.variedad() || "sin asignar")}</strong>.</p>` : ""}`;

    const canjear = document.getElementById("btn-canjear");
    if (canjear) canjear.onclick = activar;

    const enviar = document.getElementById("btn-enviar");
    if (enviar) enviar.onclick = subir;
  }

  // ---------- Canje del código ----------

  async function activar() {
    if (trabajando) return;
    const codigo = (document.getElementById("campo-codigo").value || "").trim().toUpperCase();
    if (!codigo) { brindis("Escribí el código."); return; }

    trabajando = true;
    brindis("Activando…");
    try {
      const url = SERVICIO + "?canjear=" + encodeURIComponent(codigo)
                + "&dispositivo=" + encodeURIComponent(window.Acceso.dispositivo());
      const respuesta = await fetch(url, { redirect: "follow" });
      const r = await respuesta.json();

      if (!r.ok) { await pintar(aviso("error", r.error || "No se pudo activar.")); return; }

      window.Acceso.guardarAcceso(r.credencial, r.variedad);
      await pintar(aviso("ok", "Teléfono activado. Tu variedad es " + (r.variedad || "") + "."));
      brindis("Listo.");
    } catch (err) {
      await pintar(aviso("error", "No se pudo conectar. Probá con señal. Detalle: " + (err.message || err)));
    } finally {
      trabajando = false;
    }
  }

  // ---------- Envío de la cola ----------

  async function subir() {
    if (trabajando) return;
    const cola = await window.SemDB.pendientes();
    if (!cola.length) return;

    trabajando = true;
    brindis("Enviando…");
    try {
      const cuerpo = Object.assign(window.Acceso.identificacion(), { registros: cola });

      // El tipo text/plain evita el pedido previo de CORS, que Apps Script no
      // contesta. El contenido sigue siendo JSON y del otro lado se lee igual.
      const respuesta = await fetch(SERVICIO, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(cuerpo),
      });
      const r = await respuesta.json();

      if (!r.ok) {
        if (r.sin_permiso) window.Acceso.borrarCredencial();
        await pintar(aviso("error", r.error || "El servicio rechazó el envío."));
        return;
      }

      // Recién cuando el servicio confirma se vacía la cola. Si algo falla en
      // el medio, los registros siguen acá y se reintentan.
      const ids = cola.map((s) => s.id);
      for (const id of ids) await window.SemDB.sacarDeLaCola(id);
      await window.SemDB.marcarEnviados(ids);

      await pintar(aviso("ok", "Se enviaron " + r.guardados + " registros a la planilla."));
      brindis("Enviado.");
    } catch (err) {
      await pintar(aviso("error", "No se pudo conectar. Lo cargado no se perdió: sigue acá. Detalle: " + (err.message || err)));
    } finally {
      trabajando = false;
    }
  }

  const aviso = (clase, texto) => `<p class="aviso aviso--${clase}">${esc(texto)}</p>`;

  // Cuántos registros esperan, para el aviso de la pantalla de inicio.
  const cuantosPendientes = () => window.SemDB.pendientes().then((c) => c.length);

  return { render, hayServicio, cuantosPendientes };
})();
