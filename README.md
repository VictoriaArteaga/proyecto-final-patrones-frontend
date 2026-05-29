# Arq-AI 3D — Generador de Casas y Mobiliario 3D

Frontend del proyecto final de la asignatura **Patrones / Estructuras de Datos**. Es una aplicación web que, a partir de una **fotografía**, genera con IA un **render 2D** y luego un **modelo 3D** navegable de proyectos de arquitectura exterior y mobiliario.

El flujo del usuario es un asistente por pasos:

1. **Subir fotografía** y elegir la categoría del diseño.
2. **Revisar el render 2D** generado por IA (aprobarlo o rechazarlo y regenerarlo con parámetros).
3. **Generar el modelo 3D** y visualizarlo en un visor interactivo con fondo 360°.

---

## Tecnologías

### Núcleo
| Tecnología | Versión | Uso |
|------------|---------|-----|
| [React](https://react.dev/) | 19 | Librería de interfaz de usuario |
| [TypeScript](https://www.typescriptlang.org/) | ~6.0 | Tipado estático |
| [Vite](https://vite.dev/) | 8 | Bundler y servidor de desarrollo (HMR) |

### Interfaz y estilos
| Tecnología | Versión | Uso |
|------------|---------|-----|
| [Material UI (MUI)](https://mui.com/) | 9 | Componentes de UI |
| [@mui/icons-material](https://mui.com/material-ui/material-icons/) | 9 | Iconografía |
| [Emotion](https://emotion.sh/) (`@emotion/react`, `@emotion/styled`) | 11 | Estilado CSS-in-JS (motor de MUI) |
| Google Fonts — *Outfit* | — | Tipografía del proyecto |

### Visualización 3D
| Tecnología | Versión | Uso |
|------------|---------|-----|
| [Three.js](https://threejs.org/) | 0.184 | Motor de render 3D (WebGL) |
| [@react-three/fiber](https://r3f.docs.pmnd.rs/) | 9 | Three.js declarativo en React |
| [@react-three/drei](https://drei.docs.pmnd.rs/) | 10 | Helpers (OrbitControls, useGLTF, Grid, etc.) |

### Datos y enrutamiento
| Tecnología | Versión | Uso |
|------------|---------|-----|
| [Axios](https://axios-http.com/) | 1 | Cliente HTTP hacia el backend |
| [React Router DOM](https://reactrouter.com/) | 7 | Enrutamiento de páginas |

### Calidad de código
| Tecnología | Versión | Uso |
|------------|---------|-----|
| [ESLint](https://eslint.org/) | 9 | Linter |
| [typescript-eslint](https://typescript-eslint.io/) | 8 | Reglas de ESLint para TypeScript |
| `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | — | Reglas específicas de React |

---

## Estructura del proyecto

```
src/
├── App.tsx                 # Definición de rutas y providers globales
├── main.tsx                # Punto de entrada de React
├── theme.ts                # Tema de Material UI
│
├── pages/                  # Páginas (una por ruta)
│   ├── Landing.tsx         # Página de inicio pública
│   ├── Login.tsx           # Inicio de sesión
│   ├── Register.tsx        # Registro de usuario
│   ├── VerifyAccount.tsx   # Verificación de cuenta por token
│   ├── Dashboard.tsx       # Panel con los proyectos del usuario
│   ├── NewProject.tsx      # Asistente: foto → 2D → 3D
│   ├── UserProfile.tsx     # Perfil y avatar
│   ├── Notifications.tsx   # Centro de notificaciones
│   └── DataStructures.tsx  # Demostración de estructuras de datos
│
├── components/
│   ├── Layout.tsx          # Layout de las rutas protegidas
│   └── ModelViewer.tsx     # Visor 3D (GLTF) con fondo 360° y controles
│
├── context/                # Estado global (React Context)
│   ├── NotificationsContext.tsx
│   └── GenerationQueueContext.tsx   # Cola FIFO de generaciones 3D + polling
│
├── services/               # Comunicación con el backend (Axios)
│   ├── api.ts              # Instancia de Axios (cookie HttpOnly, withCredentials)
│   ├── auth.service.ts     # Login, registro, verificación, perfil, avatar
│   ├── project.service.ts  # CRUD de proyectos y generación 2D/3D
│   └── notification.service.ts
│
├── types/                  # Tipos e interfaces compartidas
│   ├── auth.types.ts
│   └── project.types.ts
│
└── utils/                  # Utilidades y estructuras de datos
    ├── structures/         # Estructuras de datos especializadas
    │   ├── Queue.ts                 # Cola (cola de generación)
    │   ├── Stack.ts                 # Pila (undo/redo, navegación de pasos)
    │   ├── LinkedList.ts            # Lista enlazada (historial)
    │   ├── DoublyLinkedList.ts      # Lista doblemente enlazada (galería/carrusel)
    │   ├── BinarySearchTree.ts      # Árbol binario de búsqueda (índices)
    │   └── ProjectStateMachine.ts   # Máquina de estados del proyecto
    ├── cache/
    │   └── ProjectCache.ts          # Caché de proyectos
    ├── services/                    # Servicios construidos sobre las estructuras
    └── ...                          # Trie, errorMessages, storageKeys, etc.
```

---

## Patrones y estructuras de datos

Como proyecto académico de la asignatura, incluye implementaciones propias de estructuras de datos aplicadas a casos reales de la aplicación:

- **Cola (Queue):** gestiona la **cola de generación 3D** en orden FIFO (`GenerationQueueContext`), con sondeo periódico al backend para saber cuándo termina cada trabajo.
- **Pila (Stack):** soporta **deshacer/rehacer** y la navegación del asistente por pasos.
- **Lista enlazada / doblemente enlazada:** historial de proyectos y galería/carrusel navegable.
- **Árbol binario de búsqueda (BST):** índices por fecha y por nombre para búsqueda y filtrado.
- **Máquina de estados:** controla el ciclo de vida de un proyecto (creado → 2D → aprobado/rechazado → 3D).
- **Caché:** almacenamiento temporal de proyectos por usuario.
- **Trie:** soporte para búsqueda por prefijos.

La página `/data-structures` muestra demostraciones visuales de estas estructuras.

---

## Puesta en marcha

### Requisitos previos
- [Node.js](https://nodejs.org/) 18 o superior
- npm
- El **backend** de Arq-AI 3D corriendo (por defecto en `http://localhost:8080`)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080/api/v1/
```

> La autenticación se basa en un **JWT que viaja en una cookie HttpOnly** fijada por el backend. Axios se configura con `withCredentials: true` para enviar y recibir esa cookie en cada petición (incluso entre dominios distintos, p. ej. Vercel ↔ Render).

### 3. Ejecutar en desarrollo
```bash
npm run dev
```
La aplicación quedará disponible en **http://localhost:5173/**

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Compila TypeScript (`tsc -b`) y genera el build de producción con Vite |
| `npm run preview` | Sirve localmente el build de producción |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |

---

## Integración con el backend

El frontend consume una API REST. Endpoints principales:

**Autenticación (`/auth`, `/users`)**
- `POST /auth/login`, `POST /auth/register`, `GET /auth/verify`, `POST /auth/logout`
- `GET /users/me`, `PUT /users/me/avatar`, `DELETE /users/me/avatar`

**Proyectos (`/projects`)**
- `POST /projects` — crear proyecto subiendo la imagen inicial (`multipart/form-data`)
- `POST /projects/{id}/generate-2d` — generar render 2D
- `POST /projects/{id}/approve` · `POST /projects/{id}/reject` — aprobar/rechazar el 2D
- `POST /projects/{id}/regenerate-2d` — regenerar el 2D con descripción y parámetros
- `POST /projects/{id}/generate-3d` · `POST /projects/{id}/cancel-3d` — generar/cancelar el 3D
- `GET /projects` · `GET /projects/{id}` · `DELETE /projects/{id}`

**Notificaciones (`/users/me/notifications`)**
- `GET`, `POST`, `PATCH .../read`, `DELETE`

---

## Categorías de diseño soportadas

- `EXTERIOR_ARCHITECTURE` — arquitectura exterior (casas)
- `FURNITURE_ITEM` — mobiliario

---

## Autores

Proyecto final — Cuarto Semestre · Universidad.
