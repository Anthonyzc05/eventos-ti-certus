// Textos para redes sociales a partir de los datos del evento.
const fechaLarga = (fecha) => {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(a, m - 1, d));
};
const horaTxt = (hora) => {
  if (!hora) return '';
  const [h, min] = hora.split(':').map(Number);
  return new Intl.DateTimeFormat('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(2000, 0, 1, h, min));
};
const resumir = (t, max) => {
  const limpio = t.replace(/\s+/g, ' ').trim();
  if (limpio.length <= max) return limpio;
  return limpio.slice(0, max).replace(/\s+\S*$/, '') + '…';
};
const lugarTexto = (e) =>
  e.modalidad === 'Virtual' ? `Virtual · ${e.lugar}` : e.modalidad === 'Híbrido' ? `Híbrido · ${e.lugar}` : e.lugar;

export const TONOS = { cercano: 'Cercano', formal: 'Formal' };

export function generarTextos(e, url, tono = 'cercano') {
  const fecha = fechaLarga(e.fecha);
  const hora = horaTxt(e.hora);
  const lugar = lugarTexto(e);
  const cercano = tono === 'cercano';

  const whatsapp = cercano
    ? `🚀 *${e.titulo}*

${e.descripcion}

📅 ${fecha}
🕒 ${hora}
📍 ${lugar}
🎤 ${e.expositor}

✅ Inscríbete con tu correo CERTUS:
${url}

¡Te esperamos! 💙`
    : `*${e.titulo}*

El Área de TI de CERTUS le invita a participar en este evento académico.

${e.descripcion}

Fecha: ${fecha}
Hora: ${hora}
Lugar: ${lugar}
Expositor: ${e.expositor}

Inscripción con su cuenta institucional (@certus.edu.pe):
${url}`;

  const linkedin = cercano
    ? `Esta vez en CERTUS hablamos de ${e.titulo}. 💡

${e.descripcion}

🎤 Expositor: ${e.expositor}
📅 ${fecha} · ${hora}
📍 ${lugar}

Si estudias o trabajas en tecnología, es una buena oportunidad para aprender y conectar con otros estudiantes.

Reserva tu lugar aquí 👉 ${url}

#CERTUS #Tecnología #TI #Eventos #Aprendizaje`
    : `El Área de TI de CERTUS invita a la comunidad académica al evento "${e.titulo}".

${e.descripcion}

Expositor: ${e.expositor}
Fecha y hora: ${fecha}, ${hora}
Modalidad y lugar: ${e.modalidad} · ${e.lugar}

La inscripción se realiza con la cuenta institucional en el siguiente enlace:
${url}

#CERTUS #TecnologíaDeLaInformación #EducaciónSuperior #Eventos`;

  const facebook = cercano
    ? `🎓 ${e.titulo}

${resumir(e.descripcion, 280)}

📅 ${fecha} a las ${hora}
📍 ${lugar}
🎤 ${e.expositor}

Inscríbete con tu cuenta @certus.edu.pe 👇
${url}`
    : `Evento académico CERTUS: ${e.titulo}

${resumir(e.descripcion, 280)}

Fecha: ${fecha}, ${hora}
Lugar: ${lugar}
Expositor: ${e.expositor}

Inscripciones: ${url}`;

  return { whatsapp, linkedin, facebook };
}

export const REDES = [
  { id: 'whatsapp', nombre: 'WhatsApp', color: '#1fa855', limite: null },
  { id: 'linkedin', nombre: 'LinkedIn', color: '#0a66c2', limite: 3000 },
  { id: 'facebook', nombre: 'Facebook', color: '#1877f2', limite: null },
];