import { useEffect, useState } from 'react';
import { urlInscripcion } from '../lib/eventos';
import { generarTextos, REDES, TONOS } from '../lib/textos';

async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const t = document.createElement('textarea');
    t.value = texto;
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    t.remove();
    return ok;
  }
}

// CU6 · Textos listos para copiar y pegar en cada red.
export default function GeneradorTextos({ evento }) {
  const url = urlInscripcion(evento.id);
  const [tono, setTono] = useState('cercano');
  const [textos, setTextos] = useState(() => generarTextos(evento, url, 'cercano'));
  const [copiado, setCopiado] = useState('');
  const [falloCopia, setFalloCopia] = useState('');

  useEffect(() => {
    setTextos(generarTextos(evento, url, tono));
  }, [evento, url, tono]);

  async function copiar(id) {
    const ok = await copiarAlPortapapeles(textos[id]);
    setFalloCopia(ok ? '' : id);
    setCopiado(ok ? id : '');
    if (ok) setTimeout(() => setCopiado((c) => (c === id ? '' : c)), 2000);
  }

  return (
    <div className="textos">
      <div className="textos__barra">
        <div className="textos__tono" role="group" aria-label="Tono del texto">
          {Object.entries(TONOS).map(([id, nombre]) => (
            <button key={id} type="button" className="opcion" aria-pressed={tono === id} onClick={() => setTono(id)}>
              {nombre}
            </button>
          ))}
        </div>
        <p className="arte__ayuda">Puedes editar cada texto antes de copiarlo. Si cambias el tono, se vuelve a generar.</p>
      </div>

      <div className="textos__lista">
        {REDES.map((r) => (
          <article key={r.id} className="texto-red">
            <header>
              <h3>
                <span className="texto-red__punto" style={{ background: r.color }} />
                {r.nombre}
              </h3>
              <span className="texto-red__cuenta">
                {textos[r.id].length} caracteres{r.limite ? ` de ${r.limite}` : ''}
              </span>
            </header>
            <label className="visualmente-oculto" htmlFor={`texto-${r.id}`}>
              Texto para {r.nombre}
            </label>
            <textarea
              id={`texto-${r.id}`}
              value={textos[r.id]}
              onChange={(e) => setTextos((t) => ({ ...t, [r.id]: e.target.value }))}
              rows={14}
            />
            <div className="texto-red__acciones">
              <button type="button" className="boton-secundario boton-secundario--chico" onClick={() => copiar(r.id)}>
                {copiado === r.id ? '¡Copiado!' : 'Copiar texto'}
              </button>
              {falloCopia === r.id && <span className="texto-red__error">No pudimos copiar; selecciona el texto y usa Ctrl+C.</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}