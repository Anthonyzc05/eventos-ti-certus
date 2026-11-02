import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Solo deja pasar a administradores con sesión iniciada.
export default function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p className="estado-carga">Verificando acceso…</p>;
  if (!usuario) return <Navigate to="/" replace />;
  return children;
}
