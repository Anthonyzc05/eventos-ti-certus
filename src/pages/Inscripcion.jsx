import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { DOMINIO_PERMITIDO } from '../firebase';
import { formatearFecha, inscribirse, obtenerEvento } from '../lib/eventos';
import { yaOcurrio } from '../lib/validacion';
import FechaBloque from '../components/FechaBloque';
import IconoGoogle from '../components/IconoGoogle';
import logoCertus from '../assets/certus-logo.png';

const LIMITES = { nombre: [3, 120], programa: [3, 100] };

function validar({ nombre, programa }) {
  const errores = {};
  const n = nombre.trim();
  const p = programa.trim();
  if (!n) errores.nombre = 'Escribe tu nombre completo.';
  else if (n.length < LIMITES.nombre[0]) errores.nombre = `Escribe al menos ${LIMITES.nombre[0]} caracteres.`;
  else if (n.length > LIMITES.nombre[1]) errores.nombre = `No puede pasar de ${LIMITES.nombre[1]} caracteres.`;
  if (!p) errores.programa = 'Escribe tu carrera o programa.';
  else if (p.length < LIMITES.programa[0]) errores.programa = `Escribe al menos ${LIMITES.programa[0]} caracteres.`;
  else if (p.length > LIMITES.programa[1]) errores.programa = `No puede pasar de ${LIMITES.programa[1]} caracteres.`;
  return errores;
}

// CU7 · Inscribir asistente al evento. Página pública: /inscripcion/:id
export default function Inscripcion() {
  const { id } = useParams();
  const { usuario, cargando, error, iniciarConGoogle, cerrarSesion } = useAuth();

  const [evento, setEvento] = useState(undefined); // undefined = cargando, null = no disponible
  const [abriendo, setAbriendo] = useState(false);
  const [valores, setValores] = useState({ nombre: '', programa: '' });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [hecho, setHecho] = useState(false);

  useEffect(() => {
    let vigente = true;
    obtenerEvento(id)
      .then((e) => vigente && setEvento(e))
      // Un borrador, un evento inexistente o un enlace mal copiado terminan igual: no disponible.
      .catch(() => vigente && setEvento(null));
    return () => {
      vigente = false;
    };
  }, [id]);

  // Al iniciar sesión se sugiere el nombre de la cuenta de Google.
  useEffect(() => {
    if (usuario && usuario.nombre !== usuario.correo) {
      setValores((v) => (v.nombre ? v : { ...v, nombre: usuario.nombre }));
    }
  }, [usuario]);

  async function alContinuar() {
    setAbriendo(true);
    await iniciarConGoogle();
    setAbriendo(false);
  }

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((v) => ({ ...v, [name]: value }));
    if (errores[name]) setErrores((er) => ({ ...er, [name]: undefined }));
  }

  async function enviar(e) {
    e.preventDefault();
    setErrorEnvio('');
    const encontrados = validar(valores);
    setErrores(encontrados);
    const primero = Object.keys(encontrados)[0];
    if (primero) {
      document.getElementById(`insc-${primero}`)?.focus();
      return;
    }
    setEnviando(true);
    try {
      await inscribirse(id, { nombre: valores.nombre, correo: usuario.correo, programa: valores.programa });
      setHecho(true);
    } catch (err) {
      console.error('Error al inscribirse:', err);
      setErrorEnvio(
        err.code === 'permission-denied'
          ? 'No pudimos completar la inscripción. Es posible que ya estés inscrito en este evento.'
          : `No pudimos completar la inscripción. Revisa tu conexión e inténtalo de nuevo. (código: ${err.code || err.message})`,
      );
    } finally {
      setEnviando(false);
    }
  }

  let cuerpo;
  if (evento === undefined || cargando) {
    cuerpo = <p className="estado-carga">Cargando evento…</p>;
  } else if (evento === null) {
    cuerpo = (
      <div className="estado-vacio">
        <h1>Este evento no está disponible</h1>
        <p>El enlace puede estar incompleto o el evento aún no se publicó. Pide el enlace actualizado a quien te lo compartió.</p>
      </div>
    );
  } else {
    const finalizado = yaOcurrio(evento);
    cuerpo = (
      <>
        <article className="detalle">
          <FechaBloque fecha={evento.fecha} modalidad={evento.modalidad} />
          <div className="detalle__datos">
            <h1>{evento.titulo}</h1>
            <p className="detalle__cuando">{formatearFecha(evento.fecha, evento.hora)}</p>
            <p>
              {evento.modalidad} · {evento.lugar}
            </p>
            <p>Expositor: {evento.expositor}</p>
          </div>
          <p className="detalle__descripcion">{evento.descripcion}</p>
        </article>

        <section className="inscripcion" aria-live="polite">
          {finalizado ? (
            <p className="aviso aviso--error">Este evento ya finalizó. Las inscripciones están cerradas.</p>
          ) : hecho ? (
            <div className="exito">
              <span className="exito__icono" aria-hidden="true">
                ✓
              </span>
              <h2>¡Quedaste inscrito!</h2>
              <p>
                <strong>Te esperamos el {formatearFecha(evento.fecha, evento.hora)}</strong>
              </p>
              <p>
                Guardamos tu inscripción con el correo {usuario.correo}; no necesitas hacer nada más.
              </p>
            </div>
          ) : !usuario ? (
            <div className="inscripcion__acceso">
              <h2>Inscríbete</h2>
              <p>Inicia sesión con tu cuenta institucional para inscribirte.</p>
              <button type="button" className="boton-google" onClick={alContinuar} disabled={abriendo}>
                <IconoGoogle />
                {abriendo ? 'Abriendo Google…' : 'Continuar con Google'}
              </button>
              {error && (
                <p className="login__error" role="alert">
                  {error}
                </p>
              )}
              <p className="login__ayuda">Usa tu correo @{DOMINIO_PERMITIDO}. Las cuentas personales no pueden inscribirse.</p>
            </div>
          ) : (
            <form className="inscripcion__form" onSubmit={enviar} noValidate>
              <h2>Tus datos</h2>
              <p className="inscripcion__sesion">
                Inscribiéndote como <strong>{usuario.correo}</strong>.{' '}
                <button type="button" className="enlace" onClick={cerrarSesion}>
                  Usar otra cuenta
                </button>
              </p>

              <div className={`campo${errores.nombre ? ' campo--error' : ''}`}>
                <label htmlFor="insc-nombre">Nombre completo</label>
                <input
                  id="insc-nombre"
                  name="nombre"
                  type="text"
                  value={valores.nombre}
                  onChange={cambiar}
                  aria-invalid={errores.nombre ? 'true' : undefined}
                  aria-describedby={errores.nombre ? 'insc-nombre-error' : undefined}
                />
                {errores.nombre && (
                  <small id="insc-nombre-error" className="campo__error" role="alert">
                    {errores.nombre}
                  </small>
                )}
              </div>

              <div className={`campo${errores.programa ? ' campo--error' : ''}`}>
                <label htmlFor="insc-programa">Carrera o programa</label>
                <input
                  id="insc-programa"
                  name="programa"
                  type="text"
                  placeholder="Ej. Arquitectura de Sistemas de Información"
                  value={valores.programa}
                  onChange={cambiar}
                  aria-invalid={errores.programa ? 'true' : undefined}
                  aria-describedby={errores.programa ? 'insc-programa-error' : undefined}
                />
                {errores.programa && (
                  <small id="insc-programa-error" className="campo__error" role="alert">
                    {errores.programa}
                  </small>
                )}
              </div>

              {errorEnvio && (
                <p className="aviso aviso--error" role="alert">
                  {errorEnvio}
                </p>
              )}

              <button type="submit" className="boton-primario" disabled={enviando}>
                {enviando ? 'Inscribiendo…' : 'Inscribirme'}
              </button>
            </form>
          )}
        </section>
      </>
    );
  }

  return (
    <div className="publico">
      <header className="publico__cabecera">
        <img src={logoCertus} alt="CERTUS" className="panel__certus" />
        <div className="panel__nombre">
          <strong>Tech-Events</strong>
          <span>Área de TI</span>
        </div>
      </header>
      <main className="publico__contenido">{cuerpo}</main>
    </div>
  );
}