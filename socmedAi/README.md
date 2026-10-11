# Storm

Storm is a React + Express social publishing workspace. The current implementation establishes a production-shaped vertical slice for the primary workflow: compose a manual post, save it as a draft, queue it for scheduling, and keep workspace-scoped post records behind an API boundary.

## Run locally

```powershell
cd socmedAi
npm install
Copy-Item .env.example .env
npm run dev:api
# in another terminal
npm run dev:web
```

The API is at `http://localhost:4000`, the Vite app at `http://localhost:5173`, and the health check is `/api/health`. Without `MONGODB_URI`, development uses a non-durable in-memory repository so the UI remains runnable; staging and production must configure MongoDB Atlas.

## Commands

`npm run typecheck` checks all workspaces. `npm run build` creates the web production bundle and API TypeScript output. `npm test` runs workspace tests.

## Security boundary

The demo workspace header is intentionally temporary. Before production, use Supabase Auth bearer verification and derive the workspace from authorized membership records. Provider tokens must remain backend-only. Social publishing is not claimed as verified until provider credentials, OAuth review, Cloudinary, and the worker are configured.

See `docs/` for architecture, implementation status, environment setup, social integration requirements, and the development log.
