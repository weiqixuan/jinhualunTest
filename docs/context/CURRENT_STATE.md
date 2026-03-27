# Current State

## Current Goal
- The core P0 workbench is implemented and documented.
- The post-P0 auth extension is now upgraded to a Vercel-ready online-demo shape:
  - Prisma/PostgreSQL-backed auth persistence
  - Vercel deployment config in `vercel.json`
  - Vercel Node function entry at `api/[...route].ts`
  - static frontend output from `dist/`
- The Agent bonus feature remains demo-ready in Mock-only mode:
  - protected `POST /api/agent/query`
  - floating query entry in the workbench
  - deterministic Mock planning against the business snapshot
  - visible parsing trace for demo explanation
- The immediate next external step is to finish the Vercel Dashboard-side project creation, attach Prisma Postgres, and publish the live demo URL.

## Completed
- Requirement-first workflow is active:
  - Phase 1 analysis
  - user confirmation
  - Phase 2 implementation plan
  - user confirmation
  - then code
- Context compression and handoff files under `docs/context/` are in use.
- Module 1 `Product Shelf` is implemented.
- Module 2 `Client Management` is implemented.
- Sticky filter behavior for module 1 and module 2 is implemented.
- Module 3 `Dashboard` is implemented with:
  - async loading from products, clients, holdings, and follow-ups
  - KPI summary cards
  - chart 1: on-shelf AUM share by product type
  - chart 2: active client holding ranking
  - chart 3: product status distribution
  - loading, empty, error, refresh, and simulated failure states
  - stale snapshot preservation when a manual refresh fails
- `DESIGN.md` is implemented as the required delivery document.
- Post-P0 auth extension includes:
  - backend service under `server/`
  - `register`, `login`, `me`, and `logout` endpoints
  - JWT session carried in an HttpOnly cookie
  - frontend login/register page and auth gate
  - workbench access only after authentication
  - `npm start` launching both backend and frontend for local dev
  - guest bootstrap no longer rendering a fake login failure
- Auth storage and deployment line now includes:
  - Prisma schema under `prisma/schema.prisma`
  - PostgreSQL migration under `prisma/migrations/`
  - idempotent auth seed script under `prisma/seed.ts`
  - runtime auth repository selection with Prisma as the deploy target
  - Vercel static-site + API split instead of Render single-service hosting
  - `build:vercel` for Vercel builds
  - explicit CommonJS-compatible Vercel API entry files under `api/*`
  - removal of `render.yaml` and `serve:render`
  - server tests updated to match the API-only server shape
  - a dedicated regression test for the Vercel catch-all API handler
- Agent delivery remains Mock-only:
  - no runtime OpenAI configuration
  - `plannerSource` fixed to `mock`
  - visible trace output in the UI

## Verified
- `npm run test:server` passes on 2026-03-27 with coverage for:
  - Vercel DB deploy gate skip path in preview
  - Vercel DB deploy gate production execution path
  - Vercel DB deploy gate forced execution path outside production
  - Vercel DB deploy gate failure propagation for migrate/seed subprocesses
  - Vercel catch-all handler health route
  - register success
  - duplicate email rejection
  - login success
  - wrong password rejection
  - guest `me` probe returns `user: null`
  - authenticated `me` probe returns the current user
  - authenticated Agent holdings query
  - last-month client count query
  - mock follow-up query honoring an explicit last-month time range
  - unknown `/api/*` routes returning JSON 404 in the API-only server shape
- `npm run build` passes on 2026-03-27.
- `npm run build:server` passes on 2026-03-27 after converting `api/*` entry files to explicit CommonJS-compatible source.
- `cmd /c "set VERCEL_ENV=preview&&npm run build:vercel"` passes on 2026-03-27:
  - frontend + server build succeed
  - Prisma migrate/seed is skipped outside production as intended
- Compiled Vercel handler smoke verification on 2026-03-27:
  - `dist-server/api/[...route].js` exports a callable handler
  - compiled `api/*` entry output now uses `require(...)` + `module.exports`, matching the Node CommonJS load path that Vercel used at runtime
- Remaining build warnings:
  - main entrypoint is about `848 KiB`
  - async dashboard vendor chunk is about `1.08 MiB`

## Latest Review Outcome
- Manual review for the Vercel migration found and resolved the main deployment-shape mismatch:
  - Render-specific static hosting logic in `server/app.ts` was removed
  - deployment entry was split into `dist/` static output plus `api/[...route].ts`
- Independent reviewer-agent re-review found no remaining blocking code-level issue after:
  - gating Vercel DB deploy/seed behind `VERCEL_ENV=production` or `VERCEL_FORCE_DB_DEPLOY=1`
  - adding `api/index.ts` so bare `/api` keeps the JSON not-found contract
- Follow-up coverage work on 2026-03-27 closed the remaining automated-test gap for the Vercel DB deploy gate:
  - preview skip is covered
  - production and forced execution paths are covered
  - migrate/seed failure propagation is covered
- Manual deployment debugging on 2026-03-27 found and resolved a Vercel runtime compatibility issue:
  - Vercel was loading `api/[...route].js` as CommonJS
  - the source API entry files were being emitted as ESM by Vercel's build path because the root `tsconfig.json` uses `module: ESNext`
  - `api/[...route].ts` and `api/index.ts` now use explicit CommonJS-compatible source so the runtime no longer depends on Vercel's module-format inference

## Next Step
- Redeploy the current Vercel project from the latest commit that includes the API entry CommonJS compatibility fix.
- Verify:
  - `/api/health` returns JSON instead of `FUNCTION_INVOCATION_FAILED`
  - `/api/auth/me` returns `200 { user: null }` for a guest session
  - the login/register flow works
  - one protected Mock Agent query succeeds
- If the runtime still fails, inspect the Vercel Function Logs for the new first error instead of the previous ESM/CommonJS mismatch.

## Key Files
- `vercel.json`
- `api/[...route].ts`
- `api/index.ts`
- `api/vercel.entry.test.ts`
- `prisma/schema.prisma`
- `prisma/migrations/*`
- `prisma/seed.ts`
- `server/*`
- `server/agent/*`
- `src/features/auth/*`
- `src/features/agentQuery/*`
- `src/services/authService.ts`
- `src/services/agentQueryService.ts`
- `src/app/App.tsx`
- `src/app/WorkspaceShell.tsx`
- `package.json`
- `scripts/vercel-db-deploy.cjs`
- `scripts/vercel-db-deploy.test.cjs`
- `webpack.config.js`
- `docs/context/*`

## Active Risks
- There is no live Vercel deployment URL yet because the Dashboard-side creation flow was not completed in this environment.
- The repository root is `D:/wqxCode/wqx_code`, so the Vercel project must build from `jinhualunCode` rather than the monorepo root.
- The current remote/deployment source must be publicly reachable by Vercel or connected through the user Dashboard.
- `build:vercel` only runs Prisma migrate/seed on production Vercel builds or when `VERCEL_FORCE_DB_DEPLOY=1`, so the deployment still depends on a reachable PostgreSQL connection on that allowed branch.
- The latest live Vercel deployment has not yet been re-verified after the API entry CommonJS compatibility fix; a redeploy is still required.
- Local development still falls back to file storage when `DATABASE_URL` is absent; the true online-demo path requires `AUTH_STORAGE=prisma`.
- The architecture is still mixed: authentication runs behind a real backend/database boundary, while business data still comes from frontend mock services.
- The Agent still queries the static business snapshot derived from `src/mock/*`, not a real business database.
- Dashboard aggregation still lacks targeted automated regression coverage.
- Bundle-size warnings remain.
