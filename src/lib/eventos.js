import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

export const MODALIDADES = ['Presencial', 'Virtual', 'Híbrido'];

// ---------- Eventos (panel del administrador) ----------

export async function listarEventos() {
  const snap = await getDocs(query(collection(db, 'eventos'), orderBy('fecha', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function obtenerEvento(id) {
  const snap = await getDoc(doc(db, 'eventos', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function crearEvento(datos, uid) {
  const ref = await addDoc(collection(db, 'eventos'), {
    ...datos,
    inscritos: 0,
    creadoEn: serverTimestamp(),
    creadoPor: uid,
  });
  return ref.id;
}

export async function actualizarEvento(id, datos) {
  await updateDoc(doc(db, 'eventos', id), datos);
}

export async function eliminarEvento(id) {
  await deleteDoc(doc(db, 'eventos', id));
}

// ---------- Inscripciones ----------

export async function contarInscritos(eventoId) {
  const q = query(collection(db, 'inscripciones'), where('eventoId', '==', eventoId));
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

export async function listarInscritos(eventoId) {
  const q = query(collection(db, 'inscripciones'), where('eventoId', '==', eventoId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.creadoEn?.seconds ?? 0) - (b.creadoEn?.seconds ?? 0));
}

// Lo usa la página pública. El id "<eventoId>_<correo>" evita inscripciones duplicadas:
// si ya existe, Firestore lo trata como "update" y las reglas lo rechazan (permission-denied).
// Con una transacción se guarda la inscripción y se suma 1 al contador "inscritos" del evento,
// y se respeta el límite de cupos aunque dos personas se inscriban al mismo tiempo.
export async function inscribirse(eventoId, { nombre, correo, programa }) {
  const correoLimpio = correo.trim().toLowerCase();
  const refEvento = doc(db, 'eventos', eventoId);
  const refInscripcion = doc(db, 'inscripciones', `${eventoId}_${correoLimpio}`);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(refEvento);
    if (!snap.exists() || snap.data().estado !== 'publicado') {
      throw Object.assign(new Error('Evento no disponible'), { code: 'evento-no-disponible' });
    }
    const { cupos = null, inscritos = 0 } = snap.data();
    if (cupos !== null && inscritos >= cupos) {
      throw Object.assign(new Error('Cupos agotados'), { code: 'cupos-agotados' });
    }
    tx.set(refInscripcion, {
      eventoId,
      nombre: nombre.trim(),
      correo: correoLimpio,
      programa: programa.trim(),
      creadoEn: serverTimestamp(),
    });
    tx.update(refEvento, { inscritos: inscritos + 1 });
  });
}

// ---------- Utilidades ----------

export function urlInscripcion(eventoId) {
  return `${window.location.origin}/inscripcion/${eventoId}`;
}

export function formatearFecha(fecha, hora) {
  if (!fecha) return '';
  const [a, m, d] = fecha.split('-').map(Number);
  const texto = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(a, m - 1, d),
  );
  if (!hora) return texto;
  const [h, min] = hora.split(':').map(Number);
  const hora12 = new Intl.DateTimeFormat('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true }).format(
    new Date(2000, 0, 1, h, min),
  );
  return `${texto} · ${hora12}`;
}

// CSV compatible con Excel (BOM + comillas dobles escapadas).
export function descargarCSV(nombreArchivo, filas) {
  const escapar = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const contenido = filas.map((fila) => fila.map(escapar).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}