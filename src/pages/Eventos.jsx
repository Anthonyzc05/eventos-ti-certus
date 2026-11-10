import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { listarEventos, formatearFecha } from '../lib/eventos';
import { hoyISO } from '../lib/validacion';

const FILTROS = [
  { id: 'proximos', texto: 'Próximos' },
  { id: 'pasados', texto: 'Pasados' },
  { id: 'todos', texto: 'Todos' },
];

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function FechaBloque({ fecha }) {
  const [, m, d] = fecha.split('-').map(Number);
  return (
    <div className="evento__fecha" aria-hidden="true">
      <strong>{d}</strong>
      <span>{MESES[m - 1]}</span>
    </div>
  );
}

// CU4 · Listar eventos.
export default function Eventos() {
  const [eventos, setEventos] = useState(null); // null = cargando
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('proximos');
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

  // El aviso "Evento guardado" se muestra una vez y se limpia del historial.
  useEffect(() => {
    if (state?.aviso) navigate('/eventos', { replace: true, state: null });
  }, [state, navigate]);

    const visibles = useMemo(() => {
    if (!eventos) return [];
    const ahora = new Date();
    // Un evento es "pasado" cuando su fecha y hora de inicio ya ocurrieron.
    const inicio = (e) => new Date(`${e.fecha}T${e.hora || '23:59'}`);
    if (filtro === 'proximos') {
      return eventos.filter((e) => inicio(e) >= ahora).sort((a, b) => inicio(a) - inicio(b));
    }
    if (filtro === 'pasados') return eventos.filter((e) => inicio(e) < ahora);
    return eventos;
  }, [eventos, filtro]);

  return (
    <section>
      <div className="pagina__titulo">
        <div>
          <h1>Eventos</h1>
          <p>Registra una vez cada evento; con sus datos se generan el arte y los textos.</p>
        </div>
        <Link to="/eventos/nuevo" className="boton-primario">
          + Nuevo evento
        </Link>
      </div>

      {aviso && (
        <p className="aviso aviso--ok" role="status">
          {aviso}
          <button type="button" onClick={() => setAviso('')} aria-label="Cerrar aviso">
            ×
          </button>
        </p>
      )}

      <div className="filtros" role="tablist" aria-label="Filtrar eventos">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filtro === f.id}
            className={filtro === f.id ? 'activo' : undefined}
            onClick={() => setFiltro(f.id)}
          >
            {f.texto}
          </button>
        ))}
      </div>

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
          <p>No hay eventos {filtro === 'proximos' ? 'próximos' : 'pasados'}.</p>
        </div>
      )}

      {visibles.length > 0 && (
        <ul className="eventos">
          {visibles.map((e) => (
            <li key={e.id} className="evento">
              <FechaBloque fecha={e.fecha} />
              <div className="evento__datos">
                <h2>{e.titulo}</h2>
                <p>{formatearFecha(e.fecha, e.hora)}</p>
                <p className="evento__meta">
                  {e.expositor} · {e.modalidad} · {e.lugar}
                </p>
              </div>
              <span className={`chip chip--${e.estado}`}>{e.estado === 'publicado' ? 'Publicado' : 'Borrador'}</span>
              <Link to={`/eventos/${e.id}/editar`} className="boton-secundario boton-secundario--chico">
                Editar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}