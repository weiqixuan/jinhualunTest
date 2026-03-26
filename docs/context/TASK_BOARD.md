# Task Board

## Done
- Bootstrap `webpack + React + TypeScript` project
- Implement module 1 `Product Shelf`
- Rebuild module 1 UI on Ant Design
- Add and enforce the two-stage confirmation workflow
- Add and enforce independent reviewer pass after non-trivial code changes
- Create and adopt `docs/context/` context-compression workflow
- Implement module 2 `Client Management`
- Fix follow-up submit failure behavior in module 2
- Add sticky filters for module 1 and module 2
- Implement module 3 `Dashboard`
- Rework dashboard refresh failure behavior to preserve the last successful snapshot
- Improve webpack split strategy so dashboard vendor code stays async
- Remove touched Ant Design v6 deprecated-prop usage
- Write `DESIGN.md`
- Add post-P0 auth backend service with login, register, logout, and session restore
- Add frontend auth gate and login/register UI
- Add server-side auth tests
- Fix auth startup flow so `npm start` launches both backend and frontend
- Fix auth bootstrap messaging so guest first load does not show a fake login failure
- Add Prisma/PostgreSQL-ready auth persistence, migration, and seed support
- Add production single-service Express hosting for the built frontend and `/api/*`
- Add Render deployment config for an online demo target
- Align the Render config with the monorepo root and fix local `build:server` verification on Windows
- Extend server tests to cover static hosting behavior
- Implement initial Agent bonus feature with floating query entry and protected backend route
- Converge Agent to a Mock-only planner with visible parsing trace
- Remove Render deployment config and single-service hosting assumptions
- Add Vercel deployment config plus catch-all API function entry
- Add automated verification for the Vercel API entrypoint
- Add automated verification for the Vercel DB deploy gate

## Doing
- None

## Todo
- Create the actual Vercel project and Prisma Postgres database through the Dashboard flow
- Set Vercel environment variables and publish the public demo URL
- Confirm the final deployment source repo that Vercel should import from
- Decide whether the backend line stays auth-only or whether existing business data services should migrate behind `/api/*`
- Consider targeted automated tests for `src/features/dashboard/aggregateDashboard.ts`
- Consider targeted automated tests for dashboard refresh-state transitions
- Consider targeted automated tests for Agent query planner/executor edge cases beyond the current server smoke coverage
- Evaluate further bundle-size optimization if time budget allows

## Blocked
- Actual Vercel publication is blocked in this environment because there is no usable authenticated Vercel Dashboard/CLI session available to finish the external project creation step.
