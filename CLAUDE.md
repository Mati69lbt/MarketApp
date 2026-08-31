# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — type-check (`tsc --noEmit`) then build (`vite build`); build fails on TS errors
- `npm run lint` — run ESLint over the repo
- `npm run preview` — preview the production build

There is no test runner configured in this project.

## Architecture

React 19 + TypeScript + Vite SPA, single-user personal finance/shopping app, deployed to Firebase Hosting with Firestore as the only backend (no custom server).

- **Routing**: `src/App.tsx` defines all routes inside `MainLayout` (`src/layout/MainLayout.tsx`), which also owns Firebase Auth state (single hardcoded user login/logout) and the nav bar.
- **Firebase**: `src/helpers/firebase.ts` initializes the app from `VITE_*` env vars (see `.github/workflows/firebase-hosting-merge.yml` for the required secrets: `VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`, `VITE_APP_ID`). Firestore (`db`) is used directly from page components via `getDoc`/`setDoc` — there is no data-access/service layer or state management library; each page owns its own Firestore reads/writes and local React state.
- **Pages are feature modules** (`src/pages/*.tsx`), each largely self-contained with its own Firestore documents/collections, matching CSS file in `src/styles/`, and helper components in `src/components/`:
  - `Home.tsx` — presupuesto (budget) + gastos (expenses) tracker, uses `presupuesto/valor` and `gastos/lista` Firestore docs.
  - `GastosMensuales.tsx` / `Historial.tsx` — shared monthly expenses between two people (`Persona`: `carolina` | `matias`), types in `src/types/GastosMensuales.ts`.
  - `VetosMensuales.tsx` — a separate "veto" tracking feature with its own components (`VetoMes`, `VetoHisto`, `VetoModal`, `TablaVeto`, `ResumenVeto`).
  - `CompararTicket.tsx`, `ProdSugeridos.tsx`, `ListaCompras.tsx`, `Vencimientos.tsx` — ticket comparison, suggested products, shopping list, and expiration tracking respectively.
- **Types**: domain types live in `src/types/` (e.g. `Gasto`, `Categoria` in `Gasto.ts`; `GastoMensual`, `ResumenMensual`, `Persona` in `GastosMensuales.ts`) and are imported with `import type`.
- **Helpers**: `src/helpers/index.ts` has generic utilities (ID generation, date/currency formatting for `es-AR` locale, input cleaning). `src/helpers/g-m/` holds utilities/hooks specific to the "gastos mensuales" (monthly expenses) feature, including a `.jsx` `useForm` hook and date formatter mixed in with the otherwise all-TypeScript codebase.
- **UI feedback**: `notiflix` for loading overlays, `react-toastify` for toast notifications, `sweetalert2` for confirm dialogs — used directly inside page components, no shared wrapper.
- **Money formatting**: currency is always Argentine Pesos (`ARS`, `es-AR` locale) via `formatearMoneda` in `src/helpers/index.ts`; `InputMoneda.tsx` + `react-number-format` handle currency input.

## Deployment

Firebase project id is `loginmarketapp` (`.firebaserc`). `firebase.json` serves the Vite `dist/` output. GitHub Actions (`.github/workflows/firebase-hosting-merge.yml`, `firebase-hosting-pull-request.yml`) auto-build and deploy on push to `main` / on PRs, injecting `VITE_*` secrets at build time — local `.env` files with the same variable names are needed for local dev.
