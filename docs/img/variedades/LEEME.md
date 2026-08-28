# Fotos de las variedades

Estas seis fotos salen de los catálogos de los semilleros que venden cada
variedad. Están acá con un propósito concreto y acotado: que el estudiante
pueda comparar lo que ve en su bandeja con la variedad que le tocó, antes de
tener plantas propias que fotografiar.

Cada foto lleva el crédito del semillero visible en la ficha, y la ficha enlaza
a la página de origen. Los datos de crédito y enlace están en
`docs/datos/variedades.json`, en el campo `foto` de cada variedad.

| Archivo | Variedad | Origen |
|---|---|---|
| `reina-de-mayo.webp` | Reina de Mayo sel. Princesa de Mayo | [Semillas Batlle](https://semillasbatlle.com/productosbatlle/semillas/semillas-horticolas/lechuga-reina-de-mayo-sel-princesa-de-mayo/) |
| `gallega.webp` | Gallega de Invierno | [Rodeo Semillas](https://rodeosemillas.com/producto/lechuga-mantecosa-gallega-de-invierno/) |
| `brisa.webp` | Brisa | [Rodeo Semillas](https://rodeosemillas.com/producto/lechuga-crespa-brisa/) |
| `kantu.webp` | Hoja de Roble Kantu | [Florensa Argentina](https://florensa.com.ar/sitio/producto/lechuga-hoja-de-roble-kantu/) |
| `granate.webp` | Hoja de Roble Granate | [Florensa Argentina](https://florensa.com.ar/sitio/producto/lechuga-hoja-de-roble-granate/) |
| `lilar.webp` | Lilar | [Rodeo Semillas](https://rodeosemillas.com/producto/lechuga-mantecosa-lila-mza/) |

## Hay que reemplazarlas

Son fotos prestadas y son fotos de catálogo: planta entera, en otra zona, con
otro manejo y en su punto comercial. Ninguna muestra la variedad como baby leaf,
que es como la vamos a cortar nosotros.

**En cuanto haya plantas propias, estas fotos se reemplazan por las del curso.**
Es mejor para el proyecto por tres razones: se ve la variedad en nuestras
condiciones, se ve en el estado en que la vamos a cosechar, y el material queda
enteramente nuestro.

Cómo reemplazar una:

1. Sacar la foto con luz pareja, la planta llenando el cuadro y algo que dé
   escala al lado (una regla, una mano).
2. Recortarla a 4:3 y guardarla como `.webp` de unos 800 × 600.
3. Pisar el archivo con el mismo nombre.
4. En `docs/datos/variedades.json`, cambiar `pie`, `credito` y borrar `url`.
5. Subir el número de `CACHE` en `docs/sw.js`, si no los teléfonos siguen
   mostrando la foto vieja.

## Fotos que faltan y convendría sacar

Una por variedad, en cada uno de estos momentos. Son las que hoy no existen en
ningún catálogo y son justamente las que sirven para enseñar:

- El plantín a los 20 días, para comparar vigor y uniformidad entre variedades.
- La hoja tierna al primer corte, que es el producto real.
- Las seis juntas, mezcladas, en la bolsa.
- La planta espigada y en flor.
- La cabezuela con el vilano blanco, en el punto de cosecha de semilla.
