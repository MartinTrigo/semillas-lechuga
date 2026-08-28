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
3. Engranaje (**Configuración del proyecto**) → **Propiedades del script** →
   agregá tres:

   | Propiedad | Valor |
   |---|---|
   | `REGISTROS` | el id de *Semillas · Registros* |
   | `ACCESOS` | el id de *Semillas · Accesos* |
   | `CLAVE_ADMIN` | una clave larga y al azar, inventada por vos |

   La clave de administración **no se anota en el repositorio**. Va en `IDS.txt`
   o en tu gestor de contraseñas.

## 3. Preparar las hojas

En el editor, elegí la función `prepararPlanillas` y ejecutala. La primera vez
Google va a pedir permisos: son los de tu propia cuenta para escribir en tus
propias planillas.

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
por variedad, y los deja anotados en la hoja *Invitaciones* y en el registro de
ejecución (**Ver → Registros**).

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
