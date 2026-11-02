# Tech-Events · CERTUS (Caso 2)

Aplicación web responsiva para organizar eventos académicos de TI y generar artes y textos para redes sociales.

**Avance actual:** inicio de sesión con Google (solo cuentas `@certus.edu.pe` registradas como administrador) y ruta protegida.

## Tecnologías

React + Vite · Firebase Authentication · Cloud Firestore

## Cómo ejecutarlo en tu computadora

```bash
npm install
cp .env.example .env   # luego pega los datos de tu proyecto de Firebase
npm run dev
```

Abre `http://localhost:5173`.

## Configurar Firebase (una sola vez)

1. En [console.firebase.google.com](https://console.firebase.google.com) crea un proyecto (por ejemplo `tech-events-certus`).
2. **Authentication → Comenzar → Método de acceso → Google → Habilitar.** Elige un correo de asistencia del proyecto.
3. **Authentication → Configuración → Dominios autorizados:** `localhost` ya viene. Cuando publiques la app, agrega aquí su dominio.
4. **Firestore Database → Crear base de datos** (modo producción, región `southamerica-east1`).
5. **Firestore → Reglas:** pega el contenido de `firestore.rules` y publica.
6. **Firestore → Datos → Iniciar colección:** crea la colección `admins` y un documento cuyo **ID sea el correo del administrador**, por ejemplo `70593352@certus.edu.pe`, con los campos `nombre` (texto) y `rol` (texto, `administrador`).
7. **Configuración del proyecto → Tus apps → Web (`</>`):** registra la app y copia los valores a tu archivo `.env`.

## Cómo funciona el acceso

1. La persona pulsa **Continuar con Google**. Google solo muestra cuentas del dominio (`hd=certus.edu.pe`).
2. La app comprueba que el correo esté verificado y termine en `@certus.edu.pe`.
3. Como todos los estudiantes tienen ese dominio, la app comprueba además que el correo exista en la colección `admins`.
4. Las reglas de Firestore repiten esa validación en el servidor, así que nadie puede saltarse el control modificando el navegador.

Para dar acceso a otro integrante: agrega un documento en `admins` con su correo como ID.

## Estructura

```
src/
├── firebase.js            Conexión con Firebase y dominio permitido
├── AuthContext.jsx        Estado de sesión y validaciones
├── components/
│   ├── Afiche.jsx         Afiche decorativo del login
│   └── RutaProtegida.jsx  Bloquea páginas sin sesión de administrador
├── pages/
│   ├── Login.jsx          Pantalla de inicio de sesión
│   └── Eventos.jsx        Pantalla provisional
└── styles.css
firestore.rules            Reglas de seguridad de la base de datos
```

## Publicarlo (para no ejecutarlo en local)

**Opción 1: Vercel** (la que ya usas en tu portafolio)

1. Sube el repositorio a GitHub.
2. En Vercel: *Add New → Project* y elige el repositorio. Vercel detecta Vite.
3. En *Settings → Environment Variables* agrega las 6 variables `VITE_FIREBASE_*` de tu `.env`.
4. Agrega un archivo `vercel.json` con `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }` para que las rutas de React Router funcionen al recargar.
5. Copia el dominio que te da Vercel (`algo.vercel.app`) y agrégalo en Firebase → Authentication → Dominios autorizados.

**Opción 2: Firebase Hosting** (todo en un solo lugar)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting      # carpeta pública: dist, app de una sola página: sí
npm run build
firebase deploy
```
