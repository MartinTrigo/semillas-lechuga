// ==========================================================================
// Semillas de Lechuga — base de datos local (IndexedDB)
//
// Todo lo que el estudiante carga se guarda primero acá, en el teléfono. Así
// se puede registrar parado al lado de la bandeja, con el celular en una mano
// y la regla en la otra, aunque no haya señal. Después, cuando hay conexión,
// la cola de "salida" se envía a la planilla del proyecto.
//
// El registro NO se borra al enviarse: queda en el teléfono para poder verlo,
// y solo se marca como enviado. Lo que se vacía es la cola.
// ==========================================================================

window.SemDB = (function () {
  const NOMBRE = "semillas";
  const VERSION = 1;

  // Cada almacén con sus índices. Para agregar uno nuevo más adelante:
  // sumarlo acá y subir VERSION en uno.
  const ESQUEMA = {
    identidad: { clave: "clave", indices: [] },
    registros: { clave: "id", indices: ["etapa", "fecha", "enviado"] },
    salida:    { clave: "id", indices: ["tipo"] },
  };

  let conexion = null;

  function abrir() {
    if (conexion) return Promise.resolve(conexion);

    return new Promise((resolver, rechazar) => {
      const pedido = indexedDB.open(NOMBRE, VERSION);

      pedido.onupgradeneeded = (evento) => {
        const db = evento.target.result;
        for (const [nombre, def] of Object.entries(ESQUEMA)) {
          const almacen = db.objectStoreNames.contains(nombre)
            ? evento.target.transaction.objectStore(nombre)
            : db.createObjectStore(nombre, { keyPath: def.clave });

          def.indices.forEach((campo) => {
            if (!almacen.indexNames.contains(campo)) almacen.createIndex(campo, campo);
          });
        }
      };

      pedido.onsuccess = () => { conexion = pedido.result; resolver(conexion); };
      pedido.onerror = () => rechazar(pedido.error);
      pedido.onblocked = () => rechazar(new Error("Hay otra pestaña de la app abierta con una versión distinta."));
    });
  }

  // Envuelve una operación sobre un almacén y espera a que la transacción
  // termine de verdad, no solo a que el pedido responda.
  function operar(almacen, modo, hacer) {
    return abrir().then((db) => new Promise((resolver, rechazar) => {
      const tx = db.transaction(almacen, modo);
      const pedido = hacer(tx.objectStore(almacen));
      let resultado;
      if (pedido) pedido.onsuccess = () => { resultado = pedido.result; };
      tx.oncomplete = () => resolver(resultado);
      tx.onabort = tx.onerror = () => rechazar(tx.error);
    }));
  }

  const guardar = (almacen, dato)  => operar(almacen, "readwrite", (a) => a.put(dato));
  const obtener = (almacen, clave) => operar(almacen, "readonly",  (a) => a.get(clave));
  const todos   = (almacen)        => operar(almacen, "readonly",  (a) => a.getAll()).then((r) => r || []);
  const borrar  = (almacen, clave) => operar(almacen, "readwrite", (a) => a.delete(clave));

  // ---------- Ficha de identidad ----------
  //
  // Va como un único documento: no se acumula, se corrige. Se envía entera y
  // reemplaza la fila anterior en lugar de sumar filas repetidas.

  const CLAVE = "ficha";

  const leerIdentidad = () =>
    obtener("identidad", CLAVE).then((fila) => (fila ? fila.valor : null));

  const guardarIdentidad = (datos) =>
    guardar("identidad", { clave: CLAVE, valor: datos, actualizado: new Date().toISOString() });

  // Está completa cuando se sabe de quién es, de dónde salió la semilla,
  // cuándo se sembró y cuántas plantas hay. Sin eso no se puede calcular
  // ningún porcentaje ni ningún "días desde la siembra".
  const identidadCompleta = (f) =>
    !!(f && f.estudiante && f.origen && f.fecha_siembra && Number(f.plantas_inicial) > 0);

  // ---------- Registros de las etapas ----------

  function guardarRegistro(etapa, datos, id) {
    const fila = {
      id: id || nuevoId(),
      etapa: etapa,
      fecha: datos.fecha || "",
      datos: datos,
      enviado: 0,
      creado: new Date().toISOString(),
    };
    return guardar("registros", fila).then(() => fila);
  }

  const registros = () => todos("registros");

  function registrosDe(etapa) {
    return registros().then((lista) => lista
      .filter((r) => r.etapa === etapa)
      .sort((a, b) => (a.fecha === b.fecha
        ? (a.creado < b.creado ? -1 : 1)
        : (a.fecha < b.fecha ? -1 : 1))));
  }

  const borrarRegistro = (id) => borrar("registros", id).then(() => borrar("salida", id));

  function marcarEnviados(ids) {
    return abrir().then((db) => new Promise((resolver, rechazar) => {
      const tx = db.transaction("registros", "readwrite");
      const almacen = tx.objectStore("registros");
      ids.forEach((id) => {
        const p = almacen.get(id);
        p.onsuccess = () => {
          const fila = p.result;
          if (fila) { fila.enviado = 1; almacen.put(fila); }
        };
      });
      tx.oncomplete = () => resolver(true);
      tx.onabort = tx.onerror = () => rechazar(tx.error);
    }));
  }

  // ---------- Cola de envío ----------
  //
  // Cada sobre lleva el identificador del teléfono desde que se crea, no desde
  // que se envía: así queda constancia de dónde salió aunque suba semanas
  // después.
  function sobre(tipo, datos, id) {
    return {
      id: id || nuevoId(),
      tipo: tipo,
      datos: datos,
      dispositivo: window.Acceso.dispositivo(),
      creado: new Date().toISOString(),
    };
  }

  // El registro usa SU id en la cola, no uno nuevo: así volver a encolar el
  // mismo registro lo reemplaza en vez de sumarlo, y en la planilla no aparece
  // dos veces aunque se toque guardar tres veces seguidas.
  const encolarCon = (id, tipo, datos) => guardar("salida", sobre(tipo, datos, id));

  // Para lo que se corrige en vez de acumularse, como la ficha de identidad:
  // la versión nueva reemplaza a la anterior que todavía no se envió, así la
  // planilla no recibe tres fichas distintas de la misma variedad.
  function encolarUnico(tipo, datos) {
    return abrir().then((db) => new Promise((resolver, rechazar) => {
      const tx = db.transaction("salida", "readwrite");
      const almacen = tx.objectStore("salida");
      const cursor = almacen.index("tipo").openCursor(IDBKeyRange.only(tipo));

      cursor.onsuccess = (evento) => {
        const puntero = evento.target.result;
        if (puntero) { puntero.delete(); puntero.continue(); return; }
        almacen.put(sobre(tipo, datos));
      };

      tx.oncomplete = () => resolver(true);
      tx.onabort = tx.onerror = () => rechazar(tx.error);
    }));
  }

  const pendientes = () => todos("salida");
  const sacarDeLaCola = (id) => borrar("salida", id);

  // ---------- Identificadores ----------

  function nuevoId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  return {
    abrir,
    leerIdentidad, guardarIdentidad, identidadCompleta,
    guardarRegistro, registros, registrosDe, borrarRegistro, marcarEnviados,
    encolarCon, encolarUnico, pendientes, sacarDeLaCola,
    nuevoId,
  };
})();
