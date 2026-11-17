# CERTUS Tech-Events · Documentación del proyecto

Documentación técnica de la aplicación web del **Caso 2 – Gestor de eventos académicos de TI** (Equipo 5, CERTUS).
Sirve para entender qué hace cada herramienta, cada carpeta y cada archivo, qué datos guarda Firebase y qué hay que tocar cuando se cambia algo.

---

## 1. Descripción general

**CERTUS Tech-Events** es una aplicación web responsiva con dos tipos de usuario:

| Actor | Quién es | Qué hace |
|---|---|---|
| **Administrador** | Cuenta `@certus.edu.pe` registrada en la colección `admins` de Firestore | Crea, edita y lista eventos; genera el arte y los textos para redes; comparte el enlace y el QR; consulta y exporta participantes |
| **Asistente** | Cualquier cuenta `@certus.edu.pe` verificada | Abre el enlace o QR de un evento publicado, inicia sesión con Google y se inscribe |

Los administradores también pueden inscribirse como asistentes: la inscripción solo exige una cuenta institucional verificada, sin importar cómo esté formado el correo (número de DNI en alumnos, nombre en docentes).

La aplicación no tiene servidor propio: es una **aplicación de una sola página (SPA)** en React que habla directamente con **Firebase** (Authentication + Firestore). La seguridad real está en las **reglas de Firestore**, no en el navegador.

---

## 2. Tecnologías y versiones

| Herramienta | Versión | Para qué se usa |
|---|---|---|
| **React** | 18.3.1 | Interfaz de usuario (componentes y estado) |
| **React DOM** | 18.3.1 | Dibuja React en el navegador |
| **React Router DOM** | 6.30.6 (`^6.28.0`) | Rutas de la app (`/`, `/eventos`, `/inscripcion/:id`…) |
| **Vite** | 5.4.21 (`^5.4.11`) | Servidor de desarrollo y empaquetado (`npm run dev` / `npm run build`) |
| **@vitejs/plugin-react** | 4.7.0 (`^4.3.4`) | Soporte de React/JSX en Vite |
| **Firebase (SDK web)** | 11.10.0 (`^11.0.0`) | Authentication con Google y base de datos Cloud Firestore |
| **qrcode.react** | 4.2.0 (`^4.2.0`) | Genera el código QR (`QRCodeCanvas`) |
| **Canvas 2D API** | nativa del navegador | Dibuja el arte (PNG) de los eventos, sin librerías externas |
| **Google Fonts** | — | Fuentes *Bricolage Grotesque* (títulos) e *Instrument Sans* (texto) |
| **Node.js** | 18 o superior (probado con 22) | Entorno para instalar y compilar |
| **Vercel** | — | Hosting de la app publicada |
| **GitHub** | — | Repositorio del código |
| **VS Code** | — | Editor |

> Las versiones entre paréntesis son los rangos declarados en `package.json`; la primera cifra es la que quedó instalada en `package-lock.json`.

Scripts de `package.json`:

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias |
| `npm run dev` | Servidor local en `http://localhost:5173` |
| `npm run build` | Genera la carpeta `dist/` lista para publicar |
| `npm run preview` | Sirve `dist/` localmente para probar el build |

---

## 3. Cómo ejecutarlo

```bash
npm install
cp .env.example .env      # en Windows: copia el archivo y renómbralo a .env
# pega en .env los datos de tu proyecto de Firebase (sección 4)
npm run dev
```

### Variables de entorno (`.env`)

Salen de *Firebase Console → Configuración del proyecto → Tus apps → Web → Configuración del SDK*. El archivo `.env` **no se sube a GitHub** (está en `.gitignore`).

| Variable | Contenido |
|---|---|
| `VITE_FIREBASE_API_KEY` | Clave de API de la app web |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<proyecto>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket (no se usa Storage, pero el SDK lo pide) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID del remitente |
| `VITE_FIREBASE_APP_ID` | ID de la app web |

Si se cambian estas variables hay que **reiniciar** `npm run dev`, y en Vercel hay que **volver a desplegar**.

---

## 4. Estructura de carpetas y archivos

```
eventos-ti-certus/
├── .env.example            Plantilla de variables de entorno
├── .gitignore              Archivos que Git ignora (.env, node_modules, dist…)
├── DOCUMENTACION.md        Este documento
├── README.md               Resumen y guía rápida
├── firestore.rules         Reglas de seguridad de Firestore (se copian a la consola)
├── index.html              Página base: título, fuentes y <div id="root">
├── package.json            Dependencias y scripts
├── package-lock.json       Versiones exactas instaladas
├── vercel.json             Regla para que las rutas de React funcionen al recargar
├── vite.config.js          Configuración de Vite (plugin de React)
└── src/
    ├── main.jsx            Punto de entrada: BrowserRouter + AuthProvider + App
    ├── App.jsx             Tabla de rutas de la aplicación
    ├── AuthContext.jsx     Sesión: login con Google, validación de dominio, rol de admin
    ├── firebase.js         Conexión con Firebase y dominio permitido
    ├── styles.css          Todos los estilos (colores, tipografías, componentes, responsive)
    ├── assets/
    │   └── certus-logo.png Logo usado en la cabecera y en el arte
    ├── components/
    │   ├── Afiche.jsx          Afiche decorativo del login y del banner del panel
    │   ├── CompartirEvento.jsx Ventana con enlace, botón copiar y QR descargable
    │   ├── FechaBloque.jsx     Bloque de fecha (día/mes) de cada evento en la lista
    │   ├── GeneradorArte.jsx   Controles y vista previa del arte (CU5)
    │   ├── GeneradorTextos.jsx Textos por red social con tono y botón copiar (CU6)
    │   ├── IconoGoogle.jsx     Icono del botón "Continuar con Google"
    │   ├── PanelLayout.jsx     Cabecera y contenedor del panel de administración
    │   └── RutaProtegida.jsx   Bloquea el panel a quien no sea administrador
    ├── lib/
    │   ├── arte.js         Dibuja el arte en <canvas>: plantillas, formatos, QR y foto
    │   ├── eventos.js      Acceso a Firestore: eventos, inscripciones, utilidades
    │   ├── foto.js         Recorta y reduce la foto del expositor (JPG liviano)
    │   ├── textos.js       Genera textos para WhatsApp, LinkedIn y Facebook
    │   └── validacion.js   Reglas del formulario del evento (CU10)
    └── pages/
        ├── Login.jsx         Pantalla de inicio de sesión (CU1)
        ├── Eventos.jsx       Lista de eventos con acciones (CU4)
        ├── EventoForm.jsx    Crear y editar evento (CU2 y CU3)
        ├── Difusion.jsx      Arte y textos para redes de un evento (CU5 y CU6)
        ├── Participantes.jsx Lista, búsqueda y exportación CSV (CU8)
        └── Inscripcion.jsx   Página pública de inscripción (CU7)
```

La carpeta `dist/` (resultado de `npm run build`) y `node_modules/` no se suben a Git.

### Qué hace cada archivo en detalle

| Archivo | Contenido principal |
|---|---|
| `firebase.js` | Inicializa Firebase con las variables `VITE_FIREBASE_*`; exporta `auth`, `db`, `googleProvider` y `DOMINIO_PERMITIDO = 'certus.edu.pe'`. Pide a Google mostrar solo cuentas del dominio (`hd`) y siempre elegir cuenta |
| `AuthContext.jsx` | Escucha la sesión de Firebase. Cierra la sesión si el correo no es verificado o no termina en `@certus.edu.pe`. Consulta `admins/{correo}` (con límite de 10 s) para fijar `usuario.esAdmin`. Expone `usuario`, `cargando`, `error`, `iniciarConGoogle` y `cerrarSesion` |
| `RutaProtegida.jsx` | Redirige a `/` si no hay sesión o el usuario no es administrador |
| `eventos.js` | `listarEventos`, `obtenerEvento`, `crearEvento` (con `inscritos: 0`), `actualizarEvento`, `eliminarEvento`, `contarInscritos`, `listarInscritos`, `inscribirse` (transacción), `urlInscripcion`, `formatearFecha`, `descargarCSV` |
| `validacion.js` | Límites de longitud, `CUPOS_MAX = 5000`, `validarEvento`, `limpiarEvento`, `yaOcurrio` (fecha + hora anterior a ahora) |
| `foto.js` | `procesarFoto(archivo)`: acepta JPG/PNG/WebP de hasta 10 MB, recorta en cuadrado, reduce a 560 × 560 px y devuelve un JPG como texto (máx. 150 000 caracteres) |
| `arte.js` | `FORMATOS` (cuadrado 1080×1080, vertical 1080×1920, horizontal 1200×628), `PLANTILLAS` (marino, orquídea, claro) y `dibujarArte`, que compone logo, fecha, título, expositor con foto circular, modalidad y lugar, QR y pie |
| `textos.js` | `generarTextos(evento, url, tono)` devuelve el texto de WhatsApp, LinkedIn y Facebook; tonos *cercano* y *formal*; incluye la línea de cupos si el evento los tiene |
| `Difusion.jsx` | Solo para eventos publicados que aún no ocurrieron. Pestañas "Arte para redes" y "Textos para redes", más el botón "Enlace y QR" |
| `Participantes.jsx` | Tabla con búsqueda y botón "Exportar a Excel (CSV)"; evita inyección de fórmulas en Excel |
| `Inscripcion.jsx` | Página pública: login con Google, formulario (nombre y programa), contador de cupos, mensajes de éxito o error |

---

## 5. Rutas de la aplicación

| Ruta | Quién entra | Pantalla |
|---|---|---|
| `/` | Todos | Login (CU1) |
| `/inscripcion/:id` | Cualquiera con enlace; necesita cuenta `@certus.edu.pe` para inscribirse | Inscripción (CU7) |
| `/eventos` | Solo administradores | Lista de eventos (CU4) |
| `/eventos/nuevo` | Solo administradores | Crear evento (CU2) |
| `/eventos/:id/editar` | Solo administradores | Editar evento (CU3) |
| `/eventos/:id/difusion` | Solo administradores | Arte y textos (CU5, CU6) |
| `/eventos/:id/participantes` | Solo administradores | Participantes (CU8) |

`vercel.json` redirige cualquier ruta a `index.html`; sin él, abrir o recargar `/inscripcion/...` en Vercel da error 404.

---

## 6. Firebase

### 6.1 Authentication

- Método habilitado: **Google**.
- **Dominios autorizados** (Authentication → Configuración): `localhost` y el dominio de Vercel (por ejemplo `eventos-ti-certus.vercel.app`). Si se cambia o se agrega un dominio, hay que agregarlo aquí o el inicio de sesión falla.
- La app acepta solo correos **verificados** que terminan en `@certus.edu.pe`; cualquier otro se cierra de inmediato.

### 6.2 Cloud Firestore: modelo de datos

**Colección `admins`** — quién es administrador. Se gestiona **solo desde la consola**; la app no puede escribirla.

| Elemento | Valor |
|---|---|
| ID del documento | Correo en minúsculas, por ejemplo `usuario@certus.edu.pe` |
| `nombre` | texto |
| `rol` | texto (por ejemplo `administrador`) |

**Colección `eventos`** — un documento por evento (ID automático).

| Campo | Tipo | Regla |
|---|---|---|
| `titulo` | texto | 3 a 120 caracteres |
| `fecha` | texto `AAAA-MM-DD` | formato obligatorio |
| `hora` | texto `HH:MM` | 24 horas |
| `modalidad` | texto | `Presencial`, `Virtual` o `Híbrido` |
| `lugar` | texto | 2 a 150 caracteres |
| `expositor` | texto | 2 a 100 caracteres |
| `descripcion` | texto | 10 a 800 caracteres |
| `estado` | texto | `borrador` o `publicado` |
| `cupos` | entero o `null` | opcional; 1 a 5000; `null` = sin límite |
| `inscritos` | entero | contador, ≥ 0; lo mantiene la transacción de inscripción |
| `foto` | texto o `null` | opcional; data URL `data:image/jpeg;base64,…` de hasta 160 000 caracteres |
| `creadoEn` | timestamp | fecha del servidor |
| `creadoPor` | texto | UID del administrador que lo creó |

**Colección `inscripciones`** — una por persona y evento.

| Elemento | Valor |
|---|---|
| ID del documento | `<eventoId>_<correo en minúsculas>`; así nadie se inscribe dos veces |
| `eventoId` | ID del evento |
| `nombre` | 3 a 120 caracteres |
| `correo` | correo de la cuenta con la que se inició sesión, en minúsculas |
| `programa` | hasta 120 caracteres |
| `creadoEn` | timestamp del servidor |

**Índices:** no se necesitan índices compuestos. Las consultas usan un solo campo (`orderBy('fecha')` en `eventos` y `where('eventoId', '==', …)` en `inscripciones`).

### 6.3 Reglas de seguridad (`firestore.rules`)

| Colección | Quién puede | Qué |
|---|---|---|
| `admins` | Cada persona | Solo leer **su propio** documento (para saber si es admin). Nadie escribe desde la app |
| `eventos` | Cualquiera | `get` de un evento **publicado** si conoce el ID (no puede listar) |
| `eventos` | Administrador | Listar, crear, editar y borrar, con los datos validados por `eventoValido()` |
| `eventos` | Cuenta institucional | Solo sumar **+1** a `inscritos`, junto con su propia inscripción y sin pasar de `cupos` |
| `inscripciones` | Cuenta institucional | `create` de **su propia** inscripción a un evento publicado, con datos válidos |
| `inscripciones` | Administrador | Leer, editar y borrar |

Funciones de ayuda dentro de las reglas: `esAdmin()` (cuenta verificada del dominio **y** documento en `admins`), `esCertus()` (cuenta verificada del dominio), `eventoValido(d)` y `sumaSuInscripcion(eventoId)`.

> **Importante:** el proyecto no usa Firebase CLI. Las reglas se publican **copiando el contenido de `firestore.rules` en Firebase Console → Firestore → Reglas → Publicar**. El archivo del repositorio y la consola deben quedar idénticos.

### 6.4 Flujo de inscripción con cupos

1. La persona abre `/inscripcion/:id` e inicia sesión con Google.
2. `inscribirse()` abre una **transacción** de Firestore: lee el evento, comprueba que esté publicado y que `inscritos < cupos`.
3. En la misma transacción guarda `inscripciones/<eventoId>_<correo>` y actualiza `inscritos + 1`.
4. Las reglas verifican ambas escrituras a la vez (`existsAfter`, `getAfter`), por lo que el límite de cupos se respeta aunque dos personas se inscriban al mismo tiempo, y no es posible saltarse la app llamando a Firestore directamente.

---

## 7. Casos de uso y dónde están en el código

| Código | Caso de uso | Archivos principales |
|---|---|---|
| CU1 | Inicio y cierre de sesión | `Login.jsx`, `AuthContext.jsx`, `RutaProtegida.jsx`, `PanelLayout.jsx` |
| CU2 | Crear evento | `EventoForm.jsx`, `eventos.js` |
| CU3 | Editar evento | `EventoForm.jsx`, `eventos.js` |
| CU4 | Listar eventos | `Eventos.jsx`, `FechaBloque.jsx` |
| CU5 | Generar arte del evento | `Difusion.jsx`, `GeneradorArte.jsx`, `arte.js`, `foto.js` |
| CU6 | Generar textos para redes | `Difusion.jsx`, `GeneradorTextos.jsx`, `textos.js` |
| CU7 | Inscribir asistente | `Inscripcion.jsx`, `eventos.js` (`inscribirse`) |
| CU8 | Consultar y exportar participantes | `Participantes.jsx`, `eventos.js` |
| CU9 | Validar cuenta institucional | `AuthContext.jsx`, `firestore.rules` (`esCertus`, `esAdmin`) |
| CU10 | Validar datos del evento | `validacion.js`, `firestore.rules` (`eventoValido`) |
| CU11 | Seleccionar plantilla de arte | `GeneradorArte.jsx`, `arte.js` (`PLANTILLAS`, `FORMATOS`) |
| CU12 | Descargar arte | `GeneradorArte.jsx` (`toBlob` → PNG) |
| CU13 | Copiar texto | `GeneradorTextos.jsx` |
| CU14 | Exportar a Excel o CSV | `Participantes.jsx`, `eventos.js` (`descargarCSV`) |
| CU15 | Validar datos de inscripción | `Inscripcion.jsx`, `firestore.rules` (reglas de `inscripciones`) |

---

## 8. Si cambias algo, ¿qué más hay que tocar?

| Si cambias… | Además hay que… |
|---|---|
| Un **campo del evento** (agregar, quitar o cambiar límites) | Actualizar `EVENTO_VACIO`, `validarEvento` y `limpiarEvento` en `validacion.js`; el formulario `EventoForm.jsx`; y **`eventoValido()` en `firestore.rules`** (la lista `hasOnly` rechaza campos desconocidos). Luego **publicar las reglas** en Firebase |
| Un **campo de la inscripción** | `inscribirse()` en `eventos.js`, el formulario de `Inscripcion.jsx`, la regla de `inscripciones` en `firestore.rules` y las columnas de `Participantes.jsx` |
| **`firestore.rules`** | Copiar el contenido completo a Firebase Console → Reglas → **Publicar** |
| Las **variables `VITE_FIREBASE_*`** | Cambiar `.env` y reiniciar `npm run dev`; cambiarlas en Vercel → Settings → Environment Variables y **redesplegar** |
| **Dominio de la app** (nuevo dominio en Vercel) | Agregarlo en Firebase → Authentication → Configuración → **Dominios autorizados** |
| **Quién es administrador** | Crear o borrar el documento en la colección `admins` (ID = correo en minúsculas) desde la consola |
| **Colores o tipografía** | Variables CSS al inicio de `styles.css`; las plantillas del arte están aparte, en `PLANTILLAS` de `arte.js`; el enlace de Google Fonts está en `index.html` |
| **Plantillas o formatos del arte** | `PLANTILLAS` y `FORMATOS` en `arte.js` |
| **Textos para redes** | `textos.js` |
| **Dependencias** | `npm install <paquete>`; se actualizan `package.json` y `package-lock.json`; hacer commit de ambos |
| **Rutas nuevas** | `App.jsx`; no hace falta tocar `vercel.json` |
| **Eventos antiguos sin contador** | Los eventos creados antes de los cupos no tienen `inscritos`; se tratan como 0. Para corregir el conteo, agregar el campo `inscritos` de tipo **int64** (número) en el documento del evento en la consola |

---

## 9. Despliegue en Vercel

1. El código está en GitHub; cada `git push` a la rama principal dispara un despliegue automático.
2. En Vercel el proyecto detecta **Vite** (comando `npm run build`, carpeta de salida `dist`).
3. *Settings → Environment Variables*: las 6 variables `VITE_FIREBASE_*`.
4. `vercel.json` con la reescritura a `index.html` debe estar en la **raíz** del proyecto y subido a GitHub.
5. Agregar el dominio resultante en Firebase → *Dominios autorizados*.
6. Verificar: abrir el enlace de un evento publicado desde el celular, iniciar sesión con una cuenta `@certus.edu.pe` e inscribirse.

---

## 10. Seguridad (resumen)

- **El control real está en Firestore Rules.** Aunque alguien modifique el navegador, no puede listar eventos, leer inscripciones, inscribir a otra persona, inscribirse dos veces ni pasar el límite de cupos.
- Los administradores solo se registran desde la consola; la app no puede crearlos.
- Solo cuentas `@certus.edu.pe` verificadas; las demás se desconectan al iniciar sesión.
- El CSV exportado antepone `'` a valores que empiezan por `=`, `+`, `-` o `@` para evitar fórmulas maliciosas en Excel.
- El archivo `.env` está fuera de Git. Las claves de la app web de Firebase **no son secretas** (identifican el proyecto); lo que protege los datos son las reglas.
- Las fotos se guardan como texto dentro del evento: solo JPG, hasta ~110 KB, con tipo verificado por las reglas.

---

## 11. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `permission-denied` al guardar un evento o inscribirse | Las reglas de la consola no coinciden con `firestore.rules`. Copiarlas y **Publicar** |
| "Este evento no está disponible" | El evento está en borrador, fue borrado o las reglas son antiguas |
| 404 al abrir el enlace o QR en Vercel | Falta `vercel.json` en la raíz o no se subió a GitHub |
| No inicia sesión en la versión publicada | El dominio de Vercel no está en *Dominios autorizados* de Firebase |
| "Failed to resolve import qrcode.react" | Falta instalar la dependencia: `npm install` |
| La cuenta no entra al panel | Su correo no está en `admins` (ID exacto, en minúsculas) |
| El contador de inscritos aparece en 0 en un evento viejo | Agregar el campo `inscritos` tipo int64 en la consola (sección 8) |
| Se ve el nombre de otra cuenta en el formulario | Corregido: el formulario se reinicia al cambiar de cuenta |

---

## 12. Historial de funcionalidades

| Etapa | Qué se agregó |
|---|---|
| Avance 1 | Login con Google restringido a `@certus.edu.pe`, colección `admins`, ruta protegida, reglas iniciales |
| Gestor de eventos | CU2, CU3 y CU4: crear, editar y listar; validación de datos; reglas `eventoValido` |
| Inscripción | CU7: enlace y QR, login de asistentes con cuenta institucional, una inscripción por persona |
| Participantes | CU8: lista, búsqueda y exportación a CSV/Excel |
| Despliegue | Publicación en Vercel, `vercel.json`, dominio autorizado en Firebase |
| Difusión | CU5 (arte PNG con 3 plantillas y 3 formatos) y CU6 (textos para WhatsApp, LinkedIn y Facebook, tono cercano o formal) |
| Cupos | Límite opcional por evento, contador `inscritos` con transacción y reglas, "Cupos agotados" |
| Foto del expositor | Campo opcional, foto circular en el arte, reglas actualizadas |
| Rediseño del panel | Contenedor más ancho, filas de evento con barra de ocupación y botón principal "Difusión" |
| Casos de uso secundarios | CU9 a CU15 documentados en el informe del curso |

---

## 13. Pendiente y posibles mejoras

- Cierre de sesión automático por inactividad.
- Logo del tema (por ejemplo MySQL) y foto del expositor recortada sin fondo (PNG transparente) en el arte.
- Reemplazar el logo por la versión oficial de CERTUS (PNG transparente o SVG).
- Botón "Agregar al calendario" en la página de inscripción.
- Probar las reglas con el emulador de Firestore (hoy se verifican manualmente en producción).

---

**Equipo 5 · CERTUS** · Caso 2: Gestor de eventos académicos de TI · Desarrollo: Anthony Zuñiga Cavero