# Quickstart

Generate your first image in under 5 minutes.

## 1. Get your API key

Sign up at [imagenhub.ai](https://imagenhub.ai) and create an API key from the dashboard. Keys look like:

```
sk_igh_abc123...
```

## 2. Test your key

Verify your key works and check your credit balance:

```bash
curl https://api.imagenhub.ai/api/ping \
  -H "Authorization: Bearer sk_igh_YOUR_KEY"
```

```json
{
  "message": "pong",
  "key": {
    "name": "My API Key",
    "type": "live",
    "credit_limit": 1000.00,
    "credits_used": 0,
    "credits_remaining": 1000.00
  },
  "user": { "tier": "paid" }
}
```

## 3. Browse available models

List all available image generation models:

```bash
curl https://api.imagenhub.ai/api/models
```

Each model includes an `input` JSON schema describing what parameters it accepts (prompt, size, style, etc.) and a list of `providers` with per-request cost.

## 4. Generate an image

Submit a generation request using a model ID:

```bash
curl -X POST https://api.imagenhub.ai/api/process \
  -H "Authorization: Bearer sk_igh_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": 1,
    "prompt": {
      "type": "string",
      "content": "A cat wearing a top hat, oil painting style"
    }
  }'
```

```json
{
  "data": {
    "id": "019d29c6-a50d-7340-a521-22ef5d1a4bb6",
    "status": "created",
    "model_id": 1,
    "input": { "prompt": "A cat wearing a top hat, oil painting style" },
    "output": null
  }
}
```

## 5. Get your result

Poll the task until `status` is `success`:

```bash
curl https://api.imagenhub.ai/api/tasks/019d29c6-a50d-7340-a521-22ef5d1a4bb6 \
  -H "Authorization: Bearer sk_igh_YOUR_KEY"
```

```json
{
  "data": {
    "id": "019d29c6-a50d-7340-a521-22ef5d1a4bb6",
    "status": "success",
    "output": [
      "https://cdn.imagenhub.ai/generated/abc123.png?signature=..."
    ]
  }
}
```

Output URLs are signed and valid for **1 hour**. Download or serve them immediately.

::: tip Prefer real-time updates?
Use [Server-Sent Events](/guide/image-generation#streaming) instead of polling:
```
GET /tasks/{id}/stream
```
:::

## Next steps

- [Authentication](/guide/authentication) — Learn about API keys and JWT tokens
- [Image Generation](/guide/image-generation) — Polling, streaming, error handling
- [Templates](/guide/templates) — Save and reuse generation presets
