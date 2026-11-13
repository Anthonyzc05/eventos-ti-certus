// Dibuja el afiche de un evento en un <canvas>. Todo sale de los datos del evento.
import logoUrl from '../assets/certus-logo.png';

export const FORMATOS = {
  cuadrado: { nombre: 'Cuadrado', uso: 'Instagram y Facebook', ancho: 1080, alto: 1080 },
  vertical: { nombre: 'Vertical', uso: 'Historias y estados', ancho: 1080, alto: 1920 },
  horizontal: { nombre: 'Horizontal', uso: 'LinkedIn y Facebook', ancho: 1200, alto: 628 },
};

export const PLANTILLAS = {
  marino: { nombre: 'Marino', fondo: '#0e1c57', texto: '#ffffff', suave: '#c9cff0', acento: '#a33bae', forma: '#a33bae', puntos: 'rgba(255,255,255,.16)', logoFondo: null },
  orquidea: { nombre: 'Orquídea', fondo: '#8f2f98', texto: '#ffffff', suave: '#f1d9f4', acento: '#0e1c57', forma: '#b455be', puntos: 'rgba(255,255,255,.18)', logoFondo: '#0e1c57' },
  claro: { nombre: 'Claro', fondo: '#f5f4f8', texto: '#0e1c57', suave: '#5c5d75', acento: '#a33bae', forma: '#e3d4f2', puntos: 'rgba(14,28,87,.14)', logoFondo: '#0e1c57' },
};

const TITULOS = '"Bricolage Grotesque", "Arial Black", system-ui, sans-serif';
const TEXTO = '"Instrument Sans", Arial, system-ui, sans-serif';

let logoPromesa;
function cargarLogo() {
  if (!logoPromesa) {
    logoPromesa = new Promise((ok) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => ok(null);
      img.src = logoUrl;
    });
  }
  return logoPromesa;
}

async function cargarFuentes() {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load(`800 100px ${TITULOS}`),
      document.fonts.load(`700 40px ${TEXTO}`),
      document.fonts.load(`400 40px ${TEXTO}`),
    ]);
  } catch {
    /* si falla, se usa la fuente de respaldo */
  }
}

function partesFecha(fecha, hora) {
  const [a, m, d] = fecha.split('-').map(Number);
  const f = new Date(a, m - 1, d);
  const mes = new Intl.DateTimeFormat('es-PE', { month: 'long' }).format(f);
  const dia = new Intl.DateTimeFormat('es-PE', { weekday: 'long' }).format(f);
  let horaTxt = '';
  if (hora) {
    const [h, min] = hora.split(':').map(Number);
    horaTxt = new Intl.DateTimeFormat('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true }).format(
      new Date(2000, 0, 1, h, min),
    );
  }
  return { numero: String(d), mes: mes.toUpperCase(), diaSemana: dia, hora: horaTxt };
}

function rectRedondeado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Parte un texto en líneas que caben en `ancho`.
function envolver(ctx, texto, ancho) {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const lineas = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width <= ancho || !actual) actual = prueba;
    else {
      lineas.push(actual);
      actual = p;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

// Ajusta el tamaño de letra hasta que el título entre en `maxLineas` y en `altoMax`.
function ajustarTitulo(ctx, texto, ancho, maxLineas, tamMax, tamMin, altoMax = Infinity) {
  let tam = tamMax;
  for (;;) {
    ctx.font = `800 ${tam}px ${TITULOS}`;
    let lineas = envolver(ctx, texto, ancho);
    const caben = Math.max(1, Math.min(maxLineas, Math.floor(altoMax / (tam * 1.06))));
    if (lineas.length <= caben) return { tam, lineas };
    if (tam <= tamMin) {
      lineas = lineas.slice(0, caben);
      lineas[caben - 1] = lineas[caben - 1].replace(/\s*\S*$/, '') + '…';
      return { tam, lineas };
    }
    tam -= 3;
  }
}

function puntos(ctx, x, y, filas, cols, paso, radio, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < cols; j++) {
      ctx.beginPath();
      ctx.arc(x + j * paso, y + i * paso, radio, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function dibujarLogo(ctx, logo, x, y, alto, p) {
  if (!logo) return 0;
  const ancho = (logo.width / logo.height) * alto;
  if (p.logoFondo) {
    const pad = alto * 0.22;
    ctx.fillStyle = p.logoFondo;
    rectRedondeado(ctx, x - pad, y - pad, ancho + pad * 2, alto + pad * 2, (alto + pad * 2) / 2);
    ctx.fill();
  }
  ctx.drawImage(logo, x, y, ancho, alto);
  return ancho;
}

function dibujarQr(ctx, qr, x, y, tam, p, escala) {
  const pad = tam * 0.07;
  ctx.fillStyle = '#ffffff';
  rectRedondeado(ctx, x - pad, y - pad, tam + pad * 2, tam + pad * 2, 18 * escala);
  ctx.fill();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qr, x, y, tam, tam);
  ctx.imageSmoothingEnabled = true;
}

export async function dibujarArte(canvas, { evento, plantilla, formato, qr, url = '' }) {
  const [logo] = await Promise.all([cargarLogo(), cargarFuentes()]);
  const f = FORMATOS[formato];
  const p = PLANTILLAS[plantilla];
  const W = f.ancho;
  const H = f.alto;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const fecha = partesFecha(evento.fecha, evento.hora);
  const horizontal = formato === 'horizontal';
  const base = horizontal ? H : W; // unidad de escala
  const m = horizontal ? 56 : W * 0.08;
  ctx.textBaseline = 'alphabetic';

  // Fondo, círculo decorativo y puntos
  ctx.fillStyle = p.fondo;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = p.forma;
  ctx.beginPath();
  if (horizontal) ctx.arc(W - 30, -10, 260, 0, Math.PI * 2);
  else ctx.arc(W * 0.9, W * 0.05, W * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (horizontal) puntos(ctx, 56, H - 120, 4, 8, 22, 3, p.puntos);
  else puntos(ctx, W - m - 7 * W * 0.034, H - m - 6 * W * 0.034 - W * 0.03, 6, 8, W * 0.034, W * 0.004, p.puntos);

  const esc = base / 1080;
  const logoAlto = horizontal ? 44 : W * 0.065;
  const detalle = `${evento.modalidad} · ${evento.lugar}`;
  const urlCorta = url.replace(/^https?:\/\//, '');

  if (horizontal) {
    // Columna izquierda
    const colAncho = W * 0.6;
    dibujarLogo(ctx, logo, m + 12, m + 12, logoAlto, p);
    const logoFin = m + 12 + logoAlto;

    ctx.fillStyle = p.suave;
    ctx.font = `700 22px ${TEXTO}`;
    ctx.fillText('EVENTO ACADÉMICO DE TI', m, logoFin + 62);

    const t = ajustarTitulo(ctx, evento.titulo, colAncho, 3, 66, 40);
    ctx.fillStyle = p.texto;
    ctx.font = `800 ${t.tam}px ${TITULOS}`;
    let y = logoFin + 62 + 24 + t.tam * 0.9;
    t.lineas.forEach((l) => {
      ctx.fillText(l, m, y);
      y += t.tam * 1.08;
    });

    ctx.font = `700 28px ${TEXTO}`;
    ctx.fillStyle = p.texto;
    y += 12;
    ctx.fillText(evento.expositor, m, y);
    ctx.font = `400 25px ${TEXTO}`;
    ctx.fillStyle = p.suave;
    y += 38;
    ctx.fillText(envolver(ctx, detalle, colAncho)[0], m, y);

    // Columna derecha: fecha + QR
    const cx = W * 0.7;
    const colD = W - m - cx;
    ctx.fillStyle = p.texto;
    ctx.font = `800 118px ${TITULOS}`;
    ctx.textAlign = 'left';
    ctx.fillText(fecha.numero, cx, m + 118);
    ctx.font = `700 26px ${TEXTO}`;
    ctx.fillText(fecha.mes, cx, m + 118 + 38);
    ctx.font = `400 24px ${TEXTO}`;
    ctx.fillStyle = p.suave;
    ctx.fillText(fecha.hora, cx, m + 118 + 70);
    if (qr) {
      const q = Math.min(colD * 0.7, 168);
      dibujarQr(ctx, qr, cx + 14, H - m - q - 6, q, p, esc);
      ctx.fillStyle = p.suave;
      ctx.font = `600 18px ${TEXTO}`;
      ctx.fillText('Escanea para inscribirte', cx, H - m + 24);
    }
  } else {
    // Vertical y cuadrado
    dibujarLogo(ctx, logo, m + W * 0.014, m + W * 0.014, logoAlto, p);
    const logoFin = m + W * 0.014 + logoAlto;
    const filaY = formato === 'vertical' ? H * 0.17 : logoFin + W * 0.045;
    const diaTam = W * 0.17;

    // Fecha
    ctx.textAlign = 'left';
    ctx.fillStyle = p.texto;
    ctx.font = `800 ${diaTam}px ${TITULOS}`;
    ctx.fillText(fecha.numero, m, filaY + diaTam * 0.8);
    ctx.font = `700 ${W * 0.04}px ${TEXTO}`;
    ctx.fillText(fecha.mes, m, filaY + diaTam * 0.8 + W * 0.062);
    ctx.font = `400 ${W * 0.034}px ${TEXTO}`;
    ctx.fillStyle = p.suave;
    ctx.fillText(`${fecha.diaSemana} · ${fecha.hora}`, m, filaY + diaTam * 0.8 + W * 0.11);
    let finFila = filaY + diaTam * 0.8 + W * 0.11;

    // QR a la derecha de la fecha
    if (qr) {
      const q = W * 0.2;
      const qx = W - m - q;
      dibujarQr(ctx, qr, qx, filaY, q, p, esc);
      ctx.textAlign = 'center';
      ctx.fillStyle = p.suave;
      ctx.font = `600 ${W * 0.022}px ${TEXTO}`;
      ctx.fillText('Escanea para inscribirte', qx + q / 2, filaY + q + W * 0.055);
      ctx.textAlign = 'left';
      finFila = Math.max(finFila, filaY + q + W * 0.065);
    }

    // Etiqueta y título
    let y = finFila + (formato === 'vertical' ? W * 0.1 : W * 0.045);
    ctx.fillStyle = p.suave;
    ctx.font = `700 ${W * 0.026}px ${TEXTO}`;
    ctx.fillText('EVENTO ACADÉMICO DE TI', m, y);
    y += W * 0.02;

    const limiteInferior = H - m * 1.15;
    const altoTitulo = limiteInferior - y - W * 0.17;
    const maxLineas = formato === 'vertical' ? 5 : 4;
    const t = ajustarTitulo(ctx, evento.titulo, W - m * 2, maxLineas, W * 0.095, W * 0.05, altoTitulo);
    ctx.fillStyle = p.texto;
    ctx.font = `800 ${t.tam}px ${TITULOS}`;
    y += t.tam * 0.95;
    t.lineas.forEach((l) => {
      ctx.fillText(l, m, y);
      y += t.tam * 1.06;
    });

    // Expositor y detalle
    y += W * 0.012;
    ctx.font = `700 ${W * 0.038}px ${TEXTO}`;
    ctx.fillStyle = p.texto;
    ctx.fillText(envolver(ctx, evento.expositor, W - m * 2)[0], m, y);
    y += W * 0.052;
    ctx.font = `400 ${W * 0.033}px ${TEXTO}`;
    ctx.fillStyle = p.suave;
    envolver(ctx, detalle, W - m * 2)
      .slice(0, 2)
      .forEach((l) => {
        ctx.fillText(l, m, y);
        y += W * 0.045;
      });

    // Pie
    if (urlCorta) {
      ctx.font = `600 ${W * 0.024}px ${TEXTO}`;
      ctx.fillStyle = p.suave;
      ctx.fillText(`Inscripción: ${urlCorta}`.slice(0, 70), m, H - m * 0.7);
    }
  }
  // Barra de acento inferior
  ctx.fillStyle = plantilla === 'marino' ? '#a33bae' : plantilla === 'orquidea' ? '#0e1c57' : '#a33bae';
  ctx.fillRect(0, H - 14 * esc - 2, W, 16 * esc + 2);
}