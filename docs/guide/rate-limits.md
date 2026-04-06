# Rate Limits & Credits

ImagenHub uses two systems depending on your tier: rate limits for free accounts and credits for paid accounts.

## Free tier

Free accounts have per-minute and per-day request limits. When exceeded, you receive a `429` response:

```json
{
  "error": {
    "type": "rate_limit_exceeded",
    "message": "Rate limit exceeded for minute window."
  }
}
```

Check the `Retry-After` header for when you can retry.

### Rate limit headers

Every response includes rate limit information:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit-Minute` | Max requests per minute |
| `X-RateLimit-Remaining-Minute` | Remaining requests this minute |
| `X-RateLimit-Limit-Day` | Max requests per day |
| `X-RateLimit-Remaining-Day` | Remaining requests today |

## Paid tier (credits)

Paid accounts have no rate limits. Instead, each request deducts credits based on the model-provider cost:

| Header | Description |
|--------|-------------|
| `X-Credits-Used` | Total credits used by this API key |
| `X-Credits-Remaining` | Remaining credits (or `"unlimited"`) |

When credits run out, you receive a `402` response:

```json
{
  "error": {
    "type": "credit_limit_exceeded",
    "message": "Credit limit exceeded for this API key.",
    "credit_limit": 1000.00,
    "credits_used": 1000.00,
    "resets_at": "2026-04-01T00:00:00+00:00"
  }
}
```

## Credit cost

Each model-provider combination has a fixed per-request cost. Check the `cost` field on model providers:

```bash
curl https://api.imagenhub.ai/api/model-providers
```

```json
{
  "data": [
    {
      "provider": { "name": "OpenAI" },
      "ai_model": { "name": "dall-e-3" },
      "cost": "0.040000"
    }
  ]
}
```

## BYOK and credits

When using [your own provider keys](/guide/byok), the cost to the provider is charged to your provider account directly. ImagenHub credit deduction may still apply depending on your plan.

## Checking your balance

Use the `/ping` endpoint to check your current credit status:

```bash
curl https://api.imagenhub.ai/api/ping \
  -H "Authorization: Bearer sk_live_YOUR_KEY"
```
