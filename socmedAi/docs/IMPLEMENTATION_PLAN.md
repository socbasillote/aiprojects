# Storm implementation plan

1. Bootstrap the workspace, shared contracts, API, and responsive application shell.
2. Replace the development workspace identity with Supabase Auth verification and add MongoDB Atlas models for users, workspaces, membership, brands, accounts, media, publications, and activity.
3. Add Cloudinary signed uploads and Sharp branding jobs.
4. Add social provider adapters, beginning with Facebook Pages, Instagram professional accounts, and LinkedIn.
5. Add BullMQ + managed Redis worker, durable scheduled publications, retries, reconciliation, and idempotency.
6. Add FullCalendar, Content Studio, AI providers, observability, automated tests, and deployment checks.

Phase 0 and the first vertical slice are implemented. Remaining phases are configuration-dependent and tracked in `DEVELOPMENT_LOG.md`.
