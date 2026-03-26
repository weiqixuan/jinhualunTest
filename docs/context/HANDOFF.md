# Handoff

## Read First
- `AGENTS.md`
- `PRD.md`
- `RULES.md`
- `docs/context/CURRENT_STATE.md`
- `docs/context/DECISIONS.md`
- `docs/context/TASK_BOARD.md`

## Current Status
- Module 1 `Product Shelf`: done
- Module 2 `Client Management`: done
- Sticky filters for module 1 and module 2: done
- Module 3 `Dashboard`: done
- `DESIGN.md`: done
- Post-P0 auth extension: done
- Agent intelligent-query feature: done
- Vercel-target deployment refactor: done
- Vercel DB deploy gate automated coverage: done
- Actual Vercel publication: not done yet

## Latest Implementation Scope
- `api/*`
- `prisma/*`
- `server/*`
- `src/features/auth/*`
- `src/features/agentQuery/*`
- `src/services/agentQueryService.ts`
- `src/services/authService.ts`
- `src/app/App.tsx`
- `src/app/WorkspaceShell.tsx`
- `package.json`
- `scripts/vercel-db-deploy.cjs`
- `scripts/vercel-db-deploy.test.cjs`
- `vercel.json`
- `DESIGN.md`
- `docs/context/*`

## Verification Snapshot
- `node --test scripts/vercel-db-deploy.test.cjs`: passed
- `npm run test:server`: passed
- `npm run build`: passed
- `cmd /c "set VERCEL_ENV=preview&&npm run build:vercel"`: passed and skipped DB deploy outside production
- Vercel handler smoke check:
  - compiled `dist-server/api/[...route].js` exports a callable handler
- Remaining warnings:
  - webpack bundle-size warnings only

## Latest Review Snapshot
- Manual review for the Vercel migration found no unresolved blocking correctness issue after the refactor.
- Independent reviewer-agent re-review found no remaining blocking code-level issue after the DB-deploy guard and `/api` root fixes.
- The Vercel DB deploy gate now has direct automated coverage for preview skip, production run, forced run, and failure propagation.

## Recommended Next Task
1. Open the Vercel Dashboard while signed in.
2. Import the intended repo and set `Root Directory = jinhualunCode`.
3. Install Prisma Postgres from the Vercel Marketplace for the project.
4. Confirm the project uses `buildCommand = npm run build:vercel` and `outputDirectory = dist`.
5. Set `NODE_ENV`, `AUTH_STORAGE`, `JWT_SECRET`, `AUTH_COOKIE_NAME`, `AUTH_TOKEN_TTL_SECONDS`, and `DEMO_USER_*`.
6. Deploy and verify `/`, `/api/health`, auth flows, and one protected Mock Agent query.

## Notes
- The repo may appear as untracked from the parent workspace perspective. Do not use destructive git cleanup.
- Continue following the two-confirmation gate before any new module or clearly separate feature.
- Local dev still works with file storage fallback when `DATABASE_URL` is absent.
- The Agent is Mock-only and no longer depends on `OPENAI_*` environment variables.
- If you run the compiled backend manually, use `node dist-server/server/index.js`; this is now API-only and no longer serves the frontend static bundle.
- The most obvious remaining internal quality gap is targeted dashboard aggregation and refresh-state coverage.
