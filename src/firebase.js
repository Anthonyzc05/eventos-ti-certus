import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Los valores salen del archivo .env (ver .env.example). No se suben a GitHub.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Solo cuentas de este dominio pueden entrar.
export const DOMINIO_PERMITIDO = 'certus.edu.pe';

export const googleProvider = new GoogleAuthProvider();
// "hd" hace que Google muestre solo las cuentas del dominio. Es una ayuda visual:
// la validación real se hace en AuthContext.jsx y en firestore.rules.
googleProvider.setCustomParameters({
  hd: DOMINIO_PERMITIDO,
  prompt: 'select_account',
});
