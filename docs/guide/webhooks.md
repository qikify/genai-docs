# Webhooks

ImagenHub can POST to a URL you own instead of making you poll. Two different things travel out that way, and they are set up in two different places:

- **Task callbacks** tell you one generation finished. They answer a request you made, and they go to the URL that request nominated.
- **Account alerts** tell you something is wrong with your account that will keep generations failing until you act. Nobody asked for these; they arrive because a problem started. They go to the **alert channels** you configure, and an account can have several.

Both are retried on the same schedule, and a channel that points at your own server carries the same envelope and the same signature as a task callback, so one receiver can handle both.

## Task callbacks

In the portal, under **Webhooks**:

1. Copy your **signing secret**. Every delivery to your own server is signed with it, and verifying that signature is how you know a request came from us.
2. Set a **default webhook URL**. Results go here when a generation request does not name somewhere itself.

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

### Task callback payload

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

`type` is `task.succeeded` when the generation produced output and `task.failed` when it did not. A run whose post-processing failed still arrives as `task.succeeded`, because you did get an image; check `post_processing_status` to learn it is not the image you asked for.

`occurred_at` is when the task finished, not when the attempt was sent. After a retry backlog clears, a burst of events arrives at once and this is what tells them apart.

Every key is always present, `null` where it does not apply, so a statically typed receiver decodes one fixed shape.

## Account alerts

A task callback reports one generation. An alert reports a condition on the account itself, which persists until somebody fixes it and fails every request in the meantime.

### Alert channels

An alert channel is one destination, and an account can have up to **10** of them. Each channel holds its own URL and its own list of the events it wants, so a partner's server can take the failures it needs to retry while an ops group chat takes the account problems somebody has to act on.

Set them up in the portal under **Alerts**. Nothing is sent until you create a channel, and a channel receives only the events you tick on it.

Two kinds of destination:

| Kind | Receiver | Body | Authenticated by |
|---|---|---|---|
| **HTTP endpoint** | A program you wrote | The alert envelope below, unchanged | A Standard Webhooks signature, using your organization's signing secret |
| **Lark** | People, in a group chat | A message card you can edit | Lark's own signature, carried inside the body |

A channel's kind is fixed when you create it, because it decides the body format and the authentication scheme. To change it, delete the channel and make a new one.

If you configured account alerts before channels existed, your previous setup was carried over as a single HTTP endpoint channel named **Default endpoint**, pointing at the same URL with the same events and sending byte-identical bodies.

### What you can subscribe to

| Event | Reports | What clears it |
|---|---|---|
| `task.failed` | One generation ended without output. | Nothing. A failed generation is not a condition, so it never recovers. |
| `provider_key.insufficient_funds` | Your own key for a provider has no funds left, so generations routed there fail. | Topping up that provider account. Clears on the first generation that succeeds with the key. |
| `provider_key.invalid` | Your own key for a provider was rejected as invalid. | Replacing the key in the portal. Clears on the first generation that succeeds with it. |
| `credits.exhausted` | A generation was refused because your ImagenHub balance could not cover it. | Buying credits, or waiting for the monthly quota to renew. Clears on the next generation that is charged successfully. |

`task.succeeded` is deliberately not offered on a channel. Delivering the result of a working generation is what task callbacks are for, and a destination subscribed to it would be receiving a transcript rather than an alert.

Event types are permanent. New ones may be added, so treat an unfamiliar `type` as something to ignore rather than an error.

### Subscribing to `task.failed` does not change your callbacks

The two are separate, and configuring one has no effect on the other. A task callback goes to the URL that one request nominated, so a program can stop polling. A `task.failed` alert goes wherever your organization said, so a person finds out.

Configure both and one failed generation produces two deliveries with two different event ids. Correlate them on `data.task_id`.

The alert carries the task callback payload exactly as shown above, so `task.failed` means one thing however it reached you. Unlike the three account conditions, it has no `alert_key`, `opened_at` or `resolved_at`, because there is nothing to pair it with.

Two further differences from a callback, both deliberate:

- It fires for generations started in the portal, not only for API traffic.
- It does not fire for the individual steps of a post-processing chain, only for the generation you submitted.

### The alert envelope

An account condition uses the same envelope as a task callback, `id`, `type`, `occurred_at` and `data`, plus three keys that a one-off event has no use for:

| Key | Carries |
|---|---|
| `alert_key` | Names the condition, so the start and the end can be paired |
| `opened_at` | When the condition began |
| `resolved_at` | `null` while the problem is live; the moment it cleared once it has |

Branch on `type` as you already do: `task.*` carries the task payload, anything else carries this one.

`data` carries `provider` and `url` on the two provider key conditions, and `balance` and `url` on `credits.exhausted`. `url` always points at the page in the portal where you fix it.

### The firing and recovered pair

Every account condition is sent **twice over its life**, and not at all in between:

```
09:14   →  resolved_at: null            alert_key: provider_key:fal
           ↓
           400 generations fail over the next five hours.
           Nothing further is sent — one problem is one alert.
           ↓
14:30   →  resolved_at: "14:30:05Z"     alert_key: provider_key:fal
```

`alert_key` names the problem and is identical on both, so you can open an incident when `resolved_at` is null and close it when the same key comes back with a timestamp, without branching on the event type.

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

When it clears, with the same `type`, the same `alert_key` and the same `opened_at`:

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

### One event, one delivery per channel

A condition subscribed to by two channels produces two deliveries, each with its own `id` and its own `webhook-id`. They are two genuine messages rather than a duplicate, so a receiver you can reach both ways should not collapse them.

Deduplicate on `webhook-id`, which identifies one delivery and stays stable across its retries. To recognise the same underlying problem arriving by two routes, use `alert_key` for a condition and `data.task_id` for a failed generation.

### Two things worth knowing

**You are only told about problems a channel asked for.** An account with no channels receives nothing.

**A recovery only follows an alarm.** If a condition starts and clears before we ever told you, because no channel was subscribed at the time, you get neither event rather than a lone recovery.

### Custom headers

A channel can carry up to 10 extra headers, sent with every delivery, which is where a bearer token or an API key goes if your receiver sits behind one.

The headers we set ourselves cannot be overridden: `webhook-id`, `webhook-timestamp`, `webhook-signature`, `content-type`, `content-length` and `host`.

### Testing a channel

**Test alert channel**, on a saved channel in the portal, sends a sample message and shows you exactly what came back, including the status and body of a refusal. Nobody can drain a provider key on purpose to check their setup, so this is how you confirm a destination works before it matters.

A test carries `"test": true` at the top level of the body. A receiver that acts on alerts without a person in the loop should check that field and ignore anything carrying it.

Tests are not recorded, so they do not appear on the delivery board or move any count there.

## Lark channels

A Lark channel posts into a group chat through a [custom bot](https://open.larksuite.com/document/client-docs/bot-v3/add-custom-bot), so an account problem is seen by whoever is in the room rather than by a server at 2am.

Add a custom bot to the chat in Lark, then paste the webhook URL it gives you into a new channel. **Treat that URL as a password**: anyone holding it can post to the chat. It is stored encrypted, and the portal shows only enough of it afterwards to tell two bots apart.

If you switched on signature verification for the bot, put its signing secret on the channel too. We then send Lark's `timestamp` and `sign` fields inside the body, which is where Lark expects them. Standard Webhooks headers are not sent to a Lark channel; they would be ignored, and sending them would suggest Lark had verified something it had not.

Lark reports some failures inside an ordinary `200` response, carrying a non-zero `code`. We read that code rather than the status, so a message the bot rejected is recorded as a failure and retried. If alerts stop arriving in a chat that used to receive them, the usual causes are on the Lark side: the bot was removed from the group, its IP allowlist no longer matches, or its keyword rule no longer matches the message.

### Editing the card

A new Lark channel arrives with a message card that already works, so you can save it and be done. If you want your own layout, edit the body in the portal and build it with Lark's [message card builder](https://open.larksuite.com/document/tools-and-resources/message-card-builder).

The body is JSON with placeholders written as `{{VARIABLE}}`, substituted into string values before sending. There are no conditionals and no loops; every branch is resolved before the template sees it. **Reset to default** puts the shipped card back.

| Variable | Holds |
|---|---|
| `ALERT_TITLE` | One line naming what happened |
| `ALERT_DESCRIPTION` | A sentence saying what stopped working and what fixes it |
| `ALERT_STATE` | `firing` or `recovered`. A task failure is always `firing` |
| `ALERT_COLOR` | A Lark card header colour matching the state, `red` or `green` |
| `ALERT_TYPE` | The event type, such as `provider_key.insufficient_funds` |
| `ALERT_KEY` | The condition this belongs to, pairing a firing event with its recovery. Empty on a task failure |
| `ACCOUNT_NAME` | The organization the alert is about |
| `PROVIDER` | The provider involved. Empty where the alert is not about a provider key |
| `TASK_ID` | The generation that failed. Empty on alerts that are not about one generation |
| `TASK_MODEL` | The model it ran on |
| `TASK_ERROR` | What went wrong with it, in the provider's words |
| `OPENED_AT` | When the condition began, or when the generation failed |
| `RESOLVED_AT` | When it ended. Empty while it is still firing |
| `OCCURRED_AT` | When this particular event happened |
| `ACTION_URL` | A link to the page that fixes this |
| `ACTION_LABEL` | Suggested text for a button pointing at `ACTION_URL` |

## Verifying the signature

This covers task callbacks and any alert channel pointing at your own server. Lark channels are verified by Lark's own scheme, described above.

Deliveries follow the [Standard Webhooks](https://www.standardwebhooks.com/) specification, so you can verify with an off-the-shelf library rather than implementing our prose. Libraries exist for JavaScript, Python, Go, Ruby, Java, C#, Rust, Elixir and PHP.

Three headers carry the signature:

| Header | Contains |
|---|---|
| `webhook-id` | The delivery's id. Stable across every retry of the same delivery. |
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

Every channel pointing at your own server signs with your organization's secret, the same one task callbacks use, so adding a channel does not add a secret to manage.

During a secret rotation the header carries **two** signatures, one per live secret, so your integration keeps verifying whether or not it has picked up the new secret yet. Standard Webhooks libraries handle this for you.

## Delivery

**Retries.** A delivery is attempted up to six times until your endpoint accepts it:

| Attempt | Sent |
|---|---|
| 1 | immediately |
| 2 | 1 minute later |
| 3 | 5 minutes later |
| 4 | 30 minutes later |
| 5 | 2 hours later |
| 6 | 6 hours later |

That spans roughly eight and a half hours, so an endpoint down for a morning recovers without anyone intervening. Only a `2xx` counts as delivered. Anything else retries, including a redirect, which we do not follow. A Lark channel additionally needs the `code` in the response body to be zero.

**Duplicates.** Delivery is at-least-once, so the same delivery can arrive more than once. Deduplicate on `webhook-id`, which stays the same across every retry of it.

**Ordering.** Not guaranteed. A retried event can land after a later one.

**Do not depend on delivery.** Retry budgets run out and endpoints go down. `GET /api/tasks/{id}` is always the authoritative answer for a task, and the portal shows current account state.

## Responding

Answer quickly and do the work afterwards. We time out after **10 seconds**, and a slow endpoint reads as a failed delivery and gets retried.

Return `2xx` as soon as you have stored the event, then process it from your own queue.

## Checking deliveries

The portal's **Webhooks** page shows delivery counts and a failure rate for the last 24 hours, broken down by the host each delivery went to, which is the fastest way to answer "are my callbacks landing". Alert deliveries appear there alongside task callbacks. Channel tests do not, because they describe nothing that happened.
