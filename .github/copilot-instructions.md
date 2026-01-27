# Internal Management System - AI Coding Guidelines

## Architecture Overview

**Frontend (React + TypeScript + Vite)** and **Backend (Fastify + Prisma)** are separate projects:
- `c:\My Projects\ReactJS\internal-management-system\` - React SPA with Supabase auth
- `c:\My Projects\Node service\internal-management-system-service\` - Fastify API service (uses Prisma for DB)

**Data Flow**: React → Supabase (primary auth/data layer) + Fastify backend (service layer)

## Key Patterns

### Frontend: Supabase-First Architecture
- **Authentication**: All auth managed via Supabase (`supabase.ts` exports singleton client)
- **Data Fetching**: Direct Supabase queries in `useEffect` hooks (e.g., `Materials.tsx` pattern: `.from('material').select('*, material_type(title)')`)
- **Type System**: All DB entities defined in [types.ts](../types.ts) - keep synchronized with Supabase schema
- **Redux Store** (`store/`): Only for UI state, not data cache. Slices: `userSlice`, `assetsSlice`, `appSlice`
- **Router**: HashRouter-based with protected routes under `<Layout>` wrapper (see [App.tsx](../App.tsx#L38))

### Frontend: Component Conventions
- Pages in `pages/` use layout: header + content section with max-width container (`max-w-7xl`)
- Dark theme: `bg-dark-bg`, `bg-dark-surface`, `border-dark-border`, `text-dark-muted` CSS classes
- Icons: `lucide-react` (see [Materials.tsx](../pages/Materials.tsx#L1) for usage)
- Status indicators: `getStatusInfo()` helper returns className + text (replicable pattern)
- Tables: Headless structure with `group:hover` for action buttons (see [Materials.tsx](../pages/Materials.tsx#L127))

### Backend: Fastify + Prisma Setup
- Prisma plugin decorates server with `server.prisma` client (setup in `src/utils/prismaPlugin.ts`)
- Routes access Prisma via `app.prisma` (see `server.js` example)
- Database connection via `DATABASE_URL` env var + PrismaPg adapter
- Service layer to be implemented in `src/service.js` (currently empty)

## Development Workflow

### Frontend Setup
```bash
npm install
# Set GEMINI_API_KEY and Supabase vars in .env
npm run dev  # Vite dev server on localhost:3000
npm run build  # Production build
```

### Backend Setup
```bash
npm install
npm run test  # Runs server.js with --watch (misleading script name)
```

## Critical Integration Points

1. **Environment Variables**
   - Frontend (.env): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`
   - Backend (.env): `DATABASE_URL`, auth tokens for external services

2. **Supabase Relations** (from [types.ts](../types.ts))
   - `Material` → `material_type` (via `material_type_id`)
   - `MrForm` → multiple `MrFormMaterial` (requisition items)
   - `Personnel` → `Profile` (auth user data)

3. **Cross-Project Communication**
   - Frontend queries Supabase directly for reads; backend may provide aggregation endpoints (not yet implemented)
   - No shared types library - keep both projects' types in sync manually

## Common Tasks

**Adding a New Page**
1. Create `.tsx` in `pages/`
2. Add route to [App.tsx](../App.tsx) (guarded by `{session ?}` for auth)
3. Add Supabase query in `useEffect` with error handling (see [Materials.tsx](../pages/Materials.tsx#L15))

**Adding a Data Entity**
1. Define type in [types.ts](../types.ts)
2. Create Supabase table (manual or via migration)
3. Query with `.select('*, relation(fields)')` syntax for eager loading

**Styling**
- Tailwind + dark theme variables (no custom CSS files)
- Reuse status badge pattern: `px-2.5 py-1 rounded-full border`

## Gotchas

- HashRouter used (not BrowserRouter) - URLs use `/#/dashboard` format
- Vite path alias `@/*` points to project root (allows `import from '@/types'`)
- Supabase anon key is public (visible in .env) - use RLS policies for security
- Prisma adapter requires `@prisma/adapter-pg` for PostgreSQL (check if installed)
