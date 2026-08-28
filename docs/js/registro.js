// ==========================================================================
// Semillas de Lechuga — pantallas de registro
//
// Tres pantallas encadenadas:
//   #/registro                    las siete etapas, con cuántos registros lleva cada una
//   #/registro/<etapa>            los registros de esa etapa
//   #/registro/<etapa>/nuevo      el formulario
//   #/registro/<etapa>/<id>       el mismo formulario, corrigiendo uno ya cargado
//
// Un registro cargado se puede corregir y se puede borrar mientras no se haya
// enviado. Una vez que subió a la planilla se puede seguir corrigiendo —se
// reemplaza la fila, porque viaja con el mismo id— pero ya no se borra desde
// el teléfono: eso se hace en la planilla, con el docente mirando.
// ==========================================================================

window.Registro = (function () {
  const { esc, brindis, fecha } = window.Util;
  const { ETAPAS, porId, derivados, dias } = window.Etapas;

  let destino = null;
  let ir = null;
  let ficha = null;
  let errores = {};
  let borrador = {};

  async function render(contenedor, ruta, navegar) {
    destino = contenedor;
    ir = navegar;
    ficha = await window.SemDB.leerIdentidad();

    const partes = ruta.split("/");        // registro / etapa / id
    const etapa = partes[1] ? porId(partes[1]) : null;

    if (!etapa) { await menu(); return { titulo: "Registros", subtitulo: "Las siete etapas del seguimiento" }; }

    if (partes[2]) {
      await formulario(etapa, partes[2] === "nuevo" ? null : partes[2]);
      return { titulo: etapa.nombre, subtitulo: partes[2] === "nuevo" ? "Registro nuevo" : "Corrigiendo un registro" };
    }

    await listaDeEtapa(etapa);
    return { titulo: etapa.nombre, subtitulo: etapa.subtitulo };
  }

  // ---------- Las siete etapas ----------

  async function menu() {
    const todos = await window.SemDB.registros();
    const cuenta = {};
    todos.forEach((r) => { cuenta[r.etapa] = (cuenta[r.etapa] || 0) + 1; });

    const botones = ETAPAS.map((e) => {
      const n = cuenta[e.id] || 0;
      return `
        <button class="menu__boton" data-ir="registro/${e.id}">
          <span class="menu__icono">${e.emoji}</span>
          <span>
            <span class="menu__titulo">${esc(e.nombre)}</span>
            <span class="menu__detalle">${n === 0 ? "Sin registros todavía" : n + (n === 1 ? " registro" : " registros")}</span>
          </span>
        </button>`;
    }).join("");

    destino.innerHTML = `
      <p class="nota">Medí siempre igual y anotá el mismo día. Un dato cargado tres días después, de memoria, ensucia la comparación de las seis variedades.</p>
      <div class="menu separado">${botones}</div>`;

    enlazar();
  }

  // ---------- Los registros de una etapa ----------

  async function listaDeEtapa(etapa) {
    const filas = await window.SemDB.registrosDe(etapa.id);

    const items = filas.map((r, i) => {
      const previos = filas.slice(0, i).map((x) => x.datos);
      const calc = derivados(etapa.id, r.datos, ficha, previos);
      const dds = dias((ficha || {}).fecha_siembra, r.datos.fecha);

      return `
        <li class="renglon">
          <span class="renglon__cab">
            <span class="renglon__fecha">${esc(fecha(r.datos.fecha))}${dds !== null ? ` · día ${dds}` : ""}</span>
            ${r.enviado ? '<span class="pastilla pastilla--ok">en la planilla</span>'
                        : '<span class="pastilla">sin enviar</span>'}
          </span>
          ${titulito(etapa, r.datos)}
          <span class="renglon__detalle">${esc(destacados(etapa, r.datos))}</span>
          ${calc.length ? `<span class="calculado">${calc.map((c) =>
              `<span><i>${esc(c.etiqueta)}:</i> ${esc(c.valor)}</span>`).join("")}</span>` : ""}
          <span class="renglon__acciones">
            <button class="boton--peligro boton--editar" data-ir="registro/${etapa.id}/${r.id}">Ver o corregir</button>
            ${r.enviado ? "" : `<button class="boton--peligro" data-borrar="${r.id}">Borrar</button>`}
          </span>
        </li>`;
    }).join("");

    destino.innerHTML = `
      <div class="tarjeta">
        <h2>${etapa.emoji} ${esc(etapa.nombre)}</h2>
        <p>${etapa.queEs}</p>
        <p class="nota"><strong>Cuándo:</strong> ${esc(etapa.cuando)}</p>
      </div>

      <button class="boton boton--ancho" data-ir="registro/${etapa.id}/nuevo">Cargar un registro</button>

      ${filas.length
        ? `<ul class="renglones separado">${items}</ul>`
        : `<p class="vacio">Todavía no cargaste ningún registro de esta etapa.</p>`}`;

    enlazar();
    destino.querySelectorAll("[data-borrar]").forEach((b) => {
      b.onclick = async () => {
        if (!confirm("¿Borrar este registro? No se puede deshacer.")) return;
        await window.SemDB.borrarRegistro(b.dataset.borrar);
        brindis("Registro borrado.");
        listaDeEtapa(etapa);
      };
    });
  }

  // La primera línea de cada registro: lo que lo distingue de los demás de la
  // misma etapa. Cambia según la etapa porque no todas tienen lo mismo.
  function titulito(etapa, d) {
    const t = d.corte || d.momento || d.operacion;
    return t ? `<span class="renglon__producto">${esc(t)}</span>` : "";
  }

  // Dos o tres valores para reconocer el registro sin abrirlo.
  function destacados(etapa, d) {
    const partes = [];
    etapa.campos.forEach((c) => {
      if (c.clave === "fecha" || c.tipo === "largo") return;
      if (c.clave === "corte" || c.clave === "momento" || c.clave === "operacion") return;
      const v = d[c.clave];
      if (v === "" || v === undefined || v === null) return;
      if (partes.length >= 4) return;
      partes.push(c.etiqueta.replace(/ \(.*\)$/, "") + ": " + v + (c.unidad ? " " + c.unidad : ""));
    });
    return partes.join(" · ") || "Sin datos cargados.";
  }

  // ---------- El formulario ----------

  async function formulario(etapa, id) {
    const filas = await window.SemDB.registrosDe(etapa.id);
    const existente = id ? filas.find((r) => r.id === id) : null;
    borrador = existente ? JSON.parse(JSON.stringify(existente.datos)) : {};
    errores = {};
    pintarFormulario(etapa, existente, filas);
  }

  function pintarFormulario(etapa, existente, filas) {
    const previos = filas.filter((r) => !existente || r.id !== existente.id).map((r) => r.datos);
    const calc = derivados(etapa.id, borrador, ficha, previos);

    destino.innerHTML = `
      <div class="tarjeta tarjeta--que-es">
        <p>${etapa.queEs}</p>
      </div>

      ${window.Campos.pintar(etapa.campos, borrador, errores)}

      ${calc.length ? `<div class="tarjeta tarjeta--calculo">
          <h2>Lo que sale de estos datos</h2>
          <dl class="datos-rapidos">
            ${calc.map((c) => `<div><dt>${esc(c.etiqueta)}:</dt><dd>${esc(c.valor)}</dd></div>`).join("")}
          </dl>
          <p class="nota">Se calcula solo. No hace falta cargarlo.</p>
        </div>` : ""}

      <button class="boton boton--ancho" id="btn-guardar">Guardar</button>
      <button class="boton boton--secundario boton--ancho separado" id="btn-recalcular">Actualizar las cuentas</button>
      <button class="boton--peligro centrado separado" data-ir="registro/${etapa.id}">Volver sin guardar</button>`;

    enlazar();
    document.getElementById("btn-guardar").onclick = () => guardar(etapa, existente, filas);

    // Vuelve a dibujar con los números ya calculados, sin guardar nada: sirve
    // para ver el porcentaje o el rendimiento antes de confirmar.
    document.getElementById("btn-recalcular").onclick = () => {
      borrador = window.Campos.leer(etapa.campos, destino).valores;
      errores = {};
      pintarFormulario(etapa, existente, filas);
    };
  }

  async function guardar(etapa, existente, filas) {
    const leido = window.Campos.leer(etapa.campos, destino);
    borrador = leido.valores;
    errores = leido.errores;

    if (Object.keys(errores).length) {
      pintarFormulario(etapa, existente, filas);
      const primero = destino.querySelector(".mal");
      if (primero) primero.scrollIntoView({ block: "center" });
      brindis("Revisá los datos marcados.");
      return;
    }

    const guardado = await window.SemDB.guardarRegistro(etapa.id, borrador, existente ? existente.id : null);
    await window.SemDB.encolarCon(guardado.id, etapa.id, Object.assign(
      { variedad: (ficha || {}).variedad || window.Acceso.variedad(),
        estudiante: (ficha || {}).estudiante || "" },
      borrador));

    brindis(existente ? "Registro corregido." : "Registro guardado.");
    ir("registro/" + etapa.id);
  }

  function enlazar() {
    destino.querySelectorAll("[data-ir]").forEach((b) => { b.onclick = () => ir(b.dataset.ir); });
  }

  return { render };
})();
