# API Key Limits

Each API key can have its own credit limit, so one key, such as one shop or one integration, cannot spend the whole account's balance. The account's own balance and overage still apply on top of it.

## Setting a limit

When you create a key in the ImagenHub app under **API Keys**, choose its **Credit limit**: 100, 500 or 1,000 credits, a custom amount, or **No limit**. A custom limit is a whole number of credits from 1 to 1,000,000,000.

Then choose how often the limit resets with **Reset limit every**. The reset is chosen once, when the key is created, and can't be changed later:

| Reset | The count starts again from zero |
|-------|----------------------------------|
| Never | never: the limit is a total for the key's whole life |
| Day | every day at 00:00 UTC |
| Week | every Monday at 00:00 UTC |
| Month | on the 1st of every month at 00:00 UTC |

Resets follow the calendar in UTC, not the time the key was made: a daily key made at 18:00 UTC starts again six hours later.

## Editing a limit

Press **Edit** next to a key to change its name or credit limit at any time. Its reset and expiration stay as they were when the key was created; for a different reset, create a new key.

- Raising or clearing the limit lets the key's requests through again at once. What the key has used so far this period still counts.
- Setting a limit on a key that had none starts its count from zero.

## How usage is counted

A run counts against its key from the moment it is charged, when it starts, as it does against the account's balance:

- A run that fails is not counted: its credits go back to the key, as they go back to the balance.
- The post-processing steps of a template run, and the steps of a workflow run started with the key, count against the same key.
- A run that fails over to a fallback, or is charged a BYOK fee when it succeeds, counts what it is charged.

The API keys list shows each key's credits used against its limit in the current period, and when it resets.

## When a key reaches its limit

A request that would take the key past its limit is refused before it starts, and nothing is charged. The response is `403` with a [`key-limit-reached`](/errors/key-limit-reached) problem that gives the key's limit, what it has used, what the run would cost, and when the key works again.

A key at its limit is refused even for a run that would cost nothing when it starts, such as one on your own provider key.

If the account's balance cannot cover the run either, the [`insufficient-credits`](/errors/insufficient-credits) error comes first.

### Why the last request can go slightly over

A request that is already running when the key reaches its limit is allowed to finish, and what it is charged on the way still counts: a fallback it fails over to, or the BYOK fee taken when it succeeds. So a key can end its period slightly over its limit. Requests sent at the same moment are checked one at a time, so they cannot all take the last credits.

The post-processing steps of a template run and the steps of a workflow are checked as each one starts. A post-processing step the key cannot cover is skipped, and the run delivers the image it has made so far; a workflow step fails, as one the balance cannot pay for does.

## Checking a key

`GET /ping` with the key returns its limit and what it has used this period:

```bash
curl https://api.imagenhub.ai/api/ping \
  -H "Authorization: Bearer sk_igh_YOUR_KEY"
```

```json
{
  "message": "pong",
  "key": {
    "name": "Shop A",
    "credit_limit": 1000,
    "credits_used": 120,
    "credits_remaining": 880
  },
  "user": { "tier": "paid" }
}
```

`credit_limit` and `credits_remaining` are `null` for a key with no limit.
