# Insufficient credits

`https://docs.imagenhub.ai/errors/insufficient-credits` · HTTP `403`

The account cannot cover the credit cost of the run. No task was created and nothing was charged.

## Example

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

## Fields

| Field | Meaning |
|-------|---------|
| `balance` | The account's credit balance when the request was made. Negative while overage is in use. |
| `cost` | What the requested run would have cost. |
| `overage_limit` | How far below zero the account may go. `0` means overage is off. |

## What to do

Do not retry the request unchanged; it fails the same way until the balance changes. Top up, start a plan, or raise the overage limit in the ImagenHub app, then resend.

Credit costs per model are listed on each model's providers. See [Rate Limits & Credits](/guide/rate-limits).

## Where it occurs

- `POST /process`
- `POST /run/{model_name}`
- `POST /run/sync/{model_name}`
