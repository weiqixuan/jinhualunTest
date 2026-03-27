# Review Log

## Purpose
- Record each independent reviewer-agent pass after non-trivial code changes.

## 2026-03-24

### Scope
- `AGENTS.md`
- `RULES.md`
- `docs/context/*`

### Findings
- Medium: initial context files drifted on role/priority definitions
- Medium: file responsibilities and recovery order were not explicit enough

### Resolved
- Context file responsibilities and priority order were aligned
- Project guidance was updated to make the context workflow explicit

### Remaining Risks
- The mechanism still depends on disciplined updates after each non-trivial task

## 2026-03-24

### Scope
- `src/app/App.tsx`
- `src/features/clientManagement/*`
- `src/services/clientService.ts`
- `src/services/holdingService.ts`
- `src/services/followUpService.ts`
- `src/styles/global.css`

### Findings
- High: follow-up submit failure cleared user input and hid the failure from the form flow

### Resolved
- Follow-up submit now preserves form input on failure
- Failure is surfaced back to the form layer
- Default date generation was corrected for local timezone behavior

### Remaining Risks
- No automated UI coverage yet
- Build still had bundle-size warnings

## 2026-03-24

### Scope
- `src/styles/global.css`
- `src/features/productShelf/components/ProductFilters.tsx`
- `src/features/clientManagement/components/ClientFilters.tsx`

### Findings
- No findings

### Remaining Risks
- Sticky behavior depends on parent containers not introducing clipping/overflow changes later
- No automated UI coverage exists for sticky behavior

## 2026-03-24

### Scope
- `src/features/dashboard/*`
- `src/app/App.tsx`
- `src/styles/global.css`
- `webpack.config.js`
- touched Ant Design v6 API migration edits

### Findings
- Medium: manual refresh failure previously hid the last successful dashboard snapshot while leaving a stale refresh timestamp visible
- Low: dashboard aggregation and refresh-state logic still have no automated regression coverage

### Resolved
- Dashboard refresh failures now preserve the last successful snapshot
- Hero copy now labels the timestamp as the last successful refresh
- Warning state is separated from the first-load hard error path
- Follow-up re-review after the fix returned `No new findings`

### Remaining Risks
- No automated dashboard tests yet
- Bundle-size warnings remain:
  - initial entrypoint about `805 KiB`
  - async dashboard vendor chunk about `1.08 MiB`

## 2026-03-26

### Scope
- `server/*`
- `src/features/auth/*`
- `src/services/authService.ts`
- `src/app/App.tsx`
- `src/app/WorkspaceShell.tsx`
- `src/styles/global.css`
- `package.json`
- `webpack.config.js`

### Review Mode
- Manual review only in this session.
- Independent reviewer-agent pass was not executed because no separate delegated agent was used in this conversation.

### Findings
- No blocking correctness issue found in the final login/register/session flow.
- Low: auth storage uses a file-backed repository and is suitable only for local demo or single-process use.
- Low: the system currently mixes backend auth with frontend mock business data services, which is acceptable short-term but should be revisited if backend scope expands.

### Resolved
- Input validation is enforced at the auth API boundary with `zod`.
- Passwords are stored as hashes rather than plaintext.
- Session tokens are carried in an HttpOnly cookie rather than regular frontend storage.
- Guest bootstrap no longer produces expected-but-noisy 401 console errors because `GET /api/auth/me` now returns `200 { user: null }` for no-session cases.

### Remaining Risks
- No independent reviewer-agent pass exists yet for this auth extension.
- No automated frontend auth UI test exists yet; current runtime verification is manual browser smoke coverage.

## 2026-03-26

### Scope
- `package.json`
- `src/app/App.tsx`
- `src/features/auth/AuthPage.tsx`
- `src/styles/global.css`

### Review Mode
- Manual review only in this session.
- Independent reviewer-agent pass was not executed because no separate delegated agent was used in this conversation.

### Findings
- No blocking correctness issue found in the final startup flow after the bugfix.
- Low: first-render bootstrap still depends on a short retry window; if the backend stays unavailable, the page now degrades to a neutral service warning rather than a false login failure.

### Resolved
- `npm start` now launches both the auth server and the frontend client together.
- Guest first load no longer renders backend bootstrap failures as a login failure state.
- Register no longer hits a proxy 504 when the project is started through the default command.

### Remaining Risks
- No independent reviewer-agent pass exists yet for this bugfix.

## 2026-03-26

### Scope
- `prisma/*`
- `railway.json`
- `server/*`
- `package.json`
- `.env.example`
- `docs/context/*`

### Review Mode
- Manual review only in this session.
- Independent reviewer-agent pass was not executed because no separate delegated agent was used in this conversation.

### Findings
- No blocking correctness issue found in the deploy-ready auth/database/hosting path.
- Low: the production online-demo path depends on external Railway project setup and environment variables that were not available in this session.
- Low: local development still falls back to file storage when `DATABASE_URL` is absent; this is intentional for ergonomics but means local auth is not database-backed unless explicitly configured.
- Low: business data remains frontend mock data even though auth can now run on a real backend/database path.

### Resolved
- Added Prisma schema, migration, and idempotent seed logic for auth users.
- Added a Prisma-backed `UserRepository` path while keeping the auth service contract stable.
- Added production single-service Express hosting for static frontend assets and `/api/*`.
- Preserved JSON 404 semantics for unknown `/api/*` routes even when static hosting is enabled.
- Added Railway build, pre-deploy, start, and healthcheck config.
- Extended server tests to cover both auth behavior and production-shape static hosting behavior.

### Remaining Risks
- No public live demo URL was created in this session because Railway CLI/project access was not available.
- No independent reviewer-agent pass exists yet for this deployment-oriented auth upgrade.

## 2026-03-26

### Scope
- `package.json`
- `render.yaml`
- `docs/context/*`

### Review Mode
- Manual review only in this session.
- Independent reviewer-agent pass was not executed because no separate delegated agent was used in this conversation.

### Findings
- Medium: `render.yaml` originally lacked `rootDir`, which would make Render build from the monorepo root instead of `jinhualunCode`.
- Low: `build:server` originally reran `prisma generate`, which failed on Windows when another local process held the Prisma query engine DLL open.

### Resolved
- Added `rootDir: jinhualunCode` and a matching build filter to `render.yaml`.
- Removed the redundant `prisma generate` step from `build:server` while keeping explicit/manual Prisma generation available.
- Re-ran server build, server tests, full build, and a production-shape local smoke check successfully.

### Remaining Risks
- No public live demo URL was created in this session because no Render account/API key/session was available locally.
- The current remote is Gitee; manual public-repo deployment is possible, but provider-linked Render workflows may still require mirroring to GitHub/GitLab/Bitbucket.
- No independent reviewer-agent pass exists yet for this Render-alignment task.

## 2026-03-26

### Scope
- Render deployment attempt using the provided API key
- `docs/context/*`

### Review Mode
- Manual review only in this session.
- Independent reviewer-agent pass was not executed because no separate delegated agent was used in this conversation.

### Findings
- High: the authenticated Render API path is not currently sufficient to finish this deployment because creating a free Postgres instance returned HTTP `402 Payment Required`.
- Low: the Render API key was shared directly in chat, which increases the chance of accidental secret exposure compared with using a local environment variable or Dashboard session.

### Resolved
- Confirmed the Render API key is valid before taking any provisioning action.
- Avoided writing the API key into any project file.
- Stopped after the first concrete provisioning blocker instead of blindly creating partially configured resources.

### Remaining Risks
- The online demo is still not live until the user completes the remaining Dashboard-side setup or provides a deployment path that supports database provisioning.
- The API key should be rotated after this session because it was pasted directly into the conversation.
- No independent reviewer-agent pass exists yet for this deployment attempt.

## 2026-03-26

### Scope
- `server/agent/*`
- `src/features/agentQuery/*`
- `src/services/agentQueryService.ts`
- `src/domain/client.ts`
- `src/mock/clients.ts`
- `src/app/WorkspaceShell.tsx`
- `src/styles/global.css`
- `package.json`
- `tsconfig.server.json`
- `.env.example`
- `.gitignore`
- `server/data/users.json`
- `DESIGN.md`
- `docs/context/*`

### Review Mode
- Manual review only in this session.
- Independent reviewer-agent pass was not executed because no separate delegated agent was used in this conversation.

### Findings
- Medium: fallback follow-up parsing originally ignored explicit `本月/上个月` phrases unless the question also used `最近`, which could silently over-return records when OpenAI was unavailable.
- Medium: Agent month matching originally relied on `new Date("YYYY-MM-DD")`, which is timezone-sensitive and can shift month boundaries in some environments.
- Low: the Agent currently executes against static mock business data rather than a real business database, so it demonstrates capability but not full production data fidelity.
- Low: the provided OpenAI API key was shared directly in chat, which increases exposure risk compared with using a local environment variable or dashboard secret.

### Resolved
- Fallback follow-up parsing now preserves explicit `本月/上个月` intent.
- Month matching now extracts calendar year/month directly from date strings before comparing ranges.
- Added server regression coverage for the explicit last-month follow-up query path.
- Verified both the compiled-server fallback path and a real OpenAI-compatible planning path successfully.
- Avoided writing the OpenAI API key into project files.

### Remaining Risks
- No independent reviewer-agent pass exists yet for this Agent feature.
- No automated browser-level UI test exists yet for the floating Agent entry and drawer flow.
- The Agent still queries `src/mock/*`-derived business data, so a future backend data migration would need a new review pass.

## 2026-03-26

### Scope
- `package.json`
- `src/services/agentQueryService.ts`
- `docs/context/CURRENT_STATE.md`
- `docs/context/HANDOFF.md`
- `docs/context/WORKLOG.md`
- `docs/context/REVIEW_LOG.md`

### Review Mode
- Manual review only in this session.
- Independent reviewer-agent pass was not executed because no separate delegated agent was used in this conversation.

### Findings
- High: `dist-server/` retained stale root-level build outputs after the server compile layout changed, so starting `node dist-server/index.js` could boot an outdated backend without `/api/agent/query` and produce `NOT_FOUND`.
- Low: the frontend previously surfaced that 404 as a generic backend error instead of telling the user that the running backend was outdated.

### Resolved
- `build:server` now removes `dist-server` before compiling.
- Verified that `dist-server/index.js` no longer survives after the build while `dist-server/server/index.js` still does.
- Verified that the compiled backend serves authenticated Agent queries successfully.
- The frontend now maps Agent-route 404s to an actionable message telling the user to restart the backend or deploy the latest version.

### Remaining Risks
- No independent reviewer-agent pass exists yet for this bugfix.
- If an external environment is still pinned to an old build artifact or old image layer, it still needs a manual restart or redeploy.

## 2026-03-26

### Scope
- `server/agent/*`
- `server/config/env.ts`
- `src/features/agentQuery/*`
- `src/app/WorkspaceShell.tsx`
- `src/styles/global.css`
- `.env.example`
- `DESIGN.md`
- `docs/context/*`

### Review Mode
- Manual review only in this session.
- Independent reviewer-agent pass was not executed because no separate delegated agent was authorized in this conversation.

### Findings
- No blocking correctness issue found after converging the Agent to a Mock-only planner.
- Low: the Agent response contract changed by adding `trace` and fixing `plannerSource` to `mock`; any external consumer beyond the current frontend would need to update.
- Low: no browser-level automated test exists yet for the new “解析过程” card in the drawer UI.

### Resolved
- Removed the provider-dependent planner branch and aligned the runtime contract on a single `mock` source.
- Added response trace data so the Mock Agent behavior is now explainable in the UI rather than implied by warning text.
- Removed `OPENAI_*` sample env vars to avoid signaling a runtime dependency that no longer exists.
- Re-ran `npm run test:server` and `npm run build` successfully after the contract change.

### Remaining Risks
- No independent reviewer-agent pass exists yet for this Mock-only Agent convergence.
- The Agent still queries `src/mock/*`-derived business data, so a future backend data migration would need another review pass.

## 2026-03-27

### Scope
- `api/*`
- `scripts/vercel-db-deploy.cjs`
- `server/app.ts`
- `server/config/env.ts`
- `server/auth/auth.routes.test.ts`
- `server/agent/agent.routes.test.ts`
- `package.json`
- `vercel.json`
- `DESIGN.md`
- `docs/context/*`

### Review Mode
- Manual review plus independent reviewer-agent pass in this session.

### Findings
- Medium: the first Vercel refactor ran `prisma migrate deploy` and `db:seed` on every Vercel build, which would also affect preview deployments if a database was attached.
- Low: the first Vercel refactor covered `/api/*` but not the bare `/api` path, which could regress the JSON not-found contract for that endpoint.
- Low: the production/forced branch of the DB-deploy gate still lacks automated coverage.

### Resolved
- `build:vercel` now delegates DB deploy/seed to `scripts/vercel-db-deploy.cjs`.
- DB deploy/seed now runs only when `VERCEL_ENV=production` or `VERCEL_FORCE_DB_DEPLOY=1`.
- Added `api/index.ts` so bare `/api` is handled explicitly.
- Added automated coverage to verify the `/api` JSON not-found contract.
- Re-ran `npm run test:server`.
- Re-ran `cmd /c "set VERCEL_ENV=preview&&npm run build:vercel"` successfully.
- Independent reviewer-agent re-review reported no remaining blocking code-level finding.

### Remaining Risks
- Actual public deployment still requires a signed-in Vercel Dashboard or CLI session outside this environment.
- Bundle-size warnings remain.

## 2026-03-27

### Scope
- `scripts/vercel-db-deploy.cjs`
- `scripts/vercel-db-deploy.test.cjs`
- `package.json`
- `docs/context/*`

### Review Mode
- Manual review only in this session.
- Independent reviewer-agent pass was not executed because no explicit user authorization for delegation was given in this conversation.

### Findings
- No blocking correctness issue found after the deploy-gate refactor and coverage addition.
- Low: the automated tests validate deploy-gate behavior with an injected `spawnSync` and do not prove end-to-end success against a live PostgreSQL connection.
- Low: actual public deployment still depends on a signed-in Vercel Dashboard or CLI session outside this environment.

### Resolved
- Added direct automated coverage for preview skip, production run, forced run, and subprocess failure propagation in the Vercel DB deploy gate.
- Preserved the CLI entrypoint behavior by keeping `node scripts/vercel-db-deploy.cjs` as the runtime path.
- Re-ran preview-mode `build:vercel` to confirm the skip behavior still matches the deployment contract.

### Remaining Risks
- Live Vercel publication is still blocked on an authenticated external deployment session.
- Dashboard aggregation and refresh-state logic still lack targeted automated regression coverage.
- Bundle-size warnings remain.

## 2026-03-27

### Scope
- `api/[...route].js`
- `api/index.js`
- `api/vercel.entry.test.cjs`
- `package.json`
- `docs/context/*`

### Review Mode
- Manual review only in this session.
- Independent reviewer-agent pass was not executed because no explicit user authorization for delegation was given in this conversation.

### Findings
- High: the live Vercel runtime was loading both `api/[...route].js` and then transitive `server/app.js` as CommonJS while Vercel's API build path emitted ESM syntax, causing `FUNCTION_INVOCATION_FAILED` before `/api/health` or `/api/auth/me` could run.
- Low: the local `tsconfig.server.json` CommonJS output hid this problem because it differs from the Vercel API build path used in production.

### Resolved
- Replaced the Vercel API entry files with source `.js` wrappers that load `../dist-server/server/app.js`.
- Updated the regression test to exercise the source `.js` wrappers directly with `require`, matching the Node/Vercel load path.
- Re-ran `npm run build:server`, `npm run test:server`, and preview-mode `build:vercel` successfully.

### Remaining Risks
- The fix has been verified locally but still requires a new Vercel redeploy to validate the live runtime.
- Dashboard aggregation and refresh-state logic still lack targeted automated regression coverage.
- Bundle-size warnings remain.

## 2026-03-27

### Scope
- `api/auth/[...route].js`
- `api/agent/[...route].js`
- `api/vercel.entry.test.cjs`
- `docs/context/*`

### Review Mode
- Manual review only in this session.
- Independent reviewer-agent pass was not executed because no explicit user authorization for delegation was given in this conversation.

### Findings
- Medium: after the source `.js` API wrapper fix, the live deployment still returned a Vercel platform 404 for `/api/auth/me` while `/api/health` was already healthy, which suggests the remaining issue was at the Vercel route-matching boundary for multi-segment auth paths rather than inside the Express auth controller.

### Resolved
- Added explicit nested wrappers for `/api/auth/*` and `/api/agent/*`.
- Extended the local Vercel entry regression test to cover the guest-safe `GET /api/auth/me` path and the protected `POST /api/agent/query` path through those nested wrappers.
- Re-ran `npm run test:server` and preview-mode `build:vercel` successfully.

### Remaining Risks
- The fix has been verified locally but still requires a new Vercel redeploy to validate the live runtime.
- Dashboard aggregation and refresh-state logic still lack targeted automated regression coverage.
- Bundle-size warnings remain.
