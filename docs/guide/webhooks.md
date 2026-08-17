# Webhooks

ImagenHub can POST to an endpoint you own instead of making you poll. Two kinds of event travel that channel:

- **Task callbacks** tell you one generation finished. They answer a request you made.
- **Account alerts** tell you something is wrong with your account that will keep generations failing until you act — a provider key out of funds, a balance that can no longer cover a request. Nobody asked for these; they arrive because a problem started.

Both are signed the same way, delivered to the same endpoint, and retried on the same schedule.

## Setting up

In the portal, under **Webhooks**:

1. Copy your **signing secret**. Every delivery is signed with it, and verifying that signature is how you know a request came from us.
2. Set a **default webhook URL**. Results go here when a generation request does not name somewhere itself.
3. Choose which **account alerts** you want. These are off until you turn them on, and they need a default URL — an account problem has no request of its own to answer, so there is nowhere else to send it.

A generation request can override the default per call:

```bash
curl -X POST https://api.imagenhub.ai/api/run/flux-schnell \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a red bicycle",
    "webhook_url": "https://your-app.example.com/hooks/imagenhub"
  }'
```

Sending `"webhook_url": null` suppresses the callback for that one generation, even when a default is set.

## Verifying the signature

Deliveries follow the [Standard Webhooks](https://www.standardwebhooks.com/) specification, so you can verify with an off-the-shelf library rather than implementing our prose. Libraries exist for JavaScript, Python, Go, Ruby, Java, C#, Rust, Elixir and PHP.

Three headers carry the signature:

| Header | Contains |
|---|---|
| `webhook-id` | The event's id. Stable across every retry of the same event. |
| `webhook-timestamp` | When this attempt was sent, as a Unix timestamp. |
| `webhook-signature` | One or more space-separated HMAC-SHA256 signatures. |

```js
import { Webhook } from 'standardwebhooks';

app.post('/hooks/imagenhub', express.raw({ type: 'application/json' }), (req, res) => {
  const wh = new Webhook(process.env.IMAGENHUB_WEBHOOK_SECRET);

  let event;

  try {
    // Verify against the raw body. Parsing first and re-serializing changes the
    // bytes, and the signature is over the bytes we sent.
    event = JSON.parse(wh.verify(req.body, req.headers));
  } catch {
    return res.sendStatus(400);
  }

  // Answer immediately and do the work afterwards — see Responding below.
  res.sendStatus(200);
  queue.push(event);
});
```

During a secret rotation the header carries **two** signatures, one per live secret, so your integration keeps verifying whether or not it has picked up the new secret yet. Standard Webhooks libraries handle this for you.

## What gets sent

| Event | Kind | Sent when |
|---|---|---|
| `task.succeeded` | Task callback | A generation finished and produced output. Also sent when a post-processing step failed but an image was still produced — check `post_processing_status`. |
| `task.failed` | Task callback | A generation ended without output. |
| `provider_key.insufficient_funds` | Account alert | One of your own provider keys was rejected for funds. Generations routed to that provider fail until you top it up. |
| `provider_key.invalid` | Account alert | One of your own provider keys was rejected as invalid. Generations routed to that provider fail until you replace it. |
| `credits.exhausted` | Account alert | Your balance can no longer cover a generation, so new requests are refused. |
| `subscription.past_due` | Account alert | A subscription payment did not go through. The account is suspended if it stays unresolved. |

Event types are permanent. New ones may be added, so treat an unfamiliar `type` as something to ignore rather than an error.

## Task callback payload

```json
{
  "id": "evt_9f0c1b2e-4a7d-4b1c-9e3a-2f5c7d8e1a0b",
  "type": "task.succeeded",
  "occurred_at": "2026-08-17T09:14:22+00:00",
  "data": {
    "task_id": "0198f2a1-6c33-7b0e-9d21-4c5e6f7a8b90",
    "url": "https://api.imagenhub.ai/api/tasks/0198f2a1-6c33-7b0e-9d21-4c5e6f7a8b90",
    "status": "success",
    "post_processing_status": null,
    "model": "flux-schnell",
    "output": ["https://cdn.imagenhub.ai/outputs/0198f2a1/0.png"],
    "error": null
  }
}
```

`occurred_at` is when the task finished, not when the attempt was sent. After a retry backlog clears, a burst of events arrives at once and this is what tells them apart.

Every key is always present, `null` where it does not apply, so a statically typed receiver decodes one fixed shape.

## Account alerts

Each alert reports a condition on your account. What `data` carries, and what clears it:

| Event | `data` carries | What went wrong | What clears it |
|---|---|---|---|
| `provider_key.insufficient_funds` | `provider`, `url` | Your own key for that provider has no funds left. | Top up that provider account. Clears on the first generation that succeeds with the key. |
| `provider_key.invalid` | `provider`, `url` | Your own key for that provider was rejected as invalid. | Replace the key in the portal. Clears on the first generation that succeeds with it. |
| `credits.exhausted` | `balance`, `url` | Your ImagenHub balance can no longer cover a generation, so requests are refused. | Buy credits, or wait for the monthly quota to renew. |
| `subscription.past_due` | `url` | A subscription payment did not go through. | Update the payment method. Clears when a payment succeeds. |

`url` always points at the page in the portal where you fix it.

### How an alert differs from a task callback

The envelope is the same — `id`, `type`, `occurred_at`, `data`, the same headers and the same signature — so one parser handles both. An alert adds three keys, because a condition that lasts needs what a one-off event does not:

| Key | Carries |
|---|---|
| `alert_key` | Names the condition, so the start and the end can be paired |
| `opened_at` | When the condition began |
| `resolved_at` | `null` while the problem is live; the moment it cleared once it has |

Branch on `type` as you already do: `task.*` is a callback, anything else is an alert.

### The firing and recovered pair

Every alert is sent **twice over its life**, and not at all in between:

```
09:14   →  resolved_at: null            alert_key: provider_key:fal
           ↓
           400 generations fail over the next five hours.
           Nothing further is sent — one problem is one alert.
           ↓
14:30   →  resolved_at: "14:30:05Z"     alert_key: provider_key:fal
```

`alert_key` names the problem and is identical on both, so you can open an incident when `resolved_at` is null and close it when the same key comes back with a timestamp — without branching on the event type.

When it starts:

```json
{
  "id": "evt_3c1a7f52-8b90-4d6e-a2f1-7b4c9e0d5a83",
  "type": "provider_key.insufficient_funds",
  "occurred_at": "2026-08-17T09:14:22+00:00",
  "alert_key": "provider_key:fal",
  "opened_at": "2026-08-17T09:14:22+00:00",
  "resolved_at": null,
  "data": {
    "provider": "fal",
    "url": "https://app.imagenhub.ai/settings/provider-keys"
  }
}
```

When it clears — same `type`, same `alert_key`, same `opened_at`:

```json
{
  "id": "evt_7d2e4a19-3f06-4c88-b5a7-1e9d0c3b6f42",
  "type": "provider_key.insufficient_funds",
  "occurred_at": "2026-08-17T14:30:05+00:00",
  "alert_key": "provider_key:fal",
  "opened_at": "2026-08-17T09:14:22+00:00",
  "resolved_at": "2026-08-17T14:30:05+00:00",
  "data": {
    "provider": "fal",
    "url": "https://app.imagenhub.ai/settings/provider-keys"
  }
}
```

`opened_at` stays at the moment the problem began, so the recovery tells you it lasted five hours without you having to remember when it started.

Because a delivery can be retried for hours, decide which is newer from `opened_at` and `resolved_at` rather than from the order they arrive in.

### Two things worth knowing

**You are only told about problems you subscribed to.** Alerts are off until you turn them on, per event type, in the portal.

**A recovery only follows an alarm.** If a condition starts and clears before we ever told you — because you had not subscribed, for instance — you get neither event, not a lone `recovered`.

## Delivery

**Retries.** A delivery is attempted up to six times until your endpoint answers `2xx`:

| Attempt | Sent |
|---|---|
| 1 | immediately |
| 2 | 1 minute later |
| 3 | 5 minutes later |
| 4 | 30 minutes later |
| 5 | 2 hours later |
| 6 | 6 hours later |

That spans roughly eight and a half hours, so an endpoint down for a morning recovers without anyone intervening. Only a `2xx` counts as delivered. Anything else retries, including a redirect — we do not follow them.

**Duplicates.** Delivery is at-least-once, so the same event can arrive more than once. Deduplicate on `webhook-id`, which stays the same across every retry of one event.

**Ordering.** Not guaranteed. A retried event can land after a later one.

**Do not depend on delivery.** Retry budgets run out and endpoints go down. `GET /api/tasks/{id}` is always the authoritative answer for a task, and the portal shows current account state.

## Responding

Answer quickly and do the work afterwards. We time out after **10 seconds**, and a slow endpoint reads as a failed delivery and gets retried.

Return `2xx` as soon as you have stored the event, then process it from your own queue.

## Checking deliveries

The portal's **Webhooks** page shows delivery counts and a failure rate per endpoint, which is the fastest way to answer "are my callbacks landing".
