# Authentication

ImagenHub uses two authentication methods depending on the context.

## API Key Authentication

For programmatic access, use Bearer token authentication with your API key:

```bash
curl https://api.imagenhub.ai/api/ping \
  -H "Authorization: Bearer sk_live_YOUR_KEY"
```

API keys come in two types:

| Type | Prefix | Purpose |
|------|--------|---------|
| Live | `sk_live_` | Production use, credits are deducted |
| Test | `sk_test_` | Testing, no charges applied |

Create and manage API keys from the [dashboard](https://imagenhub.ai) or via the API keys endpoints (JWT auth required).

### Endpoints that accept API keys

Most public-facing endpoints use API key auth: `/ping`, `/process`, `/tasks/*`, `/providers`, `/analytics/*`.

## JWT Authentication

JWT tokens are used for dashboard and management operations — creating templates, managing API keys, and account settings.

### Login

```bash
curl -X POST https://api.imagenhub.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "you@example.com", "password": "your-password" }'
```

The response includes a Bearer JWT token. Include it in subsequent requests:

```bash
curl https://api.imagenhub.ai/api/templates \
  -H "Authorization: Bearer eyJhbGciOi..."
```

### Token refresh

JWT tokens expire. Use the refresh endpoint to get a new token:

```bash
curl -X POST https://api.imagenhub.ai/api/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOi..."
```

## OAuth

ImagenHub also supports OAuth login via Google, GitHub, and other providers. Redirect users to:

```
GET /auth/{provider}
```

After authentication, the callback at `/auth/{provider}/callback` issues a JWT token.

## Error responses

| Status | Meaning |
|--------|---------|
| `401`  | Missing or invalid authentication credentials |
| `402`  | Credit limit exceeded — top up or wait for reset |
| `429`  | Rate limited (free tier) — check `Retry-After` header |
