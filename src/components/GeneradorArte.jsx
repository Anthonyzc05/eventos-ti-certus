import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { urlInscripcion } from '../lib/eventos';
import { dibujarArte, FORMATOS, PLANTILLAS } from '../lib/arte';

const slug = (t) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

// CU5 · Generar el arte del evento y descargarlo en PNG.
export default function GeneradorArte({ evento }) {
  const [plantilla, setPlantilla] = useState('marino');
  const [formato, setFormato] = useState('cuadrado');
  const [conQr, setConQr] = useState(true);
  const [error, setError] = useState('');
  const lienzo = useRef(null);
  const qrRef = useRef(null);
  const url = urlInscripcion(evento.id);

  useEffect(() => {
    let vigente = true;
    setError('');
    dibujarArte(lienzo.current, {
      evento,
      plantilla,
      formato,
      qr: conQr ? qrRef.current : null,
      url,
    }).catch((e) => {
      console.error('Error al dibujar el arte:', e);
      if (vigente) setError('No pudimos generar el arte. Recarga la página e inténtalo de nuevo.');
    });
    return () => {
      vigente = false;
    };
  }, [evento, plantilla, formato, conQr, url]);

  function descargar() {
    lienzo.current.toBlob((blob) => {
      if (!blob) return setError('No pudimos crear la imagen. Inténtalo de nuevo.');
      const enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(blob);
      enlace.download = `arte-${slug(evento.titulo) || 'evento'}-${formato}.png`;
      enlace.click();
      setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
    }, 'image/png');
  }

  return (
    <div className="arte">
      <div className="arte__controles">
        <fieldset>
          <legend>Plantilla</legend>
          <div className="opciones">
            {Object.entries(PLANTILLAS).map(([id, p]) => (
              <button
                key={id}
                type="button"
                className="opcion"
                aria-pressed={plantilla === id}
                onClick={() => setPlantilla(id)}
              >
                <span className="opcion__muestra" style={{ background: p.fondo, borderColor: p.forma }} />
                {p.nombre}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Formato</legend>
          <div className="opciones opciones--columna">
            {Object.entries(FORMATOS).map(([id, f]) => (
              <button
                key={id}
                type="button"
                className="opcion opcion--formato"
                aria-pressed={formato === id}
                onClick={() => setFormato(id)}
              >
                <strong>{f.nombre}</strong>
                <span>
                  {f.uso} · {f.ancho}×{f.alto}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="casilla">
          <input type="checkbox" checked={conQr} onChange={(e) => setConQr(e.target.checked)} />
          Incluir el QR de inscripción
        </label>

        <button type="button" className="boton-primario" onClick={descargar} disabled={!!error}>
          Descargar PNG
        </button>
        <p className="arte__ayuda">
          El arte se arma con los datos del evento. Si cambias el evento, vuelve a descargarlo.
        </p>
        {error && (
          <p className="login__error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="arte__vista">
        <canvas ref={lienzo} className="arte__canvas" aria-label={`Vista previa del arte de ${evento.titulo}`} />
      </div>

      {/* El QR se dibuja aquí (oculto) y luego se copia al arte */}
      <div className="qr-oculto" aria-hidden="true">
        <QRCodeCanvas ref={qrRef} value={url} size={512} marginSize={0} level="M" />
      </div>
    </div>
  );
}