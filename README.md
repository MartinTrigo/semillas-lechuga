# Semillas de Lechuga

App de **seguimiento de la selección y producción de semilla propia** de seis
variedades de lechuga, para armar con ellas un mix de hojas tiernas (*baby
leaf*).

Cada estudiante del curso de **Operador Hortícola** se hace cargo de una
variedad y la sigue desde la siembra hasta el frasco de semilla rotulado.
Registra en el celular, parado al lado de la bandeja, con o sin señal. Los
datos de las seis variedades caen en la misma planilla, que es lo que permite
compararlas al final y decidir con números cuál entra al mix y en qué
proporción.

**La app está publicada en <https://martintrigo.github.io/semillas-lechuga/>**

Contacto: Martín Trigo — martinemilianotrigo@gmail.com

---

## Las seis variedades

| Variedad | Tipo | Aporte al mix | Multiplicable |
|---|---|---|---|
| Reina de Mayo *(sel. Princesa de Mayo)* | Mantecosa verde claro | Base tierna | Sí, OP tradicional |
| Gallega de Invierno | Mantecosa, frío | Rusticidad y crocancia | Sí, OP tradicional |
| Brisa | Crespa verde | Textura y calor | Sí, OP declarada |
| Hoja de Roble Kantu | Roble verde | Forma | Sí, OP declarada |
| Hoja de Roble Granate | Roble roja | Color rojo y forma | Sí, OP declarada |
| Lilar | Mantecosa morada | Color morado y frío | **A confirmar** |

Las fichas completas —color, porte, ciclo, resistencias, fortalezas, cuidados y
qué falta averiguar— están en la Wiki de la app y en
[`docs/datos/variedades.json`](docs/datos/variedades.json).

**Antes de multiplicar hay que confirmar Lilar.** Es la única de las seis cuyo
proveedor no declara si es de polinización abierta. Ver
[PLAN.md](PLAN.md), tareas pendientes.

---

## Si llegás nuevo a este proyecto

| Si sos… | Empezá por | Después |
|---|---|---|
| **Estudiante del curso** | Abrí la app y completá *Mi variedad* | La *Wiki*, la ficha de tu variedad |
| **Docente** | [INSTALACION.md](INSTALACION.md), para poner la planilla en marcha | [PLAN.md](PLAN.md), para ver qué falta |
| **Programador que va a revisar** | La sección *Cómo funciona*, acá abajo. Después `docs/js/etapas.js`, que es el que manda | [DECISIONES.md](DECISIONES.md) antes de proponer cambios |
| **Quien tenga que operar los accesos** | [SEGURIDAD.md](SEGURIDAD.md) | — |

---

## Cómo funciona, en resumen

**Qué es.** Una aplicación web instalable (PWA). No hay app en Play Store: se
abre un enlace y el navegador la instala. Se actualiza sola al publicarla.

**Con qué está hecha.** HTML, CSS y JavaScript **sin frameworks y sin ninguna
dependencia externa**. No hay `npm install`, no hay paso de compilación, no hay
nada que se baje de un CDN. Se sirve la carpeta `docs/` tal cual está y
funciona.

**Por qué así.** Porque tiene que funcionar sin señal al lado del almácigo, y
porque tiene que poder mantenerla otra persona dentro de diez años sin pelearse
con versiones de librerías. Está argumentado en [DECISIONES.md](DECISIONES.md).

**Dónde viven los datos.** En dos lugares: en el teléfono, en IndexedDB, que es
lo que permite cargar sin señal; y en una planilla de Google única para todo el
curso, dentro de una carpeta de Drive del proyecto. Entre medio hay un solo
Apps Script. **No hay servidor propio ni base de datos que mantener**, y ese
fue un criterio explícito, no una limitación.

**Cómo se protege.** Cada teléfono canjea una vez un código de invitación —que
ya viene atado a una variedad— y recibe una credencial. El servicio guarda solo
su huella SHA-256. Sin credencial no se escribe nada, y nadie puede cargar
datos en la variedad de otro. Detalle en [SEGURIDAD.md](SEGURIDAD.md).

---

## Qué se registra

Una **ficha de identidad** por variedad (trazabilidad: origen, lote, fecha de
siembra, número inicial de plantas, condiciones) y siete etapas que se van
acumulando:

| Etapa | Qué se anota | Cuándo |
|---|---|---|
| 🌱 Germinación y emergencia | Conteo de plántulas, temperatura, vigor | Diario |
| 🪴 Almácigo y plantín | Altura, hojas, diámetro, color, sanidad | Días 10, 15 y 20 |
| 🌾 Trasplante y crecimiento | Supervivencia, diámetro, daños, espigado precoz | Trasplante, +7 días, y cada 7–10 |
| 🍃 Evaluación baby leaf | Peso, superficie, largo y ancho de hoja, textura | En cada corte |
| 🌼 Floración y espigado | Plantas espigadas, altura del tallo, selección | Cada 3–7 días |
| 🫙 Cosecha de semilla | Peso bruto y limpio, secado, envase, rótulo | Cada tanda |
| 📝 Síntesis y recomendación | Las cuatro dimensiones y la propuesta de mix | Al cierre |

**La app hace sola las cuentas que a mano se equivocan siempre:** días desde la
siembra, porcentaje de emergencia, día de inicio y del 50 % de emergencia,
supervivencia al trasplante, incidencia de daños, rendimiento en g/m²,
proporción de hoja cosechable, rebrote del segundo corte sobre el primero y
semilla acumulada. Se muestran en pantalla y se recalculan si se corrige un
dato: no se guardan congeladas.

Para cambiar qué se registra, se toca **un solo archivo**:
[`docs/js/etapas.js`](docs/js/etapas.js). Agregar una variable es agregar un
renglón, y el formulario aparece solo. El único acompañamiento es sumar la
columna en `apps-script/Code.gs`, que está escrito con las mismas claves y en
el mismo orden a propósito.

---

## Estructura

```
docs/                    lo que se publica en GitHub Pages
  index.html
  css/estilos.css
  datos/variedades.json  las seis fichas — se edita sin tocar código
  datos/guia.json        el material de método de la wiki
  img/variedades/        fotos (ver el LEEME.md de esa carpeta)
  js/
    etapas.js            QUÉ se registra en cada etapa  ← el corazón
    campos.js            arma y lee todos los formularios
    registro.js          las pantallas de carga
    ficha.js             la ficha de identidad
    wiki.js              variedades y método
    sincro.js            canje del código y envío a la planilla
    db.js                IndexedDB: lo que permite trabajar sin señal
    app.js               navegación
  sw.js                  service worker (funciona sin señal)
apps-script/Code.gs      el servicio que escribe en la planilla
IDS.txt                  identificadores de las planillas — NO se publica
```

## Cómo se prueba en la máquina

```bash
python -m http.server 8777 --directory docs
```

Y abrir <http://127.0.0.1:8777>. No hace falta nada más: no hay build.
