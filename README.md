# MarketApp

App personal de finanzas y compras (single-user), React 19 + TypeScript + Vite, con Firestore como único backend, desplegada en Firebase Hosting.

## Funcionalidades

- **Home** — presupuesto y gastos.
- **Gastos Mensuales / Historial** — gastos mensuales compartidos entre dos personas.
- **Vetos Mensuales** — tracking de "vetos" (mes, histórico, resumen).
- **Comparar Ticket** — comparación de tickets de compra.
- **Productos Sugeridos** — sugerencias de productos.
- **Lista de Compras** — lista de compras.
- **Vencimientos** — control de vencimientos de productos.

## Requisitos

- Node.js
- Proyecto de Firebase (Auth + Firestore)

## Configuración local

Crear un archivo `.env` en la raíz con las variables:

```
VITE_API_KEY=
VITE_AUTH_DOMAIN=
VITE_PROJECT_ID=
VITE_STORAGE_BUCKET=
VITE_MESSAGING_SENDER_ID=
VITE_APP_ID=
```

## Comandos

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo (Vite)
npm run build     # type-check (tsc --noEmit) + build de producción
npm run lint      # ESLint
npm run preview   # previsualizar el build de producción
```

No hay test runner configurado en este proyecto.

## Arquitectura

- **Routing**: `src/App.tsx` define las rutas dentro de `MainLayout` (`src/layout/MainLayout.tsx`), que también maneja el estado de Firebase Auth (login/logout de un único usuario) y la barra de navegación.
- **Firebase**: `src/helpers/firebase.ts` inicializa la app con las variables `VITE_*`. Firestore (`db`) se usa directamente desde los componentes de página (`getDoc`/`setDoc`), sin capa de servicios ni state manager: cada página maneja sus propias lecturas/escrituras y estado local.
- **Páginas** (`src/pages/*.tsx`): módulos por feature, cada uno con sus propios documentos/colecciones de Firestore, su CSS en `src/styles/` y componentes auxiliares en `src/components/`.
- **Tipos**: en `src/types/` (`Gasto`, `Categoria`, `GastoMensual`, `ResumenMensual`, `Persona`, etc.), importados con `import type`.
- **Helpers**: `src/helpers/index.ts` (utilidades genéricas: IDs, fechas, formato de moneda `es-AR`, limpieza de inputs) y `src/helpers/g-m/` (utilidades/hooks específicos de "gastos mensuales").
- **UI feedback**: `notiflix` (loaders), `react-toastify` (toasts), `sweetalert2` (confirmaciones), usados directamente en cada página.
- **Moneda**: siempre ARS / locale `es-AR`, vía `formatearMoneda` (`src/helpers/index.ts`) e `InputMoneda.tsx` (con `react-number-format`).

## Despliegue

Firebase project id: `loginmarketapp` (`.firebaserc`). `firebase.json` sirve el build de Vite (`dist/`). GitHub Actions (`.github/workflows/firebase-hosting-merge.yml` y `firebase-hosting-pull-request.yml`) buildean y despliegan automáticamente en push a `main` y en PRs, inyectando los secrets `VITE_*` en build time.
