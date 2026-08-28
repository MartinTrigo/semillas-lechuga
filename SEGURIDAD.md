# Seguridad y accesos

## El problema

La dirección del servicio de Apps Script está escrita en `docs/js/sincro.js`,
que se publica en GitHub y se descarga a cada celular. **Es pública y no hay
forma de que no lo sea.**

Sin nada más, cualquiera que la encontrara podría inventar mediciones que nunca
se hicieron o pisar la ficha de identidad de una variedad. En MonAgric se
comprobó ejecutándolo: no era teoría.

## Cómo se resuelve

Cada teléfono canjea **una vez** un código de invitación que le da el docente, y
recibe a cambio una credencial larga y al azar que queda guardada en ese
aparato. Desde ahí, cada envío viaja con ella.

Del lado del servicio se guarda **solo la huella SHA-256** de la credencial.
Alcanza para comprobarla, pero no permite reconstruirla: ni leyendo la planilla
de accesos se saca nada que sirva para entrar.

El código de invitación ya viene atado a una variedad. Eso resuelve dos cosas de
una: nadie puede cargar datos en la variedad de otro, y en la planilla queda
claro de quién es cada fila.

## Qué se puede hacer sin credencial

Una sola cosa: canjear un código de invitación. Nada más.

Un `GET` sin código devuelve que el servicio existe y la hora. No lista las
variedades, no lista los estudiantes, no devuelve un solo dato. Un `POST` sin
credencial válida no escribe una fila.

## Las dos planillas

Van separadas a propósito:

| Planilla | Qué tiene | Quién la abre |
|---|---|---|
| **Semillas · Registros** | Los datos del curso | El docente, y se puede compartir con los estudiantes |
| **Semillas · Accesos** | Códigos, dispositivos y huellas | **Solo el docente** |

Si los accesos estuvieran en la planilla de datos, cualquiera que la abriera
vería las huellas de todas las credenciales.

## Operación

### Dar de alta a alguien

Ejecutar `crearInvitaciones()` (los seis de una) o `crearInvitacion()` (uno
suelto, editando la variedad en la primera línea de la función). El código
aparece en la hoja *Invitaciones* y en el registro de ejecución.

Anotá en la columna *Para quién* a quién se lo diste.

### Dar de baja un teléfono

En la planilla *Semillas · Accesos*, hoja **Dispositivos**: poner **NO** en la
columna *Activo* de su fila. Desde el próximo envío, ese teléfono deja de poder
cargar. No afecta a nadie más y no borra lo que ya subió.

Es lo que hay que hacer si alguien pierde el celular o deja el curso.

### Reponer un acceso

Si alguien cambia de teléfono: darle de baja el viejo (arriba) y generarle un
código nuevo. El teléfono nuevo arranca vacío; lo que ya estaba en la planilla
sigue ahí.

**Lo que quedó sin enviar en el teléfono perdido, se pierde.** Es el costo de
que la app funcione sin señal. Por eso conviene enviar seguido.

### Ver quién está cargando

Hoja **Dispositivos**: cada fila tiene *Última actividad* y *Registros*, que
cuenta cuántos subió ese aparato. Sirve para darse cuenta de que a alguien se le
rompió algo antes de que lo diga.

## La clave de administración

`CLAVE_ADMIN` permite escribir sin credencial de dispositivo. Es la puerta de
servicio: sirve para corregir desde una planilla o un script propio.

- Se genera larga y al azar.
- **No se anota en el repositorio.** Va en `IDS.txt` (que no se publica) o en un
  gestor de contraseñas.
- Si se sospecha que se filtró, se cambia el valor de la propiedad en Apps
  Script y listo: no hay nada más que actualizar.

## Qué no protege esto

Vale ser explícito:

- **Un estudiante puede cargar datos falsos de su propia variedad.** Ninguna
  credencial impide eso. Lo que impide es que los cargue en la variedad de otro,
  y deja registrado desde qué teléfono salió cada fila.
- **El identificador de dispositivo se puede inventar.** Sirve para *detectar*
  cosas raras, no para impedirlas. La que impide es la credencial.
- **Quien tenga acceso a la planilla puede editarla a mano.** Es una planilla de
  Google: el control ahí es el de Drive, con quién la compartís.
