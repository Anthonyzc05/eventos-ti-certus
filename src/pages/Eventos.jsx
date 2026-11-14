import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { listarEventos, formatearFecha } from '../lib/eventos';
import Afiche from '../components/Afiche';
import { yaOcurrio } from '../lib/validacion';
import FechaBloque from '../components/FechaBloque';
import CompartirEvento from '../components/CompartirEvento';

const inicio = (e) => new Date(`${e.fecha}T${e.hora || '23:59'}`);

const MENSAJE_VACIO = {
  proximos: 'No hay eventos próximos.',
  pasados: 'Aún no hay eventos pasados.',
  borradores: 'No tienes borradores. Todos tus eventos están publicados.',
  todos: 'No hay eventos.',
};

// Cupos ocupados con barra; sin límite, solo el número de inscritos.
function Ocupacion({ evento: e }) {
  if (e.estado !== 'publicado') return <div className="evento__ocupacion" />;
  const n = e.inscritos ?? 0;
  if (!e.cupos) {
    return (
      <div className="evento__ocupacion">
        <strong>{n}</strong>
        <span>{n === 1 ? 'inscrito' : 'inscritos'}</span>
      </div>
    );
  }
  const pct = Math.min(100, Math.round((n / e.cupos) * 100));
  const nivel = pct >= 100 ? ' ocupacion__barra--lleno' : pct >= 80 ? ' ocupacion__barra--pocos' : '';
  return (
    <div className="evento__ocupacion">
      <strong>
        {n}
        <small> / {e.cupos}</small>
      </strong>
      <span>{pct >= 100 ? 'cupos agotados' : 'cupos ocupados'}</span>
      <div className={`ocupacion__barra${nivel}`} role="img" aria-label={`${n} de ${e.cupos} cupos ocupados`}>
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// CU4 · Listar eventos.
export default function Eventos() {
  const [eventos, setEventos] = useState(null); // null = cargando
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('proximos');
  const [compartir, setCompartir] = useState(null); // evento cuyo enlace y QR se muestran
  const { state } = useLocation();
  const navigate = useNavigate();
  const [aviso, setAviso] = useState(state?.aviso || '');

  const cargar = useCallback(async () => {
    setError('');
    setEventos(null);
    try {
      setEventos(await listarEventos());
    } catch (e) {
      console.error('Error al listar eventos:', e);
      setError(`No pudimos cargar los eventos. Revisa tu conexión e inténtalo de nuevo. (código: ${e.code || e.message})`);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // El aviso se muestra una vez y se limpia del historial.
  useEffect(() => {
    if (state?.aviso) navigate('/eventos', { replace: true, state: null });
  }, [state, navigate]);

  const grupos = useMemo(() => {
    const lista = eventos || [];
    const ahora = new Date();
    return {
      proximos: lista.filter((e) => inicio(e) >= ahora).sort((a, b) => inicio(a) - inicio(b)),
      pasados: lista.filter((e) => inicio(e) < ahora),
      borradores: lista.filter((e) => e.estado === 'borrador'),
      todos: lista,
    };
  }, [eventos]);

  const TILES = [
    { id: 'proximos', texto: 'Próximos', color: 'marino' },
    { id: 'pasados', texto: 'Pasados', color: 'turquesa' },
    { id: 'todos', texto: 'Todos', color: 'morado' },
    { id: 'borradores', texto: 'Borradores', color: 'rosa' },
  ];
  const visibles = grupos[filtro];

  return (
    <section>
      <header className="hero">
        <div className="hero__texto">
          <h1>Eventos</h1>
          <p>Registra una vez cada evento; con sus datos se generan el arte y los textos.</p>
          <Link to="/eventos/nuevo" className="boton-hero">
            + Nuevo evento
          </Link>
        </div>
        <Afiche variante="papel" className="hero__afiche hero__afiche--uno" />
        <Afiche variante="orquidea" className="hero__afiche hero__afiche--dos" />
      </header>

      <div className="resumen" role="group" aria-label="Filtrar eventos">
        {TILES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tile tile--${t.color}`}
            aria-pressed={filtro === t.id}
            onClick={() => setFiltro(t.id)}
          >
            <strong>{eventos ? grupos[t.id].length : '–'}</strong>
            <span>{t.texto}</span>
          </button>
        ))}
      </div>

      {aviso && (
        <p className="aviso aviso--ok" role="status">
          {aviso}
          <button type="button" onClick={() => setAviso('')} aria-label="Cerrar aviso">
            ×
          </button>
        </p>
      )}

      {error && (
        <div className="estado-vacio" role="alert">
          <p>{error}</p>
          <button type="button" className="boton-secundario" onClick={cargar}>
            Reintentar
          </button>
        </div>
      )}

      {!error && eventos === null && <p className="estado-carga">Cargando eventos…</p>}

      {!error && eventos && eventos.length === 0 && (
        <div className="estado-vacio">
          <h2>Aún no hay eventos</h2>
          <p>Crea el primero y quedará listo para generar su arte y sus textos.</p>
          <Link to="/eventos/nuevo" className="boton-primario">
            + Nuevo evento
          </Link>
        </div>
      )}

      {!error && eventos && eventos.length > 0 && visibles.length === 0 && (
        <div className="estado-vacio">
          <p>{MENSAJE_VACIO[filtro]}</p>
        </div>
      )}

      {visibles.length > 0 && (
        <ul className="eventos">
          {visibles.map((e) => (
            <li key={e.id} className={`evento${yaOcurrio(e) ? ' evento--pasado' : ''}`}>
              <FechaBloque fecha={e.fecha} modalidad={e.modalidad} />
              <div className="evento__datos">
                <div className="evento__titulo">
                  <h2>{e.titulo}</h2>
                  {yaOcurrio(e) ? (
                    <span className="chip chip--finalizado">Finalizado</span>
                  ) : (
                    <span className={`chip chip--${e.estado}`}>{e.estado === 'publicado' ? 'Publicado' : 'Borrador'}</span>
                  )}
                </div>
                <p>{formatearFecha(e.fecha, e.hora)}</p>
                <p className="evento__meta">
                  {e.expositor} · {e.modalidad} · {e.lugar}
                </p>
              </div>
              <Ocupacion evento={e} />
              <div className="evento__acciones">
                {e.estado === 'publicado' && !yaOcurrio(e) && (
                  <>
                    <Link to={`/eventos/${e.id}/difusion`} className="boton-primario boton-primario--chico">
                      Difusión
                    </Link>
                    <button type="button" className="boton-secundario boton-secundario--chico" onClick={() => setCompartir(e)}>
                      Compartir
                    </button>
                  </>
                )}
                {e.estado === 'publicado' && (
                  <Link to={`/eventos/${e.id}/participantes`} className="boton-secundario boton-secundario--chico">
                    Participantes
                  </Link>
                )}
                {!yaOcurrio(e) && (
                  <Link to={`/eventos/${e.id}/editar`} className="boton-secundario boton-secundario--chico">
                    Editar
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {compartir && <CompartirEvento evento={compartir} onCerrar={() => setCompartir(null)} />}
    </section>
  );
}