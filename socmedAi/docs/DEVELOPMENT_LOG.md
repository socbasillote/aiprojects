# Development log

## 2026-10-11

- Inspected the workspace: `socmedAi` was an empty client/server scaffold; Node 22.14.0 and Git 2.47.0 are available. The local npm launcher currently fails because the host restricts access to `C:\Users\Aspire`; dependency installation therefore remains to be run in an approved developer environment.
- Added npm workspaces, strict TypeScript configuration, shared Zod contracts, Express API, Mongoose Post model, responsive React/Vite shell, dashboard, and manual post composer.
- Added development fallback memory repository only when `MONGODB_URI` is absent. This is not durable and is not suitable for staging or production.
- Installed 247 workspace packages. `npm run typecheck`, `npm run build`, and `npm test` pass. Vite produced the web bundle and the API/shared packages compiled.
- npm audit reports 8 dependency advisories (5 moderate, 1 high, 2 critical) and should be reviewed before deployment; no `--force` remediation was applied.
- Not yet verified at initial bootstrap: Cloudinary, managed Redis/BullMQ, or real social publication.
- Phase 1 bootstrap completed: ESLint, Prettier, environment templates for development/staging/production, API service client, and a live dashboard health indicator were added.
- Phase 1 verification: `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test` all pass. The API health endpoint is covered by Supertest; the web bundle calls `/api/health` through the Vite proxy.
- Phase 2 completed: React Router routes, responsive sidebar/topbar, workspace selector, profile and notification menus, breadcrumbs, auth routes, reusable feedback components, confirmation dialog, toast system, loading/error/empty states, posts list, and functional section pages were added. Phase 2 verification passes lint, typecheck, build, and tests.
- Phase 3 implementation is present but not accepted as complete: Supabase Auth middleware, protected routes, profile/workspace persistence, role checks, MongoDB pooling/lifecycle/index synchronization, all requested models, and workspace-scoped repositories are implemented.
- Verification: typecheck/build/tests pass; compiled inspection finds all 13 models with timestamps and indexes; production-like requests without auth return 401; development-mode workspace A/B isolation returns one post for A and zero for B; invalid MongoDB URIs log a safe error and the API remains alive.
- Live credential verification: MongoDB Atlas connected successfully, synchronized indexes, and returned `database: connected` from `/api/health`. Unauthorized and invalid bearer requests returned 401. A valid Supabase user session and two real workspace memberships are still required to prove authenticated user/profile flow and cross-workspace isolation end to end.
- Authentication provider migration: Clerk dependencies and flows were replaced with Supabase Auth browser sessions and server-side `auth.getUser(jwt)` verification. MongoDB application data remains unchanged.
