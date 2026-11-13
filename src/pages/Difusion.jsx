import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerEvento, formatearFecha } from '../lib/eventos';
import { yaOcurrio } from '../lib/validacion';
import GeneradorArte from '../components/GeneradorArte';
import GeneradorTextos from '../components/GeneradorTextos';
import CompartirEvento from '../components/CompartirEvento';

// Difusión de un evento: arte (CU5) y textos para redes (CU6).
export default function Difusion() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [error, setError] = useState('');
  const [pestana, setPestana] = useState('arte');
  const [compartir, setCompartir] = useState(false);

  useEffect(() => {
    let activo = true;
    obtenerEvento(id)
      .then((e) => {
        if (!activo) return;
        if (!e) setError('No encontramos este evento.');
        else if (e.estado !== 'publicado') setError('Publica el evento para generar su arte y sus textos: el enlace de inscripción solo funciona en eventos publicados.');
        else if (yaOcurrio(e)) setError('Este evento ya finalizó, por eso no se genera su difusión.');
        else setEvento(e);
      })
      .catch((err) => {
        console.error('Error al cargar el evento:', err);
        if (activo) setError(`No pudimos cargar el evento. Inténtalo de nuevo. (código: ${err.code || err.message})`);
      });
    return () => {
      activo = false;
    };
  }, [id]);

  return (
    <section className="difusion">
      <Link to="/eventos" className="volver">
        ← Volver a eventos
      </Link>

      {error && (
        <div className="estado-vacio" role="alert">
          <p>{error}</p>
          <Link to="/eventos" className="boton-secundario">
            Ir a eventos
          </Link>
        </div>
      )}

      {!error && !evento && <p className="estado-carga">Cargando evento…</p>}

      {evento && (
        <>
          <header className="participantes__cabecera">
            <div>
              <h1>{evento.titulo}</h1>
              <p>{formatearFecha(evento.fecha, evento.hora)}</p>
            </div>
            <button type="button" className="boton-secundario" onClick={() => setCompartir(true)}>
              Enlace y QR
            </button>
          </header>

          <div className="pestanas" role="tablist" aria-label="Difusión del evento">
            {[
              ['arte', 'Arte para redes'],
              ['textos', 'Textos para redes'],
            ].map(([k, nombre]) => (
              <button
                key={k}
                type="button"
                role="tab"
                id={`tab-${k}`}
                aria-selected={pestana === k}
                aria-controls={`panel-${k}`}
                className="pestana"
                onClick={() => setPestana(k)}
              >
                {nombre}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`tab-${pestana}`}>
            {pestana === 'arte' ? <GeneradorArte evento={evento} /> : <GeneradorTextos evento={evento} />}
          </div>

          {compartir && <CompartirEvento evento={evento} onCerrar={() => setCompartir(false)} />}
        </>
      )}
    </section>
  );
}