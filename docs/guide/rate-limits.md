# Rate Limits & Credits

ImagenHub uses two systems depending on your tier: rate limits for free accounts and credits for paid accounts.

## Free tier

Free accounts have two limits: a per-minute limit on every request, and a daily limit on `POST /process`.

### Per-minute limit

When exceeded, you receive a `429` response:

```json
{
  "error": {
    "type": "rate_limit_exceeded",
    "message": "Rate limit exceeded for minute window."
  }
}
```

Check the `Retry-After` header for when you can retry.

### Daily limit

A Free organization may make 20 requests a day to `POST /process`. The count belongs to the organization and starts again at 00:00 UTC. The request after the twentieth is answered with a `429` [`daily-limit-reached`](/errors/daily-limit-reached) problem and saved as a failed task, and nothing is charged. A subscription lifts the limit.

### Rate limit headers

Every response includes rate limit information:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit-Minute` | Max requests per minute |
| `X-RateLimit-Remaining-Minute` | Remaining requests this minute |

## Paid tier (credits)

Paid accounts have no rate limits. Instead, each request deducts credits based on the model-provider cost:

| Header | Description |
|--------|-------------|
| `X-Credits-Used` | Total credits used by this API key |
| `X-Credits-Remaining` | Remaining credits (or `"unlimited"`) |

When the balance cannot cover a run, the request is refused with `403` and an [`insufficient-credits`](/errors/insufficient-credits) problem:

```json
{
  "type": "https://docs.imagenhub.ai/errors/insufficient-credits",
  "title": "Insufficient credits",
  "status": 403,
  "detail": "Your current balance is 3 credits, but this run costs 10.",
  "balance": 3,
  "cost": 10,
  "overage_limit": 0
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
  -H "Authorization: Bearer sk_igh_YOUR_KEY"
```
