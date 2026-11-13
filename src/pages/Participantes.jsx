import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerEvento, listarInscritos, formatearFecha, descargarCSV } from '../lib/eventos';

// Evita que Excel interprete un texto como fórmula (=, +, -, @).
const seguro = (v) => (/^[=+\-@\t\r]/.test(String(v ?? '')) ? `'${v}` : v ?? '');

const hora = (ts) =>
  ts?.toDate
    ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(ts.toDate())
    : '';

const slug = (t) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

// CU8 · Ver participantes de un evento y exportarlos.
export default function Participantes() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [inscritos, setInscritos] = useState(null); // null = cargando
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const [e, lista] = await Promise.all([obtenerEvento(id), listarInscritos(id)]);
        if (!activo) return;
        if (!e) return setError('No encontramos este evento.');
        setEvento(e);
        setInscritos(lista);
      } catch (err) {
        console.error('Error al cargar participantes:', err);
        if (activo) setError(`No pudimos cargar los participantes. Inténtalo de nuevo. (código: ${err.code || err.message})`);
      }
    })();
    return () => {
      activo = false;
    };
  }, [id]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q || !inscritos) return inscritos || [];
    return inscritos.filter((i) => `${i.nombre} ${i.correo} ${i.programa}`.toLowerCase().includes(q));
  }, [inscritos, busqueda]);

  function exportar() {
    const filas = [
      ['N.º', 'Nombre', 'Correo', 'Programa', 'Fecha de inscripción'],
      ...inscritos.map((i, n) => [n + 1, seguro(i.nombre), i.correo, seguro(i.programa), hora(i.creadoEn)]),
    ];
    descargarCSV(`participantes-${slug(evento.titulo) || 'evento'}.csv`, filas);
  }

  return (
    <section className="participantes">
      <Link to="/eventos" className="volver">
        ← Volver a eventos
      </Link>

      {error && (
        <div className="estado-vacio" role="alert">
          <p>{error}</p>
        </div>
      )}

      {!error && !inscritos && <p className="estado-carga">Cargando participantes…</p>}

      {!error && evento && inscritos && (
        <>
          <header className="participantes__cabecera">
            <div>
              <h1>{evento.titulo}</h1>
              <p>{formatearFecha(evento.fecha, evento.hora)}</p>
              <p className="participantes__total">
                <strong>{inscritos.length}</strong> {inscritos.length === 1 ? 'inscrito' : 'inscritos'}
              </p>
            </div>
            <button type="button" className="boton-primario" onClick={exportar} disabled={inscritos.length === 0}>
              Exportar a Excel (CSV)
            </button>
          </header>

          {inscritos.length === 0 ? (
            <div className="estado-vacio">
              <h2>Aún no hay inscritos</h2>
              <p>Comparte el enlace o el QR del evento para que los alumnos se inscriban.</p>
            </div>
          ) : (
            <>
              <label className="participantes__buscar">
                <span className="visualmente-oculto">Buscar participante</span>
                <input
                  type="search"
                  placeholder="Buscar por nombre, correo o programa"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </label>

              {visibles.length === 0 ? (
                <div className="estado-vacio">
                  <p>Ningún participante coincide con la búsqueda.</p>
                </div>
              ) : (
                <div className="tabla-scroll">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>N.º</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Programa</th>
                        <th>Inscrito el</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibles.map((i) => (
                        <tr key={i.id}>
                          <td>{inscritos.indexOf(i) + 1}</td>
                          <td>{i.nombre}</td>
                          <td>{i.correo}</td>
                          <td>{i.programa}</td>
                          <td>{hora(i.creadoEn)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}