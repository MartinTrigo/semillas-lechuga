# Plan de desarrollo

## Fase 1 — La app carga y calcula · **hecha**

- [x] Las seis fichas de variedad en la wiki, con foto, fortalezas, cuidados y
      lo que falta averiguar.
- [x] El material de método: autogamia, aislamiento, selección masal, criterios
      baby leaf, escalas 1–5, cosecha y conservación, decisión del mix.
- [x] Ficha de identidad y trazabilidad por variedad.
- [x] Las siete etapas de registro, con sus cálculos derivados.
- [x] Todo guardado en el teléfono, sin señal.
- [x] Cola de envío armada, esperando el servicio.

## Fase 2 — La planilla · **hecha** (29/08/2026)

- [x] Crear la carpeta de Drive y las dos planillas ([INSTALACION.md](INSTALACION.md)).
- [x] Cargar las propiedades y ejecutar `prepararPlanillas()`.
- [x] Publicar el Apps Script y pegar su dirección en `docs/js/sincro.js`.
- [x] Publicar el repositorio en GitHub Pages:
      <https://martintrigo.github.io/semillas-lechuga/>
- [x] Abrir el acceso de la implementación a «Cualquier persona».
- [x] Ejecutar `crearInvitaciones()`: los seis códigos están en la hoja
      *Invitaciones*.

Comprobado desde la app publicada: el servicio contesta, acepta pedidos desde
`martintrigo.github.io` y rechaza tanto el envío sin credencial como el que
lleva una inventada.

### Antes de repartir los códigos

- [ ] **Una prueba de punta a punta**, que todavía no se hizo porque necesita
      una credencial real y no conviene gastar uno de los seis códigos.
      Ejecutar `crearInvitacion()` (singular) para sacar un séptimo código de
      prueba, activar la app con él, cargar un registro cualquiera, enviarlo,
      confirmar que la fila aparece en la planilla y después borrar esa fila.
      Es lo único que queda sin verificar: la escritura misma.
- [ ] Anotar en la columna *Para quién* de la hoja *Invitaciones* a qué
      estudiante le tocó cada variedad.

## Fase 3 — Comparar el mix · **falta**

La pantalla que hoy dice "llega en la fase 3". Cuando las seis fichas estén
cargando en la misma planilla, muestra las seis variedades una al lado de la
otra: días al primer corte, rendimiento en g/m², color, textura y espigado.
Es la pantalla con la que se decide la composición final.

Necesita que el servicio devuelva datos, no solo que los reciba: hoy el Apps
Script solo escribe.

## Fase 4 — Cierre del ciclo · **falta**

- [ ] Fotos propias del curso reemplazando las de catálogo
      (ver `docs/img/variedades/LEEME.md`).
- [ ] Exportar la ficha de cada estudiante como PDF para la presentación final.
- [ ] Rótulos imprimibles para los frascos, con los datos de la ficha de
      identidad.

---

# Tareas que no son de programación

Estas bloquean el proyecto, no la app.

## Antes de multiplicar

- [ ] **Confirmar Lilar.** Es la única de las seis cuyo proveedor no declara si
      es de polinización abierta. Pedirlo por escrito a Rodeo Semillas. Si
      resultara híbrida F1, la semilla que saquemos no conserva el tipo y hay
      que reemplazar la variedad o aceptar que esa ficha es solo de evaluación,
      no de multiplicación.
- [ ] Confirmar que ninguna de las seis tiene restricción de propiedad vegetal
      que impida multiplicarla. Las cinco restantes están declaradas OP, que es
      buena señal pero no es lo mismo que un permiso por escrito.
- [ ] Anotar el lote de cada sobre comprado **antes de abrirlo**. Después no se
      recupera.

## Antes de sembrar

- [ ] Acordar en clase el significado de cada punto de las escalas 1–5 y
      dejarlo fijo. Está propuesto en la wiki; lo que importa es que las seis
      personas lo interpreten igual.
- [ ] Definir la fecha única de siembra para las seis. Si alguna se adelanta
      (Gallega de Invierno y Lilar tienen ciclo más largo), escribirlo antes de
      hacerlo y anotarlo en la ficha, no explicarlo después.
- [ ] Definir el plano del ensayo: dónde va cada variedad y a qué distancia de
      las otras, pensando ya en la floración (3–6 m entre variedades floreciendo).
- [ ] Conseguir una balanza. Sin balanza no hay rendimiento en g/m², que es el
      dato con el que se decide el mix.

## Durante

- [ ] Decidir si se usa malla antiinsectos o embolsado. El embolsado es el
      mejor recurso didáctico: se ve para qué sirve.
- [ ] Sacar las fotos que faltan (lista en `docs/img/variedades/LEEME.md`).
