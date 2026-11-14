// Afiche decorativo de la pantalla de login (misma pieza que genera la app).
export default function Afiche({ variante, className = '' }) {
  return (
    <div className={`afiche afiche--${variante} ${className}`} aria-hidden="true">
      <span className="afiche__forma" />
      <span className="afiche__etiqueta">Evento académico de TI</span>
      <span className="afiche__dia">13</span>
      <span className="afiche__mes">noviembre · 6:30 p. m.</span>
      <span className="afiche__titulo">Introducción a la ciberseguridad</span>
      <span className="afiche__expositor">Lic. Marcos Valdivia</span>
    </div>
  );
}