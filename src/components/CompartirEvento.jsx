import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { urlInscripcion } from '../lib/eventos';

function nombreArchivo(titulo) {
  const limpio = titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `qr-${limpio || 'evento'}.png`;
}

// Ventana para compartir un evento publicado: enlace de inscripción y código QR.
export default function CompartirEvento({ evento, onCerrar }) {
  const url = urlInscripcion(evento.id);
  const qrRef = useRef(null);
  const inputRef = useRef(null);
  const cerrarRef = useRef(null);
  const cerrarAlTeclear = useRef(onCerrar);
  const [copiado, setCopiado] = useState(false);

  cerrarAlTeclear.current = onCerrar;

  useEffect(() => {
    cerrarRef.current?.focus();
    const alTeclear = (e) => {
      if (e.key === 'Escape') cerrarAlTeclear.current();
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, []);

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Respaldo para navegadores sin permiso de portapapeles.
      inputRef.current?.select();
      document.execCommand('copy');
    }
    setCopiado(true);
  }

  function descargarQR() {
    const canvas = qrRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = nombreArchivo(evento.titulo);
    a.click();
  }

  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="compartir-titulo">
        <div className="modal__cabecera">
          <div>
            <h2 id="compartir-titulo">Compartir evento</h2>
            <p>{evento.titulo}</p>
          </div>
          <button ref={cerrarRef} type="button" className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="modal__qr">
          <QRCodeCanvas
            ref={qrRef}
            value={url}
            size={512}
            marginSize={2}
            level="M"
            style={{ width: 220, height: 220 }}
            title={`Código QR para inscribirse a ${evento.titulo}`}
          />
        </div>

        <p className="modal__nota">
          Los alumnos escanean el QR o abren el enlace, inician sesión con su cuenta @certus.edu.pe y se inscriben.
        </p>

        <div className="modal__enlace">
          <input
            ref={inputRef}
            readOnly
            value={url}
            aria-label="Enlace de inscripción"
            onFocus={(e) => e.target.select()}
          />
          <button type="button" className="boton-primario" onClick={copiar}>
            {copiado ? '¡Copiado!' : 'Copiar enlace'}
          </button>
        </div>

        <button type="button" className="boton-secundario" onClick={descargarQR}>
          Descargar QR
        </button>
      </div>
    </div>
  );
}