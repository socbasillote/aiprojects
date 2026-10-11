# Environment setup

Required production services: MongoDB Atlas, managed Redis, Supabase Auth, Cloudinary, managed Node hosting, managed frontend hosting, and approved social developer applications. Copy `.env.example` to an environment-specific secret store; never commit `.env`.

`MONGODB_URI` and `REDIS_URL` must use managed services outside production. `WEB_ORIGIN` must be an explicit allowlisted origin. Supabase, Cloudinary, and AI credentials are configuration-dependent; never expose service-role or provider secrets in the browser. Configure separate values for development, staging, and production, and use a restricted MongoDB database user and narrow Atlas network rules.

For Supabase Auth, set backend `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, plus frontend `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The browser uses Supabase Auth for registration, login, persisted sessions, and logout. The API verifies bearer tokens server-side with `supabase.auth.getUser(jwt)` and then resolves workspace membership from MongoDB. Never expose a Supabase service-role key in the browser. `DEV_AUTH_BYPASS=true` is permitted only for local development and must remain false in staging and production.
