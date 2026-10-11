# Architecture

The repository is an npm workspace monorepo. `apps/web` is a Vite React client. `apps/api` is an Express API with a Mongoose persistence boundary and will host background worker code separately. `packages/shared` owns Zod request contracts and shared domain types.

The API is workspace-scoped on every post query. MongoDB Atlas is the durable source of truth; managed Redis/BullMQ is an execution queue only. Social integrations should implement a common adapter interface so OAuth and provider-specific constraints do not leak into the composer. Media binaries belong in Cloudinary, with only ownership, metadata, and asset references in MongoDB.

Authentication is deliberately isolated from business routes. The current development slice uses a demo workspace fallback; production verifies Supabase Auth bearer tokens before protected routes and authorizes membership roles at the repository boundary.
