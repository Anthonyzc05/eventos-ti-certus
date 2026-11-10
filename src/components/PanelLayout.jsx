import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Estructura común del panel: encabezado con navegación y zona de contenido.
export default function PanelLayout() {
  const { usuario, cerrarSesion } = useAuth();
  const inicial = (usuario.nombre || usuario.correo).charAt(0).toUpperCase();

  return (
    <div className="panel">
      <header className="panel__cabecera">
        <div className="panel__marca">
          <strong>Tech-Events</strong>
          <span>CERTUS · Área de TI</span>
        </div>

        <nav className="panel__nav" aria-label="Principal">
          <NavLink to="/eventos" end={false} className={({ isActive }) => (isActive ? 'activo' : undefined)}>
            Eventos
          </NavLink>
        </nav>

        <div className="panel__usuario">
          {usuario.foto ? (
            <img src={usuario.foto} alt="" referrerPolicy="no-referrer" className="panel__avatar" />
          ) : (
            <span className="panel__avatar panel__avatar--inicial" aria-hidden="true">
              {inicial}
            </span>
          )}
          <span className="panel__correo" title={usuario.correo}>
            {usuario.nombre}
          </span>
          <button type="button" className="boton-secundario boton-secundario--chico" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="panel__contenido">
        <Outlet />
      </main>
    </div>
  );
}