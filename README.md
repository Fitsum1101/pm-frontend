# Express Auth Web

A **React 19 + Vite** front-end for the [`express-auth-starter`](../express-auth-starter) microservices backend, built with **Clean Architecture + Feature-Sliced Design** (per the engineering architecture manual).

It is a **separate project** from the Express backend — it talks to it over HTTP through the API gateway. Nothing is shared or mixed at the code level; the only contract is the network boundary.

---

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS · React Router DOM 7 · Axios · TanStack Query · Zustand · React Hook Form · Zod

## Architecture (4 layers, dependencies point inward)

```
Presentation   src/pages, src/components, features/*/components
Application    src/features/*/{api,hooks,schemas}, src/store, src/hooks
Infrastructure src/infrastructure/{api,storage}
Domain         src/domain/{entities,enums}      ← pure TS, no React/Axios
```

| Folder | Role |
|--------|------|
| `src/app/` | Composition root: providers, router, layouts, guards |
| `src/pages/` | Thin route screens (public / auth / private) |
| `src/domain/` | Framework-agnostic types & enums (`User`, `Permission`, roles) |
| `src/infrastructure/api/` | Single Axios instance + interceptors, endpoints registry |
| `src/infrastructure/storage/` | `authStorage` (token persistence) |
| `src/store/` | Zustand `authStore` (session + permissions, `can/canAll/canAny`) |
| `src/features/` | Feature slices: `auth`, `users`, `notifications` |
| `src/components/` | Shared design system (Button, Input, Card, …) built with CVA |
| `src/providers/` | Global context providers (Query, Theme) |
| `src/lib/` | Utilities (`cn`, `zodResolver`) |

## How it integrates with the Express backend

- **Base URL**: `VITE_API_BASE_URL` (default `/api`). In dev, `vite.config.ts` proxies `/api` → `http://localhost:3000` (the gateway), so there is no CORS.
- **Auth token**: the Axios request interceptor attaches `Authorization: Bearer <token>` from `authStorage`. On any `401` the response interceptor clears the session centrally.
- **Endpoints** (`src/infrastructure/api/endpoints.ts`) map to gateway routes:
  - `POST /api/v1/auth/{register,login,otp/verify,otp/resend,logout,refresh}`
  - `GET /api/v1/users/me`, `PATCH /api/v1/users/me`, `GET /api/v1/users`
  - `GET /api/v1/notifications`, `POST /api/v1/permissions/check`
- **Response envelope**: the gateway wraps everything in `{ success, message, data }`; feature services unwrap `.data` and return **domain types**, never raw responses.
- **Permissions**: on login the app derives a permission list from the token/roles response and stores it. Routes are gated by `ProtectedRoute` + `PermissionRoute`; UI actions by the `<Can>` component. Client checks are UX only — the backend independently authorizes every request.

## Getting started

```bash
# 1. Make sure the backend is running (from ../express-auth-starter)
#    docker compose up -d postgres redis kafka zookeeper && npm run dev
#    (gateway on http://localhost:3000)

# 2. Install & run this app
npm install
cp .env.example .env     # default VITE_API_BASE_URL=/api is fine for dev
npm run dev              # http://localhost:5173
```

### Auth flow (dev)

1. **Sign up** at `/auth/sign-up` — the first account ever created becomes `SUPER_ADMIN`.
2. **Verify OTP** at `/auth/verify-otp`. In dev there's no SMTP, so read the code from Redis:
   ```bash
   docker exec starter-redis redis-cli GET "otp:<email>:EMAIL_VERIFICATION"
   ```
3. **Sign in** at `/auth/sign-in` → lands on the dashboard.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (port 5173) with backend proxy |
| `npm run build` | `tsc -b && vite build` — type-check + production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run preview` | Serve the production build |

## Routes

```
/                     Home (public)
/auth/sign-in         Sign in            (PublicOnlyRoute)
/auth/sign-up         Register           (PublicOnlyRoute)
/auth/verify-otp      Email OTP verify   (PublicOnlyRoute)
/app/dashboard        Dashboard          (ProtectedRoute)
/app/profile          Edit profile       (ProtectedRoute)
/app/settings         Settings + theme   (ProtectedRoute)
/app/notifications    Notifications      (ProtectedRoute)
/app/users            User management    (ProtectedRoute + PermissionRoute "users:list")
*                     404
```
# pm-frontend
