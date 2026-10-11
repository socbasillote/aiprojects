# API surface

- `GET /api/health` — service health.
- `GET /api/posts` — list posts for the workspace identified by the temporary `x-workspace-id` development header.
- `POST /api/posts` — create a draft or queued post. Body: `{ caption, platforms, mediaUrl?, scheduledAt?, timezone? }`.
- `PATCH /api/posts/:id` — update an authorized post.

All production endpoints must require a verified Supabase Auth session and workspace membership before release.
