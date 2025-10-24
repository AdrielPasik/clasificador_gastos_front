# Expense OCR App — Frontend

Instrucciones rápidas para levantar la app de frontend en desarrollo.

## Requisitos
- Node.js (>=18 recomendado)
- pnpm (recomendado) o npm
- Backend OCR corriendo (por defecto se espera en http://127.0.0.1:8000)

## Instalación (PowerShell)

1. Abrir una terminal en la carpeta del proyecto:

```powershell
cd 'C:\Users\Personal\Documents\Universidad\Inteligencia Artificial\expense-ocr-app'
```

2. Instalar dependencias (recomiendo pnpm):

Con pnpm (preferido, hay `pnpm-lock.yaml` en el repo):

```powershell
npm install -g pnpm   # si no tenés pnpm
pnpm install
```

Con npm:

```powershell
npm install
```

> Nota: si durante `npm run dev` aparecen errores de módulos faltantes (por ejemplo `@radix-ui/react-slot` o plugins de Tailwind), instalalos con `pnpm add <paquete>` o `npm install <paquete>` como indique el error.

## Variables de entorno

El frontend lee variables públicas `NEXT_PUBLIC_*`. Puedes crear un archivo `.env` o exportarlas en la sesión de PowerShell.

Ejemplo de `.env` (en la raíz del proyecto):

```properties
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
# o alternativamente:
NEXT_PUBLIC_BACKEND_HOST=127.0.0.1
NEXT_PUBLIC_BACKEND_PORT=8000
```

En PowerShell podés exportar variables para la sesión (ej. usar `$env:... = '...'`).

## Levantar la app en modo desarrollo

Con pnpm:

```powershell
pnpm dev
```

Con npm:

```powershell
npm run dev
```

La aplicación por defecto se expone en `http://localhost:3000`.

## Backend esperado

- El frontend está preparado para enviar `POST /api/ocr` al backend. Por defecto usa la variable `NEXT_PUBLIC_API_URL` o `NEXT_PUBLIC_BACKEND_HOST` + `NEXT_PUBLIC_BACKEND_PORT`.
- Ejemplo de endpoint de desarrollo: `http://127.0.0.1:8000/api/ocr`
- Si activás "Modo debug" en la UI, la petición incluirá `?debug_tokens=true`.

## CORS

- El backend debe permitir peticiones desde el origen donde corre el frontend (ej. `http://localhost:3000`). Si ves errores en la consola del navegador que dicen "blocked by CORS policy", habilitá CORS en el backend para `http://localhost:3000` y `http://127.0.0.1:3000`.

## Persistencia local

- El frontend persiste tickets en `localStorage` usando la key `tickets-storage`.
- Si querés borrar los tickets guardados en el navegador podés abrir DevTools -> Console y ejecutar:

```javascript
localStorage.removeItem('tickets-storage')
// o para limpiar todo el storage
localStorage.clear()
```

## Problemas comunes y soluciones

- "Cannot find module '@tailwindcss/postcss'": instala el plugin como devDependency:
  ```powershell
  pnpm add -D @tailwindcss/postcss
  # o con npm
  npm install -D @tailwindcss/postcss
  ```
- "Can't resolve '@radix-ui/react-slot'": instala el paquete:
  ```powershell
  pnpm add @radix-ui/react-slot
  # o con npm
  npm install @radix-ui/react-slot
  ```
- Si el servidor de backend no responde: verificá que esté levantado y accesible en la URL configurada (ej. abrir `http://127.0.0.1:8000/docs` en el navegador).

## Verificación rápida

1. Levanta el backend (ej. `uvicorn main:app --host 127.0.0.1 --port 8000` o el comando que uses).
2. Asegurate que `NEXT_PUBLIC_API_URL` apunte correctamente.
3. Levanta el frontend con `pnpm dev` o `npm run dev` y abre `http://localhost:3000`.
4. Sube una imagen de ticket en la UI y revisa DevTools -> Network para ver la petición POST a `/api/ocr`.

## Contacto / notas

- Este README cubre los pasos mínimos para desarrollo local. Si querés, puedo agregar instrucciones para dockerizar el frontend o crear un script que arranque tanto backend como frontend en paralelo.

---
Pequeño recordatorio: el frontend asume que el backend devuelve en el JSON el campo `category` (string) para poder calcular el desglose por categoría. Si el backend devuelve la categoría en otra ruta del JSON, dímelo y lo adapto.
