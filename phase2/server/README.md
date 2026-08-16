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

## PayPal credit purchases

The app supports one-time AI credit purchases through PayPal Checkout.

### Sandbox setup

1. Create a PayPal Developer account and a sandbox REST app.
2. Copy the sandbox Client ID and Secret into `server/.env`:

```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_ENVIRONMENT=sandbox
```

3. Restart the server.
4. Log into the app and use **Add credits** from the AI Designer or dashboard.
5. Select a package and complete checkout with a PayPal sandbox buyer account.

Packages currently configured by the server:
- 20 credits — $5.00 USD
- 50 credits — $10.00 USD
- 120 credits — $20.00 USD

The client never receives the PayPal secret. The server creates and captures PayPal Orders v2, verifies the completed capture amount/currency, and adds credits only after successful server-side verification.

For production, change `PAYPAL_ENVIRONMENT=live` and use the live REST app credentials. Test the complete flow in PayPal Sandbox first.


## Phase 11 security hardening

- Authentication uses an HttpOnly SameSite session cookie; Bearer tokens remain accepted for backward compatibility.
- CORS is restricted to `CLIENT_ORIGIN`.
- Helmet security headers are enabled.
- Authentication, AI, upload, and billing endpoints are rate limited.
- Request validation errors are returned without exposing server stack traces.
- Uploads are size-limited and raster images are checked against file signatures; SVG uploads are sanitized.
- AI design/image operations are validated server-side and AI-generated asset URLs are restricted to local uploaded assets.
- Payment credits are added only after server-side PayPal verification.
- Production requires a 32+ character JWT secret and an HTTPS client origin.
