// Validación del formulario de eventos (CU2 y CU3).
// Devuelve un objeto { campo: 'mensaje' }; si está vacío, los datos son válidos.
import { MODALIDADES } from './eventos';

export const LIMITES = {
  titulo: [3, 120],
  lugar: [2, 150],
  expositor: [2, 100],
  descripcion: [10, 800],
};

export const ESTADOS = ['borrador', 'publicado'];

export const EVENTO_VACIO = {
  titulo: '',
  fecha: '',
  hora: '',
  modalidad: MODALIDADES[0],
  lugar: '',
  expositor: '',
  descripcion: '',
  estado: 'borrador',
};

// "YYYY-MM-DD" de hoy según la hora local de la persona.
export function hoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function fechaReal(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [a, m, d] = texto.split('-').map(Number);
  const f = new Date(a, m - 1, d);
  return f.getFullYear() === a && f.getMonth() === m - 1 && f.getDate() === d;
}

export function validarEvento(v, { esNuevo = true } = {}) {
  const errores = {};
  const texto = (campo) => (v[campo] || '').trim();

  const [tMin, tMax] = LIMITES.titulo;
  if (!texto('titulo')) errores.titulo = 'Escribe el título del evento.';
  else if (texto('titulo').length < tMin) errores.titulo = `El título debe tener al menos ${tMin} caracteres.`;
  else if (texto('titulo').length > tMax) errores.titulo = `El título no puede pasar de ${tMax} caracteres.`;

  if (!v.fecha) errores.fecha = 'Elige la fecha del evento.';
  else if (!fechaReal(v.fecha)) errores.fecha = 'La fecha no es válida.';
  else if (esNuevo && v.fecha < hoyISO()) errores.fecha = 'La fecha no puede ser anterior a hoy.';

  if (!v.hora) errores.hora = 'Elige la hora de inicio.';
  else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v.hora)) errores.hora = 'La hora no es válida.';

  if (!MODALIDADES.includes(v.modalidad)) errores.modalidad = 'Elige una modalidad.';

  const [lMin, lMax] = LIMITES.lugar;
  if (!texto('lugar')) errores.lugar = 'Indica el lugar o el enlace de la reunión.';
  else if (texto('lugar').length < lMin) errores.lugar = `Escribe al menos ${lMin} caracteres.`;
  else if (texto('lugar').length > lMax) errores.lugar = `No puede pasar de ${lMax} caracteres.`;

  const [eMin, eMax] = LIMITES.expositor;
  if (!texto('expositor')) errores.expositor = 'Escribe el nombre del expositor.';
  else if (texto('expositor').length < eMin) errores.expositor = `Escribe al menos ${eMin} caracteres.`;
  else if (texto('expositor').length > eMax) errores.expositor = `No puede pasar de ${eMax} caracteres.`;

  const [dMin, dMax] = LIMITES.descripcion;
  if (!texto('descripcion')) errores.descripcion = 'Escribe una descripción del evento.';
  else if (texto('descripcion').length < dMin) errores.descripcion = `Describe el evento con al menos ${dMin} caracteres.`;
  else if (texto('descripcion').length > dMax) errores.descripcion = `La descripción no puede pasar de ${dMax} caracteres.`;

  if (!ESTADOS.includes(v.estado)) errores.estado = 'Elige un estado.';

  return errores;
}

// Datos limpios listos para guardar en Firestore.
export function limpiarEvento(v) {
  return {
    titulo: v.titulo.trim(),
    fecha: v.fecha,
    hora: v.hora,
    modalidad: v.modalidad,
    lugar: v.lugar.trim(),
    expositor: v.expositor.trim(),
    descripcion: v.descripcion.trim(),
    estado: v.estado,
  };
}

// Un evento ya ocurrió cuando su fecha y hora de inicio quedaron atrás.
export function yaOcurrio(evento) {
  return new Date(`${evento.fecha}T${evento.hora || '23:59'}`) < new Date();
}