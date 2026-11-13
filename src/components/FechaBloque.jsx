const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const CLASE_MODALIDAD = { Presencial: 'presencial', Virtual: 'virtual', Híbrido: 'hibrido' };

// Bloque con el día en grande (repite el numeral del afiche); el color cambia según la modalidad.
export default function FechaBloque({ fecha, modalidad }) {
  const [, m, d] = fecha.split('-').map(Number);
  return (
    <div className={`evento__fecha evento__fecha--${CLASE_MODALIDAD[modalidad] || 'presencial'}`} aria-hidden="true">
      <strong>{d}</strong>
      <span>{MESES[m - 1]}</span>
    </div>
  );
}