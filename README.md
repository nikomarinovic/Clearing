# Clearing — Personal Finance & Spending Planner

A local-first personal finance planner: track balances, plan future income/expenses,
simulate purchases ("Can I afford it?"), plan trips, and see projections over time.

## Stack
React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts + Framer Motion + React Router.
All data is stored in the browser's `localStorage` via a small adapter/repository layer
(`src/lib/storage.ts`, `src/lib/repository.ts`) so a real backend (Supabase/Postgres/Firebase)
can be swapped in later without touching UI code.

## Getting started
```bash
npm install
npm run dev       # local dev server
npm run build     # production build -> dist/
npm run preview   # preview the production build
```

## Output structure
`npm run build` produces a clean `dist/`:
- `dist/index.html`
- `dist/404.html` (copy of index.html, for SPA fallback routing on static hosts)
- `dist/assets/` — all JS, CSS, and the favicon

No other files sit at the root of the build output.

## Project structure
```
src/
  types/        domain types (Income, Expense, Trip, SavingsGoal, ...)
  lib/          storage adapter, repository (import/export), calculation engine,
                insights engine, categories, formatting, navigation config
  context/      AppDataContext (global state), ThemeContext, ToastContext
  hooks/        useAppData, useTheme, useToast
  components/   layout, ui primitives, charts, and one folder per feature
                (dashboard, transactions, plan, purchases, trips, analytics,
                settings, onboarding, legal, common)
  pages/        one file per route
```

## Notes
- This is a first version: local-only, no account required, no backend.
- Legal pages (Privacy/Terms/Cookies/Notice) contain clearly-marked placeholder
  text and should be reviewed by a legal professional before real-world use.
