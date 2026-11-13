import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { DOMINIO_PERMITIDO } from '../firebase';
import Afiche from '../components/Afiche';
import logoCertus from '../assets/certus-logo.png';
import IconoGoogle from '../components/IconoGoogle';

export default function Login() {
  const { usuario, cargando, error, iniciarConGoogle, cerrarSesion } = useAuth();
  const [enviando, setEnviando] = useState(false);

  if (!cargando && usuario?.esAdmin) return <Navigate to="/eventos" replace />;
  // Inició sesión con una cuenta institucional que no es de administrador.
  const sinPermiso = !cargando && usuario && !usuario.esAdmin;

  async function alContinuar() {
    setEnviando(true);
    await iniciarConGoogle();
    setEnviando(false);
  }

  return (
    <main className="login">
      <section className="login__marca">
        <div className="login__logo">
          <img src={logoCertus} alt="CERTUS" className="login__certus" />
          <div className="login__nombre">
            <strong>Tech-Events</strong>
            <span>Área de TI</span>
          </div>
        </div>
        <h1>Un evento, registrado una sola vez.</h1>
        <p>Con los mismos datos salen el arte y los textos para WhatsApp, LinkedIn y Facebook.</p>
        <Afiche variante="papel" className="login__afiche login__afiche--uno" />
        <Afiche variante="orquidea" className="login__afiche login__afiche--dos" />
      </section>

      <section className="login__acceso">
        <div className="login__form">
          <h2>Ingresar</h2>
          <p>Acceso para el personal del área de TI de CERTUS.</p>

          {sinPermiso ? (
            <>
              <p className="login__error" role="alert">
                {error || 'Tu cuenta no tiene permisos de administrador. Pide acceso al área de TI.'}
              </p>
              <p className="login__ayuda">Sesión iniciada como {usuario.correo}.</p>
              <button type="button" className="boton-google" onClick={cerrarSesion}>
                Usar otra cuenta
              </button>
            </>
          ) : (
            <button type="button" className="boton-google" onClick={alContinuar} disabled={enviando || cargando}>
              <IconoGoogle />
              {enviando ? 'Abriendo Google…' : 'Continuar con Google'}
            </button>
          )}

          {error && !sinPermiso && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <p className="login__ayuda">
            Usa tu correo @{DOMINIO_PERMITIDO}. Las cuentas personales no tienen acceso.
          </p>
        </div>

        <div className="login__extra">
          <p className="login__alumnos">
            <strong>¿Eres alumno?</strong> Para inscribirte a un evento, abre el enlace o escanea el QR que te compartieron.
          </p>
          <ol className="login__pasos">
            <li>
              <span>
                <strong>Registra</strong> el evento una sola vez.
              </span>
            </li>
            <li>
              <span>
                <strong>Descarga</strong> el arte y los textos para redes.
              </span>
            </li>
            <li>
              <span>
                <strong>Comparte</strong> el enlace o el QR de inscripción.
              </span>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}