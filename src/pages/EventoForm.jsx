import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { actualizarEvento, crearEvento, MODALIDADES, obtenerEvento } from '../lib/eventos';
import { EVENTO_VACIO, LIMITES, hoyISO, limpiarEvento, validarEvento, yaOcurrio } from '../lib/validacion';

function Campo({ id, etiqueta, error, ayuda, children }) {
  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda && !error && <small>{ayuda}</small>}
      {error && (
        <small id={`${id}-error`} className="campo__error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

// CU2 · Crear evento (/eventos/nuevo) y CU3 · Editar evento (/eventos/:id/editar).
export default function EventoForm() {
  const { id } = useParams();
  const esNuevo = !id;
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [valores, setValores] = useState(EVENTO_VACIO);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(!esNuevo);
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    if (esNuevo) return;
    let vigente = true;
    (async () => {
      try {
        const evento = await obtenerEvento(id);
        if (!vigente) return;
        if (!evento) setErrorGeneral('No encontramos este evento. Puede que se haya eliminado.');
        else if (yaOcurrio(evento)) setErrorGeneral('Este evento ya finalizó, por eso no se puede editar.');
        else setValores({ ...EVENTO_VACIO, ...evento });
      } catch (e) {
        console.error('Error al cargar el evento:', e);
        if (vigente) setErrorGeneral(`No pudimos cargar el evento. (código: ${e.code || e.message})`);
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => {
      vigente = false;
    };
  }, [id, esNuevo]);

  function cambiar(e) {
    const { name, value } = e.target;
    setValores((v) => ({ ...v, [name]: value }));
    if (errores[name]) setErrores((er) => ({ ...er, [name]: undefined }));
  }

  async function guardar(e) {
    e.preventDefault();
    setErrorGeneral('');
    const encontrados = validarEvento(valores, { esNuevo });
    setErrores(encontrados);
    const primero = Object.keys(encontrados)[0];
    if (primero) {
      document.getElementById(`campo-${primero}`)?.focus();
      return;
    }

    setGuardando(true);
    try {
      const datos = limpiarEvento(valores);
      if (esNuevo) await crearEvento(datos, usuario.uid);
      else await actualizarEvento(id, datos);
      navigate('/eventos', { state: { aviso: esNuevo ? 'Evento creado.' : 'Cambios guardados.' } });
    } catch (err) {
      console.error('Error al guardar el evento:', err);
      setErrorGeneral(`No pudimos guardar el evento. Inténtalo de nuevo. (código: ${err.code || err.message})`);
      setGuardando(false);
    }
  }

  if (cargando) return <p className="estado-carga">Cargando evento…</p>;

  const props = (campo) => ({
    id: `campo-${campo}`,
    name: campo,
    value: valores[campo] ?? '',
    onChange: cambiar,
    'aria-invalid': errores[campo] ? 'true' : undefined,
    'aria-describedby': errores[campo] ? `campo-${campo}-error` : undefined,
  });

  // Si no se pudo cargar el evento a editar, no mostramos el formulario vacío.
  if (!esNuevo && errorGeneral && !valores.titulo) {
    return (
      <section>
        <div className="estado-vacio" role="alert">
          <p>{errorGeneral}</p>
          <Link to="/eventos" className="boton-secundario">
            Volver a eventos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="formulario-pagina">
      <Link to="/eventos" className="volver">
        ← Volver a eventos
      </Link>
      <div className="pagina__titulo">
        <div>
          <h1>{esNuevo ? 'Nuevo evento' : 'Editar evento'}</h1>
          <p>Todos los campos son obligatorios.</p>
        </div>
      </div>

      <form className="formulario" onSubmit={guardar} noValidate>
        <Campo id="campo-titulo" etiqueta="Título" error={errores.titulo}>
          <input type="text" maxLength={LIMITES.titulo[1] + 20} placeholder="Ej. Taller de React desde cero" {...props('titulo')} id="campo-titulo" />
        </Campo>

        <div className="formulario__fila">
          <Campo id="campo-fecha" etiqueta="Fecha" error={errores.fecha}>
            <input type="date" min={esNuevo ? hoyISO() : undefined} {...props('fecha')} id="campo-fecha" />
          </Campo>
          <Campo id="campo-hora" etiqueta="Hora de inicio" error={errores.hora}>
            <input type="time" {...props('hora')} id="campo-hora" />
          </Campo>
        </div>

        <div className="formulario__fila">
          <Campo id="campo-modalidad" etiqueta="Modalidad" error={errores.modalidad}>
            <select {...props('modalidad')} id="campo-modalidad">
              {MODALIDADES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Campo>
          <Campo id="campo-lugar" etiqueta="Lugar o enlace" error={errores.lugar}>
            <input type="text" placeholder="Aula 301 o enlace de Meet" {...props('lugar')} id="campo-lugar" />
          </Campo>
        </div>

        <Campo id="campo-expositor" etiqueta="Expositor" error={errores.expositor}>
          <input type="text" placeholder="Nombre de quien dicta el evento" {...props('expositor')} id="campo-expositor" />
        </Campo>

        <Campo
          id="campo-descripcion"
          etiqueta="Descripción"
          error={errores.descripcion}
          ayuda={`${(valores.descripcion || '').length} / ${LIMITES.descripcion[1]} caracteres`}
        >
          <textarea rows={5} placeholder="¿De qué trata y qué se llevarán los asistentes?" {...props('descripcion')} id="campo-descripcion" />
        </Campo>

        <Campo
          id="campo-estado"
          etiqueta="Estado"
          error={errores.estado}
          ayuda="Un borrador lo ven solo los administradores. Al publicarlo, los alumnos podrán inscribirse con su enlace."
        >
          <select {...props('estado')} id="campo-estado">
            <option value="borrador">Borrador</option>
            <option value="publicado">Publicado</option>
          </select>
        </Campo>

        {errorGeneral && (
          <p className="aviso aviso--error" role="alert">
            {errorGeneral}
          </p>
        )}

        <div className="formulario__acciones">
          <button type="submit" className="boton-primario" disabled={guardando}>
            {guardando ? 'Guardando…' : esNuevo ? 'Crear evento' : 'Guardar cambios'}
          </button>
          <Link to="/eventos" className="boton-secundario">
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}