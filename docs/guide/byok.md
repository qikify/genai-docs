# Bring Your Own Keys

ImagenHub supports BYOK (Bring Your Own Keys) — store your own provider API keys and use them for direct provider pricing instead of ImagenHub's credit system.

## How BYOK works

1. You store an encrypted provider key via the API
2. When you submit a generation request, ImagenHub checks for your key first
3. If found, your key is used for the provider call
4. If not, ImagenHub's system key is used and credits are deducted

## Benefits

- **Direct pricing** from the provider (often cheaper at volume)
- **Higher rate limits** from your own provider account
- **Fallback** to ImagenHub keys if your key fails or isn't configured

## Storing a provider key

Provider key management uses JWT authentication (not API key auth):

```bash
# Store your OpenAI key
curl -X POST https://api.imagenhub.ai/api/provider-keys \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 1,
    "key": "sk-proj-YOUR_OPENAI_KEY"
  }'
```

One key per user per provider. Storing a new key for the same provider replaces the previous one.

## Listing provider keys

```bash
curl https://api.imagenhub.ai/api/provider-keys \
  -H "Authorization: Bearer JWT_TOKEN"
```

Keys are returned **masked** — you'll see `sk-proj-...abc` but never the full key.

## Removing a provider key

```bash
curl -X DELETE https://api.imagenhub.ai/api/provider-keys/1 \
  -H "Authorization: Bearer JWT_TOKEN"
```

Soft-deleted — the key is deactivated but preserved for audit purposes.

## Security

- All provider keys are **AES-256 encrypted** at rest
- Keys are decrypted only at request time for the provider call
- Full keys are never returned via the API
- Each key is scoped to a single user and provider
