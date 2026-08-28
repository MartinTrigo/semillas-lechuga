// ==========================================================================
// Semillas de Lechuga — carga de los archivos de datos
//
// Las variedades y el material de la wiki viven en docs/datos/*.json y no
// dentro del código: así se corrige una ficha sin tocar un solo renglón de
// JavaScript, y el service worker los guarda en el teléfono junto con la app.
// ==========================================================================

window.Datos = (function () {
  const cache = {};

  function traer(nombre) {
    if (cache[nombre]) return cache[nombre];
    cache[nombre] = fetch("datos/" + nombre + ".json")
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo leer datos/" + nombre + ".json");
        return r.json();
      })
      .catch((err) => { delete cache[nombre]; throw err; });
    return cache[nombre];
  }

  const variedades = () => traer("variedades").then((d) => d.variedades || []);
  const guia = () => traer("guia");

  const variedad = (id) => variedades().then((lista) =>
    lista.find((v) => v.id === id) || null);

  return { variedades, variedad, guia };
})();
