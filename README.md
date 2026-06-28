# Vet In House Frontend

Frontend React + TypeScript para Vet In House.

## Requisitos

- Backend corriendo en `http://localhost:52135`
- Node.js instalado

## Configuracion

Copia `.env.example` a `.env.local` si necesitas cambiar la URL del backend:

```bash
VITE_API_BASE_URL=http://localhost:52135
VITE_PIXABAY_API_KEY=tu_api_key_de_pixabay
```

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Login y registro

La pantalla principal permite iniciar sesion o registrar usuarios usando:

- `POST /api/auth/login`
- `POST /api/auth/registro`

Al autenticar, el token se guarda en `localStorage` bajo `vet_in_house_session`.

## Videos de bienvenida

El panel izquierdo consume la API de videos de Pixabay. Para activarlo, crea `.env.local` y agrega:

```bash
VITE_PIXABAY_API_KEY=tu_api_key_de_pixabay
```

Si no hay API key, el login sigue funcionando y muestra un fallback visual.
