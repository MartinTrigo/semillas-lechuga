# Puesta en marcha

Se hace una sola vez, y la hace el docente. Toma unos veinte minutos.

Al terminar, anotá todos los identificadores en `IDS.txt`. **Ese archivo no se
publica**: está en el `.gitignore` a propósito.

---

## 1. La carpeta y las planillas en Drive

En tu Drive, creá:

```
Semillas de Lechuga — Datos/
├── Semillas · Registros      ← todos los datos del curso
└── Semillas · Accesos        ← quién puede cargar
```

Son dos planillas de Google vacías. No hace falta armarles ninguna hoja: eso lo
hace el script en el paso 3.

**Van separadas a propósito.** Si los accesos estuvieran en la misma planilla
que los datos, cualquiera que abriera la planilla del curso vería las huellas de
todas las credenciales.

Copiá el id de cada una. Está en la dirección, entre `/d/` y `/edit`:

```
https://docs.google.com/spreadsheets/d/1AbC…XyZ/edit
                                       └──── esto ────┘
```

## 2. El script

1. Abrí <https://script.google.com> y creá un proyecto nuevo.
   Nombre: `Semillas de Lechuga`.
2. Borrá el contenido de `Código.gs` y pegá entero
   [`apps-script/Code.gs`](apps-script/Code.gs) de este repositorio.
3. Cargar tres propiedades: `REGISTROS`, `ACCESOS` y `CLAVE_ADMIN`.

   Hay dos caminos. **El de abajo es el recomendado**, porque el de la pantalla
   de configuración tiene una trampa conocida.

   ### Camino A — desde el código *(recomendado)*

   En `Code.gs`, arriba de todo, está la función `cargarPropiedades()`. Pegá en
   sus dos primeras líneas las direcciones de las planillas —la dirección entera
   copiada de la barra del navegador, sin recortar nada—:

   ```js
   function cargarPropiedades() {
     var REGISTROS = "https://docs.google.com/spreadsheets/d/1AbC…/edit";
     var ACCESOS   = "https://docs.google.com/spreadsheets/d/1XyZ…/edit";
   ```

   Guardá el archivo, elegí `cargarPropiedades` en el desplegable de funciones y
   ejecutala. La clave de administración la genera sola, al azar, y la muestra
   una vez en el registro: **copiala y guardala ahí mismo**, en `IDS.txt` o en
   tu gestor de contraseñas.

   Después **volvé a dejar esas dos líneas vacías** (`var REGISTROS = "";`) y
   guardá. Las propiedades ya quedaron guardadas; no hace falta que las
   direcciones sigan en el código.

   ### Camino B — desde la pantalla de configuración

   Engranaje (**Configuración del proyecto**) → bajar hasta **Propiedades del
   script** → **Agregar propiedad de script**, tres veces, y después
   **apretar el botón «Guardar propiedades del script»**.

   > Ese botón está abajo del formulario y es fácil no verlo. Si no se aprieta,
   > las filas quedan escritas en la pantalla pero **no se guarda nada**, y el
   > script sigue sin ver ninguna propiedad. Es el error más común de todo este
   > instructivo.

   Los nombres distinguen mayúsculas: tiene que decir `ACCESOS`, no `Accesos`.
   En `REGISTROS` y `ACCESOS` podés pegar el id pelado o la dirección entera: el
   script recorta el id solo.

## 3. Revisar y preparar las hojas

Primero, en el editor, elegí la función **`revisarConfiguracion`** y ejecutala.
No toca nada: mira y cuenta en castellano qué encontró y qué falta. La primera
vez Google va a pedir permisos: son los de tu propia cuenta para escribir en tus
propias planillas.

La salida aparece en el panel **Registro de ejecución**, abajo del código, que
se abre solo al ejecutar. Vas a ver algo así:

```
Propiedades que ve el script: REGISTROS, ACCESOS, CLAVE_ADMIN

✓ REGISTROS: abre bien → Semillas - Registros  [hojas: Hoja 1]
✓ ACCESOS: abre bien → Semillas - Accesos  [hojas: Hoja 1]
✓ CLAVE_ADMIN: cargada (24 caracteres).

Todo en orden. Ya se puede ejecutar prepararPlanillas().
```

Si alguna línea tiene ✗, dice qué pasa y cómo se arregla. La primera línea es la
que más sirve: muestra los nombres de propiedad que el script ve de verdad.

Cuando esté todo en ✓, elegí `prepararPlanillas` y ejecutala.

Al terminar, las dos planillas quedan con todas sus hojas y encabezados. Es
idempotente: se puede volver a ejecutar sin romper nada.

## 4. Publicar el servicio

**Implementar** → **Nueva implementación** → tipo **Aplicación web**.

| Campo | Valor |
|---|---|
| Ejecutar como | **Yo** (tu cuenta) |
| Quién tiene acceso | **Cualquier persona** |

Copiá la URL que queda (termina en `/exec`) y pegala en
[`docs/js/sincro.js`](docs/js/sincro.js), en la constante `SERVICIO`:

```js
const SERVICIO = "https://script.google.com/macros/s/…/exec";
```

> **"Cualquier persona" suena mal y no lo es.** Significa que el servicio
> contesta sin pedir cuenta de Google, que es lo que necesitamos para que los
> estudiantes no tengan que iniciar sesión. Quien entre sin credencial no
> obtiene nada: `doPost` no escribe una sola fila sin credencial válida.
> Ver [SEGURIDAD.md](SEGURIDAD.md).

**Cada vez que cambies el código:** Implementar → Administrar implementaciones →
lápiz → **Nueva versión**. Si creás una implementación nueva en lugar de una
versión nueva, cambia la URL y hay que actualizar la app.

## 5. Los códigos de acceso

En el editor, ejecutá `crearInvitaciones()`. Saca los seis códigos de una, uno
por variedad, y los deja anotados en la hoja *Invitaciones* y en el panel
**Registro de ejecución**, abajo del código.

Anotá en la columna *Para quién* de esa hoja a qué estudiante le diste cada uno.

Cada código se usa **una sola vez, en un solo teléfono**. Si alguien cambia de
teléfono o pierde el suyo, se le genera uno nuevo con `crearInvitacion()`
(singular, editando la variedad en la primera línea de la función).

## 6. Publicar la app

En GitHub, en el repositorio:

**Settings** → **Pages** → Source: *Deploy from a branch* → rama `main`,
carpeta `/docs`.

Queda publicada en `https://<tu-usuario>.github.io/<repositorio>/`.

Ese enlace es todo lo que reciben los estudiantes. Al abrirlo, el navegador les
ofrece instalarla.

---

## Para publicar un cambio de la app

1. Editar el archivo.
2. **Si tocaste algo de `docs/`, subir el número de `CACHE` en `docs/sw.js`.**
   Si no, los teléfonos que ya la tienen instalada siguen mostrando la versión
   vieja.
3. `git push`. GitHub Pages se actualiza solo en un minuto.

## Para agregar una variable al seguimiento

1. Sumar el campo en la etapa que corresponda, en `docs/js/etapas.js`.
2. Sumar la columna en `apps-script/Code.gs`, en la misma etapa y con la misma
   clave. Las dos listas están escritas en el mismo orden para que se puedan
   leer en paralelo.
3. Subir `CACHE` en `docs/sw.js`.
4. En Apps Script: Implementar → Administrar implementaciones → Nueva versión.

Si la hoja de esa etapa todavía está vacía, el script rehace el encabezado solo.
Si ya tiene filas, la columna nueva hay que agregarla a mano en la planilla, en
la misma posición, para que las filas no queden corridas.
