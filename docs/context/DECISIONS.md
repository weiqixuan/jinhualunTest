# Decisions

## 2026-03-24

### Decision: use a requirement-first gated workflow
- Why:
  - the user wants every new module to go through analysis first, implementation plan second, and code only after two explicit confirmations
- Impact:
  - no new module should skip Phase 1 and Phase 2 output
  - code generation without the two approvals is a process violation

### Decision: keep project context in `docs/context/`
- Why:
  - large chat history is expensive and fragile
  - the user wants new sessions to resume from local logs instead of relying on full conversation history
- Impact:
  - every non-trivial task must update the context files
  - `CURRENT_STATE.md`, `TASK_BOARD.md`, and `HANDOFF.md` are the primary resume sources

### Decision: keep the existing tab-based workbench instead of adding routing
- Why:
  - module 1, module 2, and module 3 all belong to the same internal workspace
  - the user approved a single workbench instead of a route-heavy app shell
- Impact:
  - `src/app/App.tsx` remains the main entry point
  - page-level state stays local to each module

### Decision: use Ant Design as the stable open-source component library
- Why:
  - mature enterprise UI patterns
  - stable documentation and broad adoption
  - good fit for this internal asset-management sales tool
- Impact:
  - UI changes should stay within the Ant Design visual language unless there is a strong reason not to

### Decision: implement dashboard charts with `echarts` + `echarts-for-react`
- Why:
  - the user explicitly asked for a stable, widely used open-source chart/component option
  - the project needs business-readable charting rather than custom canvas work
- Impact:
  - dashboard chart rendering uses `ReactECharts`
  - dashboard aggregation stays in a dedicated feature-layer module instead of inside JSX

### Decision: dashboard data is derived from existing async services, not new global state
- Why:
  - the approved plan was to reuse `fetchProducts`, `fetchClients`, `fetchHoldings`, and `fetchFollowUps`
  - the project already separates domain data from the UI layer
- Impact:
  - dashboard data aggregation lives in `src/features/dashboard/aggregateDashboard.ts`
  - no new routing or global state library was introduced

### Decision: preserve last successful dashboard data when refresh fails
- Why:
  - clearing the dashboard after a failed manual refresh hides useful business context
  - reviewer flagged stale timestamp + empty snapshot behavior as misleading
- Impact:
  - refresh failures now show a warning while keeping the last known-good dashboard visible
  - the hero label explicitly says `last successful refresh`

### Decision: relax the custom webpack vendor grouping
- Why:
  - the previous forced single `vendors` group pulled the chart dependency into the initial entry bundle
  - lazy loading the dashboard tab alone was not enough under that split strategy
- Impact:
  - `webpack.config.js` now uses `splitChunks: { chunks: "all" }`
  - the dashboard vendor payload now stays async, reducing main entrypoint pressure
  - bundle-size warnings still remain and may need future work

### Decision: migrate touched Ant Design v6 deprecated props while implementing module 3
- Why:
  - local runtime verification showed avoidable console warnings
  - these were mechanical, low-risk updates
- Impact:
  - touched code now uses `variant="borderless"`, `variant="filled"`, `title`, and `orientation`

## 2026-03-26

### Decision: implement auth as a post-P0 extension instead of re-scoping the original demo
- Why:
  - the original PRD and RULES explicitly treat login/auth as out of first-version scope
  - the user later requested a backend service with login/register
  - keeping auth as a post-P0 extension preserves the original requirement narrative and avoids pretending it was part of the initial must-have scope
- Impact:
  - `DESIGN.md` and context files now describe auth as an incremental extension
  - the original product/client/dashboard P0 implementation remains valid and unchanged in scope

### Decision: use an auth-only backend first and keep business data services on the frontend mock layer for now
- Why:
  - the user asked to start with login/register, not a full backend migration
  - moving every domain service to the backend in the same task would expand the change surface too far
- Impact:
  - `server/` currently handles auth only
  - `src/services/productService.ts`, `clientService.ts`, `holdingService.ts`, and `followUpService.ts` still serve local mock data
  - the architecture is temporarily mixed and may need a later consolidation decision

### Decision: use JWT in an HttpOnly cookie for the demo auth session
- Why:
  - this keeps the token out of regular frontend JS state
  - it enables page refresh session restore without introducing a refresh-token system yet
  - it works cleanly with the local `/api` proxy in development
- Impact:
  - auth routes now set and clear a cookie
  - frontend auth bootstrap probes `GET /api/auth/me` instead of reading browser storage directly

### Decision: make `GET /api/auth/me` a guest-safe session probe
- Why:
  - the frontend needs a lightweight bootstrap check on first render
  - returning 401 for the expected guest case left noisy console errors in the browser during normal login-page loads
- Impact:
  - `GET /api/auth/me` now returns `200 { user: null }` when there is no active session
  - login/logout success and failure semantics remain explicit on the mutation endpoints

### Decision: make `npm start` launch both the auth server and the frontend client
- Why:
  - after the auth extension, starting only the webpack client produced proxy 504 failures for register/login unless the user separately started the backend
  - the default local entrypoint should match the expected demo usage
- Impact:
  - `npm start` now runs both `dev:server` and `dev:client`
  - local auth flows work from the default start command without extra manual setup

### Decision: separate auth bootstrap service errors from form submission failures
- Why:
  - an unavailable backend during first render was being shown as a misleading login failure state before the user submitted anything
  - concurrent startup can create a short bootstrap race even when both processes are started together
- Impact:
  - auth bootstrap now retries briefly before surfacing an issue
  - if bootstrap still fails, the page shows a neutral service warning instead of a fake login failure

### Decision: use Prisma + PostgreSQL as the online-demo auth persistence target
- Why:
  - the user asked for real database-backed auth and a deployable online demo
  - PostgreSQL is a better fit for the deployable online-demo path than file storage or single-node SQLite
  - Prisma gives typed access plus migration and seed tooling with low change surface against the existing `UserRepository` interface
- Impact:
  - auth persistence now has a deploy-ready database path under `prisma/*`
  - production/demo deployment should use `AUTH_STORAGE=prisma`
  - local development can still fall back to file storage when `DATABASE_URL` is absent

### Decision: serve the built React app from Express in production-shape environments
- Why:
  - the current auth flow uses HttpOnly cookies and relative `/api/*` calls
  - a single public origin removes unnecessary cross-origin and cookie complexity for the demo
  - the user asked for a runnable online demo, not only a local dual-process dev setup
- Impact:
  - `server/app.ts` now serves `dist/index.html` and static assets when the frontend build exists
  - API 404 handling remains JSON for `/api/*`
  - the Render web service can point one process at both the frontend and backend concerns

### Decision: switch the online-demo deployment target from Railway to Render
- Why:
  - the user explicitly changed the deployment preference from Railway to Render
  - Render free web services do not support a pre-deploy command, so migration/seed work must stay in the startup path for this lightweight deployment track
  - the repository is a monorepo rooted at `D:/wqxCode/wqx_code`, so the service configuration must declare `rootDir: jinhualunCode`
- Impact:
  - `railway.json` was removed and `render.yaml` is now the active deployment config
  - the Render service starts through `npm run serve:render`
  - the active deployment instructions now target Render resources instead of Railway resources

### Decision: stop running `prisma generate` inside `build:server`
- Why:
  - local verification on Windows failed when an already-running dev server held the Prisma query engine DLL open
  - the project already runs Prisma client generation on `postinstall`, and schema-specific regeneration can still be triggered explicitly with `npm run db:generate`
- Impact:
  - `npm run build:server`, `npm run test:server`, and `npm run build` no longer fail because of an avoidable Prisma engine file-lock during local verification
  - schema changes still require either a normal install lifecycle or an explicit `npm run db:generate`

### Decision: pin Prisma to the 6.x line for this task
- Why:
  - Prisma 7 changed datasource/config semantics in a way that would expand this task into broader tooling migration work
  - Prisma 6 satisfies the current deployable auth/database scope with less churn
- Impact:
  - `prisma` and `@prisma/client` are pinned to `^6.19.2`
  - future upgrade to Prisma 7 should be treated as a separate tooling task, not folded into auth delivery

### Decision: implement the Agent bonus feature as a query-only workbench extension
- Why:
  - the user asked for an intelligent query capability first, not a broader AI copilot redesign
  - a floating entry avoids disturbing the existing tab-based workbench information architecture
  - keeping the first Agent scope query-only limits risk while still demonstrating AI capability
- Impact:
  - the Agent entry lives in `src/features/agentQuery/AgentQueryLauncher.tsx`
  - there is no new top-level tab or route for Agent in this iteration
  - follow-up ideas such as assisted entry should be treated as later expansion work

### Decision: keep OpenAI access server-side and constrain model output to a query plan DSL
- Status:
  - superseded later on 2026-03-26 by the Mock-only Agent decision below
- Why:
  - the user provided an OpenAI-compatible gateway and wanted the project to stay deployable as an online demo
  - exposing the API key to the browser would widen the trust boundary unnecessarily
  - letting the model return a constrained plan is safer than letting it invent direct business answers
- Impact:
  - frontend submits only a natural-language question to `/api/agent/query`
  - backend calls the OpenAI-compatible `Responses API` and validates a JSON query plan
  - business results are executed deterministically against app data in `server/agent/queryExecutor.ts`
  - when OpenAI is unavailable, the app falls back to a local parser so the demo remains usable

### Decision: add `Client.createdAt` to support time-range client-count queries
- Why:
  - one of the target Agent questions is `上个月新增了几个客户？`
  - without a client creation timestamp, that question could not be answered honestly
- Impact:
  - `src/domain/client.ts` now includes `createdAt`
  - `src/mock/clients.ts` now carries explicit creation dates
  - the Agent executor can answer `client_count` queries using a concrete date field rather than a fabricated aggregate

### Decision: converge the Agent feature to a pure Mock implementation
- Why:
  - the latest user constraint explicitly requires not using a large model
  - the PRD already allows Mock Agent as a compliant implementation path
  - a deterministic, explainable Mock Agent is easier to demo and easier to defend in interview review than a provider-dependent branch
- Impact:
  - the OpenAI-compatible provider path and related `OPENAI_*` runtime config were removed
  - `server/agent/queryPlanner.ts` is now the single Mock planning path
  - `/api/agent/query` still returns structured results, but `plannerSource` is now always `mock`
  - the frontend drawer now renders a visible parsing trace for normalized question, matched intent, matched entities, and applied rules

## 2026-03-27

### Decision: switch the online-demo deployment target from Render to Vercel
- Why:
  - the user explicitly changed the deployment preference from Render to Vercel
  - Vercel can host the built frontend from `dist/` and the backend from a dedicated `/api` function boundary
  - this project already uses relative `/api/*` calls and Prisma/PostgreSQL auth, so the migration can stay small
- Impact:
  - `render.yaml` and `serve:render` were removed
  - `vercel.json` is now the active repo deployment config
  - `api/[...route].ts` is the Vercel catch-all API entrypoint
  - `server/app.ts` is now API-only and no longer serves `dist/` static files
  - Vercel deployment must use `Root Directory = jinhualunCode`

### Decision: use Prisma Postgres as the lowest-churn Vercel database option
- Why:
  - the project already uses Prisma ORM and reads `DATABASE_URL`
  - the Vercel Marketplace integration for Prisma Postgres matches the existing auth persistence path with minimal code change
- Impact:
  - the recommended Vercel database path is Prisma Postgres
  - production auth still requires `AUTH_STORAGE=prisma`
  - `build:vercel` assumes a reachable PostgreSQL database so migrations and seed can run during build
