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
- Vercel API runtime CommonJS compatibility fix: done
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
- `api/[...route].js`
- `api/index.js`
- `api/vercel.entry.test.cjs`
- `vercel.json`
- `DESIGN.md`
- `docs/context/*`

## Verification Snapshot
- `node --test scripts/vercel-db-deploy.test.cjs`: passed
- `npm run build:server`: passed after the API entry compatibility fix
- `npm run test:server`: passed
- `npm run build`: passed
- `cmd /c "set VERCEL_ENV=preview&&npm run build:vercel"`: passed and skipped DB deploy outside production
- Vercel handler smoke check:
  - compiled `dist-server/server/app.js` exports a callable `createApp`
  - source `api/*.js` wrappers now load the compiled CommonJS server output directly
- Remaining warnings:
  - webpack bundle-size warnings only

## Latest Review Snapshot
- Manual review for the Vercel migration found no unresolved blocking correctness issue after the refactor.
- Independent reviewer-agent re-review found no remaining blocking code-level issue after the DB-deploy guard and `/api` root fixes.
- The Vercel DB deploy gate now has direct automated coverage for preview skip, production run, forced run, and failure propagation.
- Manual deployment debugging found that the live Vercel runtime was loading `api/[...route].js` as CommonJS while both the source `api/*.ts` and transitive `server/*.ts` files were emitted as ESM by Vercel's API build path; the API boundary was replaced with source `.js` wrappers that load the prebuilt CommonJS server output.

## Recommended Next Task
1. Redeploy the Vercel project from the latest commit containing the source `.js` API wrapper fix.
2. Verify `/api/health` no longer returns `FUNCTION_INVOCATION_FAILED`.
3. Verify `/api/auth/me` returns `200 { user: null }` as a guest.
4. Verify login/register and one protected Mock Agent query.
5. If a new runtime error remains, inspect the latest Vercel Function Log rather than the previous ESM/CommonJS crash.

## Notes
- The repo may appear as untracked from the parent workspace perspective. Do not use destructive git cleanup.
- Continue following the two-confirmation gate before any new module or clearly separate feature.
- Local dev still works with file storage fallback when `DATABASE_URL` is absent.
- The Agent is Mock-only and no longer depends on `OPENAI_*` environment variables.
- If you run the compiled backend manually, use `node dist-server/server/index.js`; this is now API-only and no longer serves the frontend static bundle.
- The most obvious remaining internal quality gap is targeted dashboard aggregation and refresh-state coverage.
- The previous live-runtime crash signatures were ESM/CommonJS mismatches from both `api/[...route].js` and `server/app.js`; those exact issues should be gone after redeploying the latest commit.
