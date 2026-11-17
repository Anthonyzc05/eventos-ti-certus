# CERTUS Tech-Events (Caso 2)

Aplicación web responsiva para gestionar eventos académicos de TI y generar artes y textos para redes sociales. Los administradores (cuentas `@certus.edu.pe` registradas en Firestore) crean y difunden eventos; los alumnos y docentes se inscriben con su cuenta institucional desde un enlace o código QR.

> Documentación completa (herramientas, archivos, Firebase, despliegue y mantenimiento): **[DOCUMENTACION.md](./DOCUMENTACION.md)**

## Funcionalidades

- Inicio de sesión con Google restringido a `@certus.edu.pe` (CU1)
- Crear, editar y listar eventos, con cupos opcionales y foto del expositor (CU2, CU3, CU4)
- Arte para redes en PNG: 3 plantillas y 3 formatos, con QR de inscripción (CU5)
- Textos listos para WhatsApp, LinkedIn y Facebook, en tono cercano o formal (CU6)
- Inscripción de asistentes con control de cupos y sin duplicados (CU7)
- Lista de participantes con búsqueda y exportación a Excel/CSV (CU8)

## Tecnologías

React 18 · Vite 5 · React Router 6 · Firebase 11 (Authentication + Cloud Firestore) · qrcode.react · Canvas 2D · Vercel

## Ejecutarlo en tu computadora

```bash
npm install
cp .env.example .env   # luego pega los datos de tu proyecto de Firebase
npm run dev
```

Abre `http://localhost:5173`.

## Configurar Firebase (una sola vez)

1. Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Método de acceso → Google → Habilitar.**
3. **Authentication → Configuración → Dominios autorizados:** agrega el dominio de Vercel cuando publiques la app.
4. **Firestore Database → Crear base de datos** (región `southamerica-east1`).
5. **Firestore → Reglas:** pega el contenido de `firestore.rules` y pulsa **Publicar** (cada vez que ese archivo cambie).
6. **Firestore → Datos:** crea la colección `admins` y un documento cuyo **ID sea el correo del administrador en minúsculas**, con los campos `nombre` y `rol` (texto).
7. **Configuración del proyecto → Tus apps → Web (`</>`):** registra la app y copia los valores a `.env`.

## Publicarlo en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel: *Add New → Project* y elige el repositorio (detecta Vite).
3. Agrega las 6 variables `VITE_FIREBASE_*` en *Settings → Environment Variables*.
4. Mantén `vercel.json` en la raíz: hace que `/inscripcion/...` funcione al abrir el enlace o recargar.
5. Agrega el dominio de Vercel en Firebase → *Dominios autorizados*.

## Estructura

```
src/
├── main.jsx · App.jsx · AuthContext.jsx · firebase.js · styles.css
├── components/   Afiche, CompartirEvento, FechaBloque, GeneradorArte, GeneradorTextos,
│                 IconoGoogle, PanelLayout, RutaProtegida
├── lib/          arte, eventos, foto, textos, validacion
└── pages/        Login, Eventos, EventoForm, Difusion, Participantes, Inscripcion
firestore.rules   Reglas de seguridad de la base de datos
vercel.json       Reescritura de rutas para la SPA
```

**Equipo 5 · CERTUS** · Desarrollo: Anthony Zuñiga Cavero - Wyll Achulle - Piero Pealez - Alessandro Garcia - Yoffri Yalli 
https://eventos-ti-certus.vercel.app/ (USUARIOS PERMITIDOS INGRESAN A LA PLATAFORMA)
