# Worklog

## 2026-03-24

### Task: project bootstrap and module 1 `Product Shelf`
- Built the project with `webpack + React + TypeScript`
- Implemented async product loading, search, filters, detail panel, and boundary states
- Reworked the module 1 UI on Ant Design

### Files
- `package.json`
- `webpack.config.js`
- `src/app/App.tsx`
- `src/features/productShelf/*`
- `src/services/productService.ts`
- `src/mock/products.ts`
- `src/styles/global.css`

### Verification
- Ran `npm install`
- Ran `npm run build`

### Notes
- Early bundle-size pressure from Ant Design was visible and left as a later optimization topic

## 2026-03-24

### Task: lock the project workflow and context-compression mechanism
- Wrote the two-confirmation module workflow into project instructions
- Wrote the independent reviewer-agent rule into project instructions
- Added `docs/context/` files and made them part of the expected process

### Files
- `AGENTS.md`
- `RULES.md`
- `docs/context/*`

### Verification
- Checked that the project guidance and context files exist and are aligned

## 2026-03-24

### Task: implement module 2 `Client Management`
- Added `Client`, `Holding`, and `FollowUpRecord` domain models and mock data
- Added async services for clients, holdings, and follow-ups
- Implemented client list, drawer detail, holdings view, follow-up list, and follow-up composer
- Fixed follow-up submit failure so user input is preserved on failure

### Files
- `src/domain/client.ts`
- `src/domain/holding.ts`
- `src/domain/followUp.ts`
- `src/mock/clients.ts`
- `src/mock/holdings.ts`
- `src/mock/followUps.ts`
- `src/services/clientService.ts`
- `src/services/holdingService.ts`
- `src/services/followUpService.ts`
- `src/features/clientManagement/*`
- `src/shared/formatters.ts`
- `src/styles/global.css`

### Verification
- Ran `npm run build`
- Ran independent review

## 2026-03-24

### Task: sticky filter enhancement for module 1 and module 2
- Reused the shared filter card class
- Added CSS sticky behavior for desktop and mobile offsets
- Kept module 1 and module 2 filter behavior aligned

### Files
- `src/styles/global.css`

### Verification
- Ran `npm run build`
- Verified locally in runtime
- Ran independent review with no findings

## 2026-03-24

### Task: implement module 3 `Dashboard`
- Added dashboard aggregation logic in a dedicated feature-layer module
- Implemented KPI summary cards and three business-oriented charts
- Reused existing async services instead of importing mock data in the page layer
- Wired the dashboard into the existing tab workspace with lazy loading
- Added loading, empty, error, refresh, and simulated failure states
- Adjusted webpack split strategy so dashboard vendor code can stay async
- Migrated touched Ant Design v6 deprecated props to current APIs
- Fixed reviewer-reported refresh failure behavior by preserving the last successful snapshot and showing a warning

### Files
- `src/features/dashboard/*`
- `src/app/App.tsx`
- `src/styles/global.css`
- `webpack.config.js`
- touched UI files updated for current Ant Design props

### Verification
- Ran `npm run build` multiple times after each significant fix
- Verified locally with Playwright:
  - dashboard tab renders
  - charts render
  - simulated refresh failure keeps stale snapshot visible with warning
- Ran independent reviewer pass
- Fixed the medium finding and got a clean follow-up re-review

### Remaining Risks
- No automated coverage exists yet for dashboard aggregation and refresh-state transitions
- Bundle-size warnings remain even though the initial entrypoint was reduced relative to the first dashboard build

## 2026-03-26

### Task: write `DESIGN.md` and realign the compressed context
- Read `AGENTS.md`, `PRD.md`, `RULES.md`, and the `docs/context/*` resume files before continuing work
- Reviewed the current implementation structure across `src/app`, `src/features`, `src/services`, `src/domain`, and `src/mock`
- Wrote `DESIGN.md` covering requirement analysis, scope tradeoffs, architecture, entity relations, module design, AI collaboration log, and self-review
- Updated the compressed context files so the next step no longer points to `DESIGN.md`

### Files
- `DESIGN.md`
- `docs/context/CURRENT_STATE.md`
- `docs/context/TASK_BOARD.md`
- `docs/context/HANDOFF.md`
- `docs/context/WORKLOG.md`

### Verification
- Checked `DESIGN.md` against `PRD.md`, `RULES.md`, and `docs/context/*`
- Confirmed the design document reflects the implemented module structure and current risks
- No code changed in this task, so the existing 2026-03-24 build/runtime verification snapshot remains the latest executable verification

### Notes
- The next highest-value task is still targeted automated coverage for dashboard aggregation and refresh-state transitions
- Agent work remains optional and should only start after the current quality/documentation baseline is considered stable

## 2026-03-26

### Task: add a post-P0 auth backend with login/register and frontend auth gate
- Added a dedicated backend service under `server/` using Express + TypeScript
- Implemented auth routes for register, login, logout, and `me`
- Added request validation with `zod`, password hashing with `bcryptjs`, and cookie-based JWT sessions
- Added a file-backed user repository for demo persistence
- Added frontend login/register UI and an auth gate around the existing tab workbench
- Extracted the existing workbench shell from `App.tsx` into `WorkspaceShell.tsx`
- Adjusted `GET /api/auth/me` to return `user: null` for the expected guest case so the login page no longer leaves 401 console noise
- Added server-side auth tests and local `/api` proxy support for development

### Files
- `package.json`
- `package-lock.json`
- `webpack.config.js`
- `tsconfig.server.json`
- `.env.example`
- `server/*`
- `src/app/App.tsx`
- `src/app/WorkspaceShell.tsx`
- `src/features/auth/*`
- `src/services/authService.ts`
- `src/styles/global.css`
- `DESIGN.md`
- `docs/context/*`

### Verification
- Ran `npm run test:server`
- Ran `npm run build`
- Verified locally with Playwright:
  - guest user sees the auth page
  - register success enters the workbench
  - refresh restores the session
  - logout returns to the auth page
  - guest bootstrap no longer logs a 401 console error

### Remaining Risks
- `server/data/users.json` is only a demo-grade store
- business data still comes from frontend mock services, so the app now has a mixed frontend-mock plus backend-auth architecture
- independent reviewer-agent pass was not executed in this session for the auth extension

## 2026-03-26

### Task: fix auth startup and bootstrap error messaging
- Changed `npm start` to run both `dev:server` and `dev:client` together so auth routes are available from the default dev entrypoint
- Split first-render auth bootstrap errors from form submission errors so guest users do not see a fake login failure banner
- Added short bootstrap retry logic to smooth over the normal server/client startup race

### Files
- `package.json`
- `src/app/App.tsx`
- `src/features/auth/AuthPage.tsx`
- `src/styles/global.css`
- `docs/context/*`

### Verification
- Ran `npm run build`
- Ran `npm run test:server`
- Verified locally with Playwright using `npm start`:
  - first-load guest state shows the login page without a misleading login failure banner
  - register flow succeeds without a proxy 504

### Notes
- The remaining console error during local smoke verification was only the missing `favicon.ico` 404 and is unrelated to auth

## 2026-03-26

### Task: make the auth/backend line deploy-ready for an online demo
- Added Prisma-based auth persistence with a PostgreSQL-ready schema, migration, and idempotent seed script
- Added runtime auth storage selection so the online-demo path can use Prisma while local dev can still fall back to the existing file store when `DATABASE_URL` is absent
- Reworked the Express app so a production build can serve both the React frontend and `/api/*` from the same process
- Added Railway config with build, pre-deploy, start, and healthcheck commands
- Reworked server tests to inject an in-memory repository instead of depending on file storage, and added coverage for static hosting behavior
- Refreshed the context files to reflect that the codebase is deploy-ready but not yet published to a live public URL

### Files
- `package.json`
- `package-lock.json`
- `.env.example`
- `.gitignore`
- `prisma/*`
- `railway.json`
- `server/app.ts`
- `server/index.ts`
- `server/config/env.ts`
- `server/db/prisma.ts`
- `server/auth/createUserRepository.ts`
- `server/auth/prismaUserRepository.ts`
- `server/auth/auth.routes.test.ts`
- `docs/context/*`

### Verification
- Ran `npm run db:generate`
- Ran `npm run build:server`
- Ran `npm run test:server`
- Ran `npm run build`
- Verified locally that `node dist-server/index.js` serves:
  - `GET /api/health`
  - `GET /`

### Notes
- Prisma 7 initially blocked the current schema/config approach, so the stack was pinned to Prisma 6.19.2 for this task
- Railway CLI was not installed in this environment, so no public deployment was created in this session

## 2026-03-26

### Task: switch the online-demo deployment target to Render and close the deployment-verification gaps
- Replaced the Railway deployment target with Render
- Added Render monorepo alignment so the service builds from `jinhualunCode` instead of the workspace root
- Stopped rerunning `prisma generate` inside `build:server`, which removed the Windows Prisma engine file-lock failure during local verification when the dev server is already active
- Refreshed the current-state and handoff docs so they point to Render instead of Railway

### Files
- `package.json`
- `render.yaml`
- `docs/context/CURRENT_STATE.md`
- `docs/context/HANDOFF.md`
- `docs/context/DECISIONS.md`
- `docs/context/TASK_BOARD.md`
- `docs/context/WORKLOG.md`
- `docs/context/REVIEW_LOG.md`

### Verification
- Ran `npm run build:server`
- Ran `npm run test:server`
- Ran `npm run build`
- Verified locally that `node dist-server/index.js` on `PORT=4100` serves:
  - `GET /api/health`
  - `GET /`
- Confirmed `git ls-remote https://gitee.com/wqxzst/wqx_code` succeeds, so the current remote is publicly readable

### Notes
- No live Render deployment was created in this session because no Render account/API key/session was available locally
- The active monorepo-aware Render config now lives in `render.yaml`

## 2026-03-26

### Task: attempt Render resource provisioning with a provided API key
- Verified the provided Render API key by listing owners/workspaces successfully
- Confirmed the current workspace has no existing services or Postgres databases
- Attempted to create a free Render Postgres instance for the demo
- The create-database API call returned HTTP `402 Payment Required`, so the fully automated API path is currently blocked for free provisioning in this workspace
- Updated the handoff/current-state files so the next step is the Render Dashboard flow instead of more blind API retries

### Files
- `docs/context/CURRENT_STATE.md`
- `docs/context/HANDOFF.md`
- `docs/context/TASK_BOARD.md`
- `docs/context/WORKLOG.md`
- `docs/context/REVIEW_LOG.md`

### Verification
- Ran authenticated Render API calls:
  - `GET /v1/owners`
  - `GET /v1/services`
  - `GET /v1/postgres`
  - `POST /v1/postgres`
- Confirmed the public repo remains reachable with `git ls-remote https://gitee.com/wqxzst/wqx_code`

### Notes
- The provided Render API key must not be written to files or reused outside this deployment task
- Because the API key was shared in chat, rotating it after deployment is recommended

## 2026-03-26

### Task: implement the Agent intelligent-query bonus feature and close the first review findings
- Added a protected backend Agent route under `server/agent/` that accepts a natural-language question and returns a structured result
- Wired the Agent behind the existing auth session so only logged-in users can query it
- Integrated an OpenAI-compatible planner path using `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`, and `OPENAI_TIMEOUT_MS`
- Added a deterministic fallback planner so supported demo questions still work when OpenAI is unavailable
- Added a floating Agent launcher plus drawer UI in the existing workbench
- Added `Client.createdAt` so time-range client-count questions can be answered from real fields instead of hard-coded copy
- Manual review found and fixed two correctness issues after the initial implementation:
  - fallback follow-up parsing originally ignored explicit `本月/上个月` phrases unless the user asked `最近`
  - month matching originally relied on timezone-sensitive parsing of `YYYY-MM-DD`
- Updated the compressed context and design docs so the project memory reflects that Agent is now implemented

### Files
- `server/agent/*`
- `server/app.ts`
- `server/config/env.ts`
- `server/agent/agent.routes.test.ts`
- `server/agent/queryExecutor.test.ts`
- `src/domain/client.ts`
- `src/mock/clients.ts`
- `src/features/agentQuery/*`
- `src/services/agentQueryService.ts`
- `src/app/WorkspaceShell.tsx`
- `src/styles/global.css`
- `package.json`
- `tsconfig.server.json`
- `.env.example`
- `.gitignore`
- `server/data/users.json`
- `DESIGN.md`
- `docs/context/*`

### Verification
- Ran `npm run test:server`
- Ran `npm run build`
- Verified with compiled server in fallback mode that:
  - a logged-in user can call `POST /api/agent/query`
  - `张总上个月有哪些跟进记录？` applies `时间范围=上个月`
  - the fallback result returns `records.length = 0`
- Verified with the provided OpenAI-compatible gateway that:
  - `张总持有哪些债券型产品？` succeeded
  - `plannerSource` returned `openai`

### Notes
- The Agent currently answers against the static business snapshot built from `src/mock/*`
- The Render online demo still needs Dashboard-side setup because the free Postgres API path returned HTTP `402`
- The OpenAI API key was shared in chat and should be rotated after this session

## 2026-03-26

### Task: fix Agent query `NOT_FOUND` caused by stale compiled server output
- Reproduced that the latest source code does register `/api/agent/query` correctly
- Traced the reported `NOT_FOUND` risk to stale root-level files left behind in `dist-server/` after the server build layout changed
- Confirmed that `dist-server/app.js` was an old compiled app without the Agent route, while `dist-server/server/app.js` was the current one
- Updated `build:server` to clear `dist-server` before compiling so old entrypoints do not survive and accidentally boot an outdated backend
- Added a clearer frontend error message when the Agent endpoint returns `404`, so the UI now tells the user to restart the backend or deploy the latest version

### Files
- `package.json`
- `src/services/agentQueryService.ts`
- `docs/context/CURRENT_STATE.md`
- `docs/context/HANDOFF.md`
- `docs/context/WORKLOG.md`
- `docs/context/REVIEW_LOG.md`

### Verification
- Ran `npm run build:server`
- Confirmed `dist-server/index.js` no longer exists after the build
- Confirmed `dist-server/server/index.js` still exists
- Verified with the compiled server that an authenticated `POST /api/agent/query` returns HTTP `200`

### Notes
- The practical failure mode was most likely running an outdated compiled entrypoint instead of the current `dist-server/server/index.js`

## 2026-03-26

### Task: converge Agent to a pure Mock implementation with visible parsing trace
- Removed the OpenAI-compatible provider branch from the Agent runtime path and kept a single Mock planner
- Kept the protected `/api/agent/query` route plus deterministic executor against the static business snapshot
- Added a `trace` payload so the UI can show normalized question, matched intent, matched entities, and applied rules
- Updated the Agent drawer copy and badge from `OpenAI/Fallback` to `Mock Agent`
- Removed `OPENAI_*` fields from `.env.example`
- Updated `DESIGN.md` and the compressed context files so the latest architecture narrative matches the code again

### Files
- `server/agent/agent.types.ts`
- `server/agent/queryPlanner.ts`
- `server/agent/agent.service.ts`
- `server/config/env.ts`
- `server/agent/agent.routes.test.ts`
- `src/features/agentQuery/types.ts`
- `src/features/agentQuery/AgentQueryPanel.tsx`
- `src/app/WorkspaceShell.tsx`
- `src/styles/global.css`
- `.env.example`
- `DESIGN.md`
- `docs/context/*`

### Verification
- Ran `npm run test:server`
- Ran `npm run build`
- Confirmed the protected Agent route now returns `plannerSource=mock`
- Confirmed the holdings query test also returns `trace.matchedIntent = 客户持仓查询`

### Notes
- The Agent still executes against the static business snapshot derived from `src/mock/*`
- No delegated reviewer-agent pass was run in this conversation because no explicit user authorization for sub-agent delegation was given

## 2026-03-27

### Task: remove Render deployment code and refactor the project for Vercel
- Removed the Render deployment config and `serve:render` startup path
- Added `vercel.json` with the repo-level Vercel build/output settings
- Added `api/[...route].ts` as the Vercel catch-all API handler
- Removed Express static-asset hosting and converted the server to an API-only runtime shape
- Removed the server-side `webDistDir` config and updated auth/agent tests to match the API-only runtime
- Added an automated regression test that verifies the Vercel catch-all handler exposes `/api/health`
- Updated `DESIGN.md` and the compressed context files so project memory now points to Vercel instead of Render
- Attempted to start a Vercel Dashboard automation flow, but local browser automation could not launch a usable signed-in session in this environment
- Attempted to fall back to the Vercel CLI, but no usable local CLI/authenticated session was available

### Files
- `api/[...route].ts`
- `api/vercel.entry.test.ts`
- `package.json`
- `server/app.ts`
- `server/config/env.ts`
- `server/auth/auth.routes.test.ts`
- `server/agent/agent.routes.test.ts`
- `tsconfig.server.json`
- `vercel.json`
- `DESIGN.md`
- `docs/context/*`

### Verification
- Ran `npm run test:server`
- Ran `npm run build`
- Ran `cmd /c "set VERCEL_ENV=preview&&npm run build:vercel"`
- Verified that the compiled `dist-server/api/[...route].js` export is a callable handler
- Verified that preview-mode `build:vercel` exits successfully and skips Prisma migrate/seed

### Notes
- Actual public deployment remains a Dashboard-side step because this environment could not complete an authenticated Vercel session

## 2026-03-27

### Task: add automated coverage for the Vercel DB deploy gate
- Refactored `scripts/vercel-db-deploy.cjs` into a small testable core while preserving the CLI entrypoint
- Added direct regression coverage for preview skip, production run, forced run, migrate failure, seed failure, and missing child-process status fallback
- Wired the new script test into `npm run test:server`
- Re-ran preview-mode `build:vercel` to confirm Prisma migrate/seed is still skipped outside production

### Files
- `scripts/vercel-db-deploy.cjs`
- `scripts/vercel-db-deploy.test.cjs`
- `package.json`
- `docs/context/CURRENT_STATE.md`
- `docs/context/TASK_BOARD.md`
- `docs/context/HANDOFF.md`
- `docs/context/WORKLOG.md`
- `docs/context/REVIEW_LOG.md`

### Verification
- Ran `node --test scripts/vercel-db-deploy.test.cjs`
- Ran `npm run test:server`
- Ran `cmd /c "set VERCEL_ENV=preview&&npm run build:vercel"`

### Notes
- The remaining highest-value external step is still Vercel Dashboard publication
- The most obvious remaining internal automated-test gap is dashboard aggregation and refresh-state coverage
