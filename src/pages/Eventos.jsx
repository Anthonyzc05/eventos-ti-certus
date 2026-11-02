import { useAuth } from '../AuthContext';

// Pantalla provisional: aquí irá el listado de eventos (siguiente avance).
export default function Eventos() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <main className="provisional">
      <h1>Eventos</h1>
      <p>
        Sesión iniciada como <strong>{usuario.correo}</strong>.
      </p>
      <p className="provisional__nota">El listado de eventos se construye en el siguiente avance.</p>
      <button type="button" className="boton-secundario" onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </main>
  );
}
