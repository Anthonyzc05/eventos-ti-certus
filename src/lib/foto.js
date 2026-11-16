// Prepara la foto del expositor: la recorta en cuadrado, la reduce y la devuelve como
// texto (data URL JPG liviano) para guardarla en el mismo documento del evento.
export const FOTO_MAX_CARACTERES = 150000; // ≈ 110 KB; Firestore permite 1 MB por documento
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];
const LADO = 560;

export async function procesarFoto(archivo) {
  if (!TIPOS.includes(archivo.type)) throw new Error('Usa una imagen JPG, PNG o WebP.');
  if (archivo.size > 10 * 1024 * 1024) throw new Error('La imagen pesa demasiado (máximo 10 MB).');

  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise((ok, fallo) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => fallo(new Error('No pudimos leer esa imagen. Prueba con otra.'));
      i.src = url;
    });
    const lado = Math.min(img.naturalWidth, img.naturalHeight);
    if (!lado) throw new Error('No pudimos leer esa imagen. Prueba con otra.');
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = LADO;
    const ctx = lienzo.getContext('2d');
    ctx.fillStyle = '#ffffff'; // los PNG con transparencia quedan sobre blanco
    ctx.fillRect(0, 0, LADO, LADO);
    const sx = (img.naturalWidth - lado) / 2;
    const sy = (img.naturalHeight - lado) / 4; // un poco hacia arriba: ahí suele estar el rostro
    ctx.drawImage(img, sx, Math.max(0, Math.min(sy, img.naturalHeight - lado)), lado, lado, 0, 0, LADO, LADO);

    for (let calidad = 0.85; calidad >= 0.4; calidad -= 0.1) {
      const texto = lienzo.toDataURL('image/jpeg', calidad);
      if (texto.length <= FOTO_MAX_CARACTERES) return texto;
    }
    throw new Error('La imagen sigue siendo muy pesada. Prueba con otra.');
  } finally {
    URL.revokeObjectURL(url);
  }
}