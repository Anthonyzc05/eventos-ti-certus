import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { DOMINIO_PERMITIDO } from '../firebase';
import Afiche from '../components/Afiche';

function IconoGoogle() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function Login() {
  const { usuario, cargando, error, iniciarConGoogle } = useAuth();
  const [enviando, setEnviando] = useState(false);

  if (!cargando && usuario) return <Navigate to="/eventos" replace />;

  async function alContinuar() {
    setEnviando(true);
    await iniciarConGoogle();
    setEnviando(false);
  }

  return (
    <main className="login">
      <section className="login__marca">
        <div className="login__logo">
          <strong>Tech-Events</strong>
          <span>CERTUS · Área de TI</span>
        </div>
        <h1>Un evento, registrado una sola vez.</h1>
        <p>Con los mismos datos salen el arte y los textos para WhatsApp, LinkedIn y Facebook.</p>
        <Afiche variante="papel" className="login__afiche login__afiche--uno" />
        <Afiche variante="orquidea" className="login__afiche login__afiche--dos" />
      </section>

      <section className="login__acceso">
        <div className="login__form">
          <h2>Ingresar</h2>
          <p>Acceso solo para el personal del área de TI de CERTUS.</p>

          <button type="button" className="boton-google" onClick={alContinuar} disabled={enviando || cargando}>
            <IconoGoogle />
            {enviando ? 'Abriendo Google…' : 'Continuar con Google'}
          </button>

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <p className="login__ayuda">
            Usa tu correo @{DOMINIO_PERMITIDO}. Las cuentas personales no tienen acceso.
          </p>
        </div>
      </section>
    </main>
  );
}
