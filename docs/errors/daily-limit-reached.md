# Daily limit reached

`https://docs.imagenhub.ai/errors/daily-limit-reached` · HTTP `429`

The organization has made every request its plan allows today. The run was not processed and nothing was charged. It is saved as a failed task, so it appears in the task history with the same message.

## Example

```json
{
  "type": "https://docs.imagenhub.ai/errors/daily-limit-reached",
  "title": "Daily limit reached",
  "status": 429,
  "detail": "Daily limit reached. The Free plan allows 20 requests per day. This task was not processed and no credits were charged. The limit resets at 2026-10-02 00:00 UTC.",
  "task_id": "0199f0c2-8a3e-7c31-9f4d-2b6e1a5c7d90",
  "resets_at": "2026-10-02T00:00:00+00:00"
}
```

## Fields

| Field | Meaning |
|-------|---------|
| `task_id` | The failed task the refusal left behind. Read it with `GET /tasks/{id}`. |
| `resets_at` | When the day's count starts again, as an ISO 8601 time. Requests resume from then. |

## The limit

An organization on the Free plan, meaning one with no active subscription, may make 20 requests a day to `POST /process`. The count belongs to the organization, not to an account or an API key, and a day runs from 00:00 UTC to 00:00 UTC. An organization with an active subscription has no daily limit.

Every request to `POST /process` counts, including one that is then refused for invalid inputs or too few credits. Reading tasks does not count.

## What to do

Do not retry before `resets_at`; the request fails the same way until then. Subscribing to a paid plan lifts the limit at once.

The failed task fires the organization's failure alerts and the request's `webhook_url` like any other failed task, so a program that waits on callbacks hears about the refusal.

## Where it occurs

- `POST /process`
