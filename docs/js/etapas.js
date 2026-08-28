// ==========================================================================
// Semillas de Lechuga — qué se registra en cada etapa
//
// Este archivo es el corazón de la app y está hecho para que se pueda tocar
// sin saber programar. Cada etapa es una lista de campos declarados; las
// pantallas de carga, la validación y las columnas de la planilla salen todas
// de acá. Para agregar una variable al seguimiento alcanza con sumar un campo
// a la lista, y aparece sola en el formulario.
//
// El único lugar donde hay que acompañar el cambio es apps-script/Code.gs, que
// tiene los encabezados de cada hoja. Están escritos con las mismas claves y
// en el mismo orden, a propósito.
//
// TIPOS DE CAMPO
//   fecha    día calendario
//   entero   cantidad de cosas: plantas, hojas, días
//   numero   medición con decimales: cm, gramos (acepta coma, ver util.js)
//   escala   1 a 5, con el significado de cada punto en la wiki
//   opcion   una de varias
//   siNo     sí o no
//   texto    una línea
//   largo    varias líneas
// ==========================================================================

window.Etapas = (function () {

  // ---------- La ficha de identidad ----------
  //
  // No es una etapa: es lo que se carga una vez y se corrige, no se acumula.
  // Sale del punto 8 del informe, "Registro de identidad y trazabilidad", y es
  // lo que hace que dentro de tres años se sepa de dónde salió cada semilla.

  const IDENTIDAD = [
    { clave: "estudiante", etiqueta: "Tu nombre y apellido", tipo: "texto", obligatorio: true },
    { clave: "comision", etiqueta: "Comisión o grupo", tipo: "texto" },
    { clave: "origen", etiqueta: "Origen de la semilla", tipo: "texto", obligatorio: true,
      ayuda: "Marca, semillero o de quién vino. Ej.: Rodeo Semillas" },
    { clave: "lote", etiqueta: "Lote de la semilla comercial", tipo: "texto",
      ayuda: "El número que viene en el sobre. Si no dice, poner 'sin lote'." },
    { clave: "fecha_siembra", etiqueta: "Fecha de siembra", tipo: "fecha", obligatorio: true,
      ayuda: "Es el día 0 de todo el seguimiento: los días de cada medición se cuentan desde acá." },
    { clave: "plantas_inicial", etiqueta: "Número inicial de plantas sembradas", tipo: "entero",
      obligatorio: true, unidad: "plantas", ayuda: "Una bandeja de 128 alvéolos = 128." },
    { clave: "sustrato", etiqueta: "Sustrato", tipo: "texto" },
    { clave: "lugar", etiqueta: "Dónde está el almácigo", tipo: "opcion",
      opciones: ["Invernáculo", "Túnel", "Campo abierto", "Cámara o interior"] },
    { clave: "condiciones", etiqueta: "Condiciones de cultivo", tipo: "largo",
      ayuda: "Riego, fertilización, temperatura. Todo lo que sea distinto para tu variedad hay que anotarlo acá." },
  ];

  // ---------- Las seis etapas del seguimiento ----------

  const ETAPAS = [

    {
      id: "emergencia",
      nombre: "Germinación y emergencia",
      corto: "Emergencia",
      emoji: "🌱",
      subtitulo: "Conteo de plántulas emergidas",
      queEs: `Un registro por conteo. Contá cuántas plántulas hay emergidas en
        total (no cuántas nuevas) y anotá el día. Con eso la app calcula sola el
        porcentaje, el día de inicio y el día del 50 % de emergencia.`,
      cuando: "Todos los días, desde la siembra hasta que deje de emerger.",
      campos: [
        { clave: "fecha", etiqueta: "Fecha del conteo", tipo: "fecha", obligatorio: true, hoy: true },
        { clave: "emergidas", etiqueta: "Plántulas emergidas (total acumulado)", tipo: "entero",
          obligatorio: true, unidad: "plántulas",
          ayuda: "El total que ves hoy, no las que salieron desde ayer." },
        { clave: "temp_max", etiqueta: "Temperatura máxima", tipo: "numero", unidad: "°C" },
        { clave: "temp_min", etiqueta: "Temperatura mínima", tipo: "numero", unidad: "°C" },
        { clave: "uniformidad", etiqueta: "Uniformidad de la emergencia", tipo: "escala",
          ayuda: "Completar recién al final de la emergencia." },
        { clave: "vigor", etiqueta: "Vigor inicial", tipo: "escala",
          ayuda: "Aspecto, expansión de cotiledones y crecimiento. Se evalúa a los 7–10 días." },
        { clave: "observaciones", etiqueta: "Observaciones", tipo: "largo" },
      ],
    },

    {
      id: "almacigo",
      nombre: "Almácigo y plantín",
      corto: "Almácigo",
      emoji: "🪴",
      subtitulo: "Mediciones sobre 10 plantas",
      queEs: `Medí siempre sobre las mismas diez plantas y anotá el promedio.
        Diez plantas al azar bien medidas dicen más que las 128 mal medidas.`,
      cuando: "A los 10, 15 y 20 días desde la siembra.",
      campos: [
        { clave: "fecha", etiqueta: "Fecha de la medición", tipo: "fecha", obligatorio: true, hoy: true },
        { clave: "altura", etiqueta: "Altura de planta (promedio)", tipo: "numero", unidad: "cm",
          ayuda: "Desde el cuello hasta el extremo de la hoja más alta." },
        { clave: "hojas", etiqueta: "Hojas verdaderas (promedio)", tipo: "numero", unidad: "hojas",
          ayuda: "No contar los cotiledones." },
        { clave: "diametro", etiqueta: "Diámetro de la roseta", tipo: "numero", unidad: "cm",
          ayuda: "Ancho máximo. Se mide a los 20 días." },
        { clave: "color", etiqueta: "Color", tipo: "escala",
          ayuda: "Comparado con la foto o la descripción de tu variedad en la wiki." },
        { clave: "uniformidad", etiqueta: "Uniformidad del lote", tipo: "escala" },
        { clave: "sanidad", etiqueta: "Sanidad", tipo: "escala" },
        { clave: "observaciones", etiqueta: "Observaciones", tipo: "largo" },
      ],
    },

    {
      id: "trasplante",
      nombre: "Trasplante y crecimiento",
      corto: "Trasplante",
      emoji: "🌾",
      subtitulo: "Del trasplante hasta el tamaño de cosecha",
      queEs: `El primer registro es el trasplante en sí. Después se suma un
        registro por cada evaluación a campo hasta llegar al tamaño de corte.`,
      cuando: "El día del trasplante, a los 7 días (supervivencia) y después cada 7–10 días.",
      campos: [
        { clave: "fecha", etiqueta: "Fecha", tipo: "fecha", obligatorio: true, hoy: true },
        { clave: "momento", etiqueta: "Qué registro es", tipo: "opcion", obligatorio: true,
          opciones: ["Trasplante", "Supervivencia a los 7 días", "Evaluación de crecimiento"] },
        { clave: "trasplantadas", etiqueta: "Plantas trasplantadas", tipo: "entero", unidad: "plantas",
          ayuda: "Solo en el registro del trasplante." },
        { clave: "vivas", etiqueta: "Plantas vivas", tipo: "entero", unidad: "plantas",
          ayuda: "A los 7 días. La app calcula el porcentaje de supervivencia." },
        { clave: "marco", etiqueta: "Distancia entre plantas", tipo: "texto",
          ayuda: "Ej.: 20 × 20 cm, o fajas densas de 15 cm." },
        { clave: "diametro", etiqueta: "Diámetro de roseta (promedio)", tipo: "numero", unidad: "cm" },
        { clave: "peso_planta", etiqueta: "Peso fresco por planta", tipo: "numero", unidad: "g",
          ayuda: "Si hay balanza. Promedio de 5 plantas." },
        { clave: "uniformidad", etiqueta: "Uniformidad del lote", tipo: "escala" },
        { clave: "sanidad", etiqueta: "Sanidad", tipo: "escala" },
        { clave: "danios", etiqueta: "Plantas con daños, plagas o enfermedad", tipo: "entero",
          unidad: "plantas", ayuda: "La app calcula el porcentaje sobre las vivas." },
        { clave: "espigadas", etiqueta: "Plantas espigadas", tipo: "entero", unidad: "plantas",
          ayuda: "Espigado precoz: las que empezaron a tirar el tallo antes de tiempo." },
        { clave: "observaciones", etiqueta: "Observaciones", tipo: "largo" },
      ],
    },

    {
      id: "babyleaf",
      nombre: "Evaluación baby leaf",
      corto: "Baby leaf",
      emoji: "🍃",
      subtitulo: "Un registro por corte",
      queEs: `Es la evaluación que decide la composición del mix. Pesá lo
        cosechado y anotá la superficie de la que salió: sin la superficie, el
        peso no se puede comparar entre variedades.`,
      cuando: "En cada corte. Si se hacen cortes sucesivos, uno por corte.",
      campos: [
        { clave: "fecha", etiqueta: "Fecha del corte", tipo: "fecha", obligatorio: true, hoy: true },
        { clave: "corte", etiqueta: "Número de corte", tipo: "opcion", obligatorio: true,
          opciones: ["1º corte", "2º corte", "3º corte", "4º corte"] },
        { clave: "superficie", etiqueta: "Superficie cosechada", tipo: "numero", obligatorio: true,
          unidad: "m²", ayuda: "Largo por ancho de la faja que cortaste." },
        { clave: "peso_fresco", etiqueta: "Peso fresco cosechado", tipo: "numero", obligatorio: true,
          unidad: "g", ayuda: "Hoja limpia, sin raíces ni descarte." },
        { clave: "altura_corte", etiqueta: "Altura del corte", tipo: "numero", unidad: "cm",
          ayuda: "Desde el suelo. Para baby leaf suele ser 4–6 cm." },
        { clave: "largo_hoja", etiqueta: "Largo de hoja (promedio)", tipo: "numero", unidad: "cm",
          ayuda: "Promedio de 10 hojas al azar." },
        { clave: "ancho_hoja", etiqueta: "Ancho de hoja (promedio)", tipo: "numero", unidad: "cm" },
        { clave: "color", etiqueta: "Color", tipo: "escala" },
        { clave: "textura", etiqueta: "Textura", tipo: "escala",
          ayuda: "Evaluación sensorial: cómo se siente la hoja al comerla." },
        { clave: "uniformidad", etiqueta: "Uniformidad del corte", tipo: "escala" },
        { clave: "descarte", etiqueta: "Descarte", tipo: "numero", unidad: "g",
          ayuda: "Hoja que hubo que tirar. Sirve para saber la proporción de hoja cosechable." },
        { clave: "observaciones", etiqueta: "Observaciones", tipo: "largo" },
      ],
    },

    {
      id: "floracion",
      nombre: "Floración y espigado",
      corto: "Floración",
      emoji: "🌼",
      subtitulo: "De la subida del tallo a la flor abierta",
      queEs: `Acá se define qué plantas van a semilla. El dato más importante
        del mix está en esta etapa: cuántos días aguanta cada variedad sin
        espigar.`,
      cuando: "Desde que se ve la primera planta subiendo, cada 3–7 días.",
      campos: [
        { clave: "fecha", etiqueta: "Fecha", tipo: "fecha", obligatorio: true, hoy: true },
        { clave: "momento", etiqueta: "Qué se observó", tipo: "opcion", obligatorio: true,
          opciones: ["Inicio de espigado", "Espigado avanzado", "Inicio de floración",
                     "Plena floración", "Selección de plantas para semilla"] },
        { clave: "espigadas", etiqueta: "Plantas espigadas", tipo: "entero", unidad: "plantas",
          ayuda: "La app calcula el porcentaje sobre el total del lote." },
        { clave: "altura_tallo", etiqueta: "Altura del tallo floral (promedio)", tipo: "numero",
          unidad: "cm" },
        { clave: "sanidad", etiqueta: "Sanidad de las plantas para semilla", tipo: "escala" },
        { clave: "seleccionadas", etiqueta: "Plantas seleccionadas para semilla", tipo: "entero",
          unidad: "plantas", ayuda: "El objetivo del proyecto son 25 a 40 por variedad." },
        { clave: "criterios", etiqueta: "Criterios de selección aplicados", tipo: "largo",
          ayuda: "Por qué elegiste esas plantas y no otras. Es lo que se pierde si no se anota." },
        { clave: "aislamiento", etiqueta: "Aislamiento usado", tipo: "opcion",
          opciones: ["Distancia (3–6 m)", "Malla antiinsectos", "Embolsado de inflorescencias",
                     "Floración escalonada", "Sin aislamiento"] },
        { clave: "observaciones", etiqueta: "Observaciones", tipo: "largo" },
      ],
    },

    {
      id: "semilla",
      nombre: "Cosecha y conservación de semilla",
      corto: "Semilla",
      emoji: "🫙",
      subtitulo: "Cosecha escalonada, limpieza y guardado",
      queEs: `La semilla no madura toda junta: se cosecha por tandas cuando la
        cabezuela muestra el vilano blanco. Un registro por tanda, y uno final
        para el guardado.`,
      cuando: "Cada vez que se cosecha, se limpia o se guarda semilla.",
      campos: [
        { clave: "fecha", etiqueta: "Fecha", tipo: "fecha", obligatorio: true, hoy: true },
        { clave: "operacion", etiqueta: "Qué se hizo", tipo: "opcion", obligatorio: true,
          opciones: ["Cosecha parcial", "Cosecha final", "Secado", "Limpieza", "Guardado"] },
        { clave: "plantas_cosechadas", etiqueta: "Plantas cosechadas", tipo: "entero",
          unidad: "plantas" },
        { clave: "peso_bruto", etiqueta: "Peso en bruto", tipo: "numero", unidad: "g",
          ayuda: "Con vilano y restos, antes de limpiar." },
        { clave: "peso_limpio", etiqueta: "Peso de semilla limpia", tipo: "numero", unidad: "g",
          ayuda: "Es el dato que va al rótulo." },
        { clave: "metodo_limpieza", etiqueta: "Método de limpieza", tipo: "texto",
          ayuda: "Zarandeo, viento, frotado." },
        { clave: "secado", etiqueta: "Cómo se secó", tipo: "texto",
          ayuda: "Lugar, días, si hubo sol directo." },
        { clave: "envase", etiqueta: "Envase", tipo: "texto",
          ayuda: "Frasco hermético, sobre de papel, bolsa." },
        { clave: "rotulo", etiqueta: "Qué dice el rótulo", tipo: "texto",
          ayuda: "Variedad, año, origen, lote. Copiarlo tal cual quedó escrito." },
        { clave: "guardado_en", etiqueta: "Dónde queda guardada", tipo: "texto" },
        { clave: "observaciones", etiqueta: "Observaciones", tipo: "largo" },
      ],
    },

    {
      id: "sintesis",
      nombre: "Síntesis y recomendación",
      corto: "Síntesis",
      emoji: "📝",
      subtitulo: "El cierre de la ficha del estudiante",
      queEs: `Se completa una vez, al final del ciclo. Es la conclusión que se
        presenta y lo que se lleva a la decisión final del mix.`,
      cuando: "Al terminar el seguimiento.",
      campos: [
        { clave: "fecha", etiqueta: "Fecha", tipo: "fecha", obligatorio: true, hoy: true },
        { clave: "adaptacion", etiqueta: "Adaptación y comportamiento agronómico", tipo: "escala" },
        { clave: "rendimiento", etiqueta: "Rendimiento y uniformidad", tipo: "escala" },
        { clave: "calidad", etiqueta: "Calidad sensorial y visual", tipo: "escala" },
        { clave: "complementa", etiqueta: "Complementariedad con las otras variedades", tipo: "escala",
          ayuda: "¿Aporta algo que las otras cinco no aportan?" },
        { clave: "recomienda", etiqueta: "¿La recomendás para el mix?", tipo: "siNo", obligatorio: true },
        { clave: "proporcion", etiqueta: "Proporción que propone en el mix", tipo: "numero",
          unidad: "%", ayuda: "La propuesta inicial de tu variedad está en la wiki." },
        { clave: "por_que", etiqueta: "¿Por qué?", tipo: "largo", obligatorio: true,
          ayuda: "Con los datos que registraste, no de memoria." },
        { clave: "aprendizaje", etiqueta: "Qué harías distinto el año que viene", tipo: "largo" },
      ],
    },
  ];

  // ---------- Cuentas que hace la app ----------
  //
  // Son las que el informe pide calcular y que a mano se equivocan siempre:
  // porcentajes sobre el total del lote y rendimiento por superficie. Se
  // muestran en pantalla, no se guardan: si el número inicial de plantas se
  // corrige, los porcentajes se recalculan solos.

  function dias(desde, hasta) {
    if (!desde || !hasta) return null;
    const a = new Date(desde + "T00:00:00");
    const b = new Date(hasta + "T00:00:00");
    const d = Math.round((b - a) / 86400000);
    return Number.isFinite(d) ? d : null;
  }

  const porcentaje = (parte, total) =>
    (total > 0 && parte !== "" && parte !== null && parte !== undefined)
      ? Math.round((Number(parte) / Number(total)) * 1000) / 10
      : null;

  // Devuelve una lista de { etiqueta, valor } para mostrar debajo del registro.
  function derivados(etapaId, d, identidad, previos) {
    const total = Number((identidad || {}).plantas_inicial) || 0;
    const siembra = (identidad || {}).fecha_siembra;
    const salida = [];
    const dds = dias(siembra, d.fecha);
    if (dds !== null) salida.push({ etiqueta: "Días desde la siembra", valor: dds });

    if (etapaId === "emergencia") {
      const p = porcentaje(d.emergidas, total);
      if (p !== null) salida.push({ etiqueta: "Emergencia", valor: p + " %" });

      // El día del 50 % se calcula sobre toda la serie, no sobre este conteo.
      const serie = (previos || []).concat([d])
        .filter((r) => r.fecha && r.emergidas !== "" && r.emergidas !== undefined)
        .sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
      const primera = serie.find((r) => Number(r.emergidas) > 0);
      if (primera) {
        salida.push({ etiqueta: "Inicio de emergencia", valor: dias(siembra, primera.fecha) + " días" });
      }
      if (total) {
        const mitad = serie.find((r) => Number(r.emergidas) >= total / 2);
        if (mitad) salida.push({ etiqueta: "50 % de emergencia", valor: dias(siembra, mitad.fecha) + " días" });
      }
    }

    if (etapaId === "trasplante") {
      const base = Number(d.trasplantadas) || ultimoValor(previos, "trasplantadas");
      const sup = porcentaje(d.vivas, base);
      if (sup !== null) salida.push({ etiqueta: "Supervivencia al trasplante", valor: sup + " %" });
      const vivas = Number(d.vivas) || base;
      const dan = porcentaje(d.danios, vivas);
      if (dan !== null) salida.push({ etiqueta: "Incidencia de daños", valor: dan + " %" });
      const esp = porcentaje(d.espigadas, vivas);
      if (esp !== null) salida.push({ etiqueta: "Espigado precoz", valor: esp + " %" });
    }

    if (etapaId === "babyleaf") {
      const sup = Number(d.superficie) || 0;
      const peso = Number(d.peso_fresco) || 0;
      if (sup > 0 && peso > 0) {
        const rend = Math.round((peso / sup) * 10) / 10;
        salida.push({ etiqueta: "Rendimiento", valor: rend + " g/m²" });
      }
      if (peso > 0 && d.descarte !== "" && d.descarte !== undefined) {
        const util = porcentaje(peso, peso + Number(d.descarte));
        if (util !== null) salida.push({ etiqueta: "Hoja cosechable", valor: util + " %" });
      }
      // Rebrote: este corte contra el primero, a igual superficie.
      const primero = (previos || []).find((r) => r.corte === "1º corte");
      if (primero && d.corte !== "1º corte" && sup > 0 && Number(primero.superficie) > 0) {
        const r1 = Number(primero.peso_fresco) / Number(primero.superficie);
        const r2 = peso / sup;
        if (r1 > 0) salida.push({ etiqueta: "Rebrote sobre el 1º corte",
                                  valor: Math.round((r2 / r1) * 100) + " %" });
      }
    }

    if (etapaId === "floracion") {
      const esp = porcentaje(d.espigadas, total);
      if (esp !== null) salida.push({ etiqueta: "Plantas espigadas", valor: esp + " %" });
      if (d.seleccionadas) {
        const n = Number(d.seleccionadas);
        salida.push({
          etiqueta: "Plantas para semilla",
          valor: n + (n < 25 ? " (el objetivo son 25 a 40)" : n > 40 ? " (más de lo previsto, está bien)" : " · dentro del objetivo"),
        });
      }
    }

    if (etapaId === "semilla") {
      if (d.peso_limpio && d.plantas_cosechadas) {
        const porPlanta = Number(d.peso_limpio) / Number(d.plantas_cosechadas);
        salida.push({ etiqueta: "Semilla por planta", valor: (Math.round(porPlanta * 100) / 100) + " g" });
      }
      const acumulado = (previos || []).concat([d])
        .reduce((suma, r) => suma + (Number(r.peso_limpio) || 0), 0);
      if (acumulado > 0) salida.push({ etiqueta: "Semilla limpia acumulada", valor: (Math.round(acumulado * 100) / 100) + " g" });
    }

    return salida;
  }

  function ultimoValor(previos, clave) {
    for (let i = (previos || []).length - 1; i >= 0; i--) {
      const v = previos[i][clave];
      if (v !== "" && v !== null && v !== undefined) return Number(v);
    }
    return 0;
  }

  const porId = (id) => ETAPAS.find((e) => e.id === id) || null;

  return { IDENTIDAD, ETAPAS, porId, derivados, dias };
})();
