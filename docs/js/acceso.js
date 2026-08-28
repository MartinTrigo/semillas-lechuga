// ==========================================================================
// Semillas de Lechuga — acceso del teléfono
//
// La dirección del servicio de la planilla va escrita en el código, que es
// público. Sin nada más, cualquiera que la encontrara podría inventar
// registros o borrar el seguimiento de una variedad entera. En MonAgric se
// comprobó ejecutándolo: no era teoría.
//
// Por eso cada teléfono canjea UNA VEZ un código que le da el docente, y
// recibe a cambio una credencial larga y al azar que queda guardada en ese
// aparato. Desde ahí, cada envío viaja con ella.
//
// El código de invitación ya viene atado a una variedad. Eso resuelve dos
// cosas de una: nadie carga datos en la variedad de otro por error, y en la
// planilla queda claro de quién es cada fila.
//
// Del lado del servicio se guarda solo la huella SHA-256 de la credencial:
// alcanza para comprobarla, pero no permite reconstruirla.
//
// Si un teléfono se pierde o alguien deja el curso, se lo da de baja en una
// fila de la planilla de accesos y deja de poder cargar, sin afectar a nadie.
// ==========================================================================

window.Acceso = (function () {
  const LS = {
    dispositivo: "semillas_dispositivo",
    credencial: "semillas_credencial",
    variedad: "semillas_variedad",
  };

  const leer = (clave) => {
    try { return localStorage.getItem(clave) || ""; } catch (e) { return ""; }
  };

  const escribir = (clave, valor) => {
    try { localStorage.setItem(clave, valor); } catch (e) { /* modo incógnito */ }
  };

  // Identificador de este teléfono. Se crea una sola vez y no cambia: sirve
  // para ver desde cuántos aparatos se está cargando y para dar de baja uno
  // solo. Se puede inventar, así que sirve para DETECTAR cosas raras, no para
  // impedirlas: la que impide es la credencial.
  function dispositivo() {
    let id = leer(LS.dispositivo);
    if (!id) {
      id = "d-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
      escribir(LS.dispositivo, id);
    }
    return id;
  }

  const credencial = () => leer(LS.credencial);
  const tieneAcceso = () => !!credencial();

  // La variedad asignada llega del servicio al canjear el código, no la elige
  // el estudiante: así no hay dos personas cargando en la misma.
  const variedad = () => leer(LS.variedad);

  function guardarAcceso(cred, variedadId) {
    escribir(LS.credencial, String(cred || ""));
    if (variedadId) escribir(LS.variedad, String(variedadId));
  }

  // Cuando el servicio contesta que este teléfono ya no tiene permiso, se borra
  // la credencial pero NUNCA la cola de registros: lo que se cargó en el campo
  // no se pierde por un problema de acceso.
  const borrarCredencial = () => escribir(LS.credencial, "");

  // Lo que acompaña a cada pedido para identificarse.
  const identificacion = () => ({
    variedad: variedad(),
    credencial: credencial(),
    dispositivo: dispositivo(),
  });

  return {
    dispositivo, credencial, tieneAcceso, variedad,
    guardarAcceso, borrarCredencial, identificacion,
  };
})();
