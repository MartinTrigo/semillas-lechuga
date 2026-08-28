# Decisiones de diseño

Qué se descartó y con qué argumento. Si vas a proponer un cambio, leé primero
la decisión que lo toca: puede que ya se haya discutido.

---

## Una sola planilla para las seis variedades, no una por estudiante

**Lo alternativo:** una planilla por variedad, como en BioSalud, donde cada
chacra tiene la suya.

**Por qué no:** allá el objetivo era que cada productor viera solo lo suyo. Acá
el objetivo es exactamente el contrario. Todo el sentido del proyecto es poner
las seis variedades una al lado de la otra y compararlas: días al primer corte,
gramos por metro cuadrado, precocidad de espigado. Con seis archivos separados
esa comparación hay que armarla a mano cada vez.

Cada fila lleva su variedad y su estudiante, así que la separación existe donde
hace falta —una columna— sin romper la comparación.

---

## Una hoja por etapa, no una hoja por estudiante

Las siete etapas son siete hojas, y las seis variedades comparten cada hoja.
Así, la hoja "Baby leaf" es directamente la tabla de comparación de rendimiento
entre variedades: se ordena por la columna Variedad y ya está.

Con una hoja por estudiante habría que hacer seis consultas y pegarlas.

---

## Las etapas se declaran, no se programan

`docs/js/etapas.js` es una lista de campos, no código de pantallas. De esa lista
salen los formularios, la validación y los nombres de las columnas.

**Por qué:** porque lo que más va a cambiar en este proyecto es *qué se mide*.
La primera temporada va a mostrar que faltaba una variable y que sobraban dos.
Si cada variable nueva obligara a tocar HTML, validación y planilla en tres
lugares distintos, el seguimiento se congela en la versión del primer año.

Agregar una variable es agregar un renglón en una lista.

---

## La app calcula los porcentajes, no el estudiante

Emergencia, supervivencia, incidencia, rendimiento en g/m², rebrote. Todos
salen de datos crudos que sí se cargan a mano.

**Por qué:** porque son las cuentas que a mano se equivocan siempre, y porque un
porcentaje mal calculado no se detecta después: entra a la planilla con
apariencia de dato bueno. Cargando el numerador y el denominador por separado,
el error queda a la vista.

Además se recalculan si se corrige el número inicial de plantas. Un porcentaje
guardado se hubiera quedado con el valor viejo.

---

## Los números se escriben como texto

`<input type="text">` con `inputmode="decimal"`, no `<input type="number">`.

**Por qué:** es una lección de MonAgric. El navegador considera inválido "5,5"
en un campo numérico y **lo deja vacío sin avisar**. Acá la gente escribe con
coma. Se recibe texto y se interpreta en `util.js`, a la argentina: la coma es
el decimal y el punto separa miles.

---

## La escala 1–5 son cinco botones, no un desplegable

Ocupan más pantalla y valen la pena: se usa de pie, al sol, a veces con
guantes. Un desplegable de cinco opciones se erra; un botón de 60 px no.

Además cada dimensión tiene sus propias palabras: un 1 en uniformidad no es
"muy bajo", es "muy dispar". Poner la palabra correcta debajo del número es lo
que hace que seis personas puntúen parecido, que es de lo que depende que los
datos se puedan comparar al final.

---

## La variedad la asigna el código de acceso, no la elige el estudiante

El código de invitación ya viene atado a una variedad. Al canjearlo, el teléfono
queda ligado a esa variedad y no puede cargar en otra.

**Por qué:** con seis personas cargando en la misma planilla, el error más
probable y más caro es que alguien cargue tres mediciones en la variedad
equivocada. Descubrirlo dos meses después es irrecuperable.

Mientras el servicio no esté publicado, la variedad se elige de una lista para
poder empezar a trabajar. Al canjear el código, esa elección queda fija.

---

## El control de acceso está desde el primer día

En MonAgric se agregó después, y en el medio hubo un período en que cualquiera
con la dirección del servicio —que está en el código público— podía inventar
registros y borrar una temporada entera. No era teoría: se comprobó
ejecutándolo.

Acá el `doPost` no escribe una sola fila sin credencial válida, y esa credencial
tiene que ser de la variedad que dice el registro.

---

## Nada se baja de internet

Ni tipografías, ni librerías, ni imágenes de otros sitios. Eso permite declarar
en la política de contenido de dónde puede venir cada cosa y que el navegador
rechace todo lo demás.

El costo es escribir a mano cosas que una librería resolvería. El beneficio es
que la app funciona con el celular en modo avión y que dentro de diez años sigue
funcionando igual, porque no depende de que un CDN siga existiendo.

---

## Red primero, caché de respaldo, con paciencia corta

El service worker pide siempre a la red y espera 3 segundos; si no llegó, usa lo
guardado.

**Por qué:** "caché primero" deja a los teléfonos con la versión vieja para
siempre, porque nunca vuelven a preguntar. Pero la señal en un invernáculo no es
"hay o no hay": muchas veces es una señal débil que tarda quince segundos, y eso
es peor que no tener nada porque la app queda colgada. Tres segundos es el punto
donde con buena señal siempre llega lo último y con señal mala la app abre igual.

---

## Un registro enviado se corrige, no se borra

Mientras no se envió, el estudiante puede borrarlo desde el teléfono. Una vez
que subió a la planilla, se puede seguir corrigiendo —viaja con el mismo id y
reemplaza su fila— pero ya no se borra desde la app.

**Por qué:** borrar un dato ya subido es una decisión que conviene tomar con el
docente mirando la planilla, no sola en el campo a las siete de la tarde.

---

## Las fotos de catálogo son provisorias

Las seis fotos actuales son de los semilleros, con crédito y enlace, y están
para reconocer la variedad antes de tener plantas propias. Se reemplazan por
las del curso apenas haya. Ver `docs/img/variedades/LEEME.md`.
