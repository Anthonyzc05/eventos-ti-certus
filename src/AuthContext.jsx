import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, DOMINIO_PERMITIDO, googleProvider } from './firebase';

const AuthContext = createContext(null);

const MENSAJES = {
  dominio: `Usa tu correo institucional @${DOMINIO_PERMITIDO}. Las cuentas personales no tienen acceso.`,
  verificacion: 'No pudimos verificar tu acceso. Revisa tu conexión e inténtalo de nuevo.',
  general: 'No pudimos iniciar sesión. Inténtalo de nuevo.',
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true); // true mientras Firebase revisa si ya hay sesión
  const [error, setError] = useState('');

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUsuario(null);
        setCargando(false);
        return;
      }

      const correo = (u.email || '').toLowerCase();

      // 1) La cuenta debe ser verificada y del dominio institucional.
      if (!u.emailVerified || !correo.endsWith(`@${DOMINIO_PERMITIDO}`)) {
        setError(MENSAJES.dominio);
        await signOut(auth);
        return;
      }

      // 2) El dominio incluye a todos los estudiantes. Cualquiera con cuenta institucional
      //    puede tener sesión (para inscribirse a un evento), pero solo quien esté en la
      //    colección "admins" de Firestore es administrador y entra al panel.
      let esAdmin = false;
      try {
        // Si Firestore no responde en 10 s, mostramos un error en vez de quedarnos esperando.
        const snap = await Promise.race([
          getDoc(doc(db, 'admins', correo)),
          new Promise((_, rechazar) =>
            setTimeout(() => rechazar(Object.assign(new Error('Firestore no respondió'), { code: 'timeout' })), 10000),
          ),
        ]);
        esAdmin = snap.exists();
        setError('');
      } catch (e) {
        // Si no se pudo verificar, la persona queda como no administradora; el login muestra el motivo.
        console.error('Error al consultar admins:', e);
        setError(`${MENSAJES.verificacion} (código: ${e.code || e.message})`);
      }
      setUsuario({ uid: u.uid, correo, nombre: u.displayName || correo, foto: u.photoURL || '', esAdmin });
      setCargando(false);
    });
    return cancelar;
  }, []);

  const iniciarConGoogle = useCallback(async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      // Si la persona cierra la ventana de Google no es un error que mostrar.
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
      console.error(e);
      setError(MENSAJES.general);
    }
  }, []);

  const cerrarSesion = useCallback(() => signOut(auth), []);

  const valor = useMemo(
    () => ({ usuario, cargando, error, iniciarConGoogle, cerrarSesion }),
    [usuario, cargando, error, iniciarConGoogle, cerrarSesion],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}