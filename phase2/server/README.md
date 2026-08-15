# AI Graphics Editor Server — Phase 5

Node.js + Express + MongoDB backend using ES Modules.

## Phase 5 additions

- Asset MongoDB model
- Authenticated asset listing/deletion
- Persistent image upload records
- Image dimensions and MIME metadata
- Asset ownership by user
- Safe deletion protection when an asset is used by a saved design
- Existing `/uploads` persistent file serving

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

The server expects MongoDB and the existing authentication environment variables.
