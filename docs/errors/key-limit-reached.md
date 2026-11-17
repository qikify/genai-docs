# Key limit reached

`https://docs.imagenhub.ai/errors/key-limit-reached` · HTTP `403`

The API key has spent its credit limit for the period, or the run would take it past the limit. No task was created and nothing was charged.

## Example

```json
{
  "type": "https://docs.imagenhub.ai/errors/key-limit-reached",
  "title": "Key limit reached",
  "status": 403,
  "detail": "This API key has used 1,000 of its 1,000 credits this month. It resets at 2026-12-01T00:00:00Z.",
  "limit": 1000,
  "used": 1000,
  "cost": 10,
  "period": "monthly",
  "resets_at": "2026-12-01T00:00:00Z"
}
```

## Fields

| Field | Meaning |
|-------|---------|
| `limit` | The key's credit limit for each period. |
| `used` | Credits the key has spent in the current period. |
| `cost` | What the requested run would have cost. |
| `period` | How often the key's count starts again: `daily`, `weekly`, `monthly`, or `never` for a total over the key's life. |
| `resets_at` | When the count starts again and the key works again, in UTC. `null` when `period` is `never`. |

## What to do

Do not retry the request unchanged before `resets_at`; it fails the same way. Wait for the reset, use another key, or raise or clear the key's limit under **API Keys** in the ImagenHub app, which lets it through at once.

How limits reset and what counts against them is in [API Key Limits](/guide/api-key-limits).

## Where it occurs

- `POST /process`
- `POST /run/sync/{model_name}`
- `POST /batch/design/clone`
- `POST /batch/design/redesign`
