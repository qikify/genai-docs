# Templates

Templates let you save and reuse image generation presets — a model, default inputs, and optional provider-specific overrides bundled into a single reusable ID.

## How templates work

A template stores:
- **Model** — Which AI model to use
- **Default inputs** — Pre-filled parameters (prompt prefix, size, style, etc.)
- **Extra input** — Provider-specific overrides keyed by provider name

When you call `/process` with a `template_id`, the template's defaults are merged with your request. Your values always take priority.

## Public vs private templates

| Type | `user_id` | Visibility |
|------|-----------|------------|
| Public | `null` | Available to all users — system-provided starting points |
| Private | Your user ID | Only you can view and use them |

## List templates

```bash
curl https://api.imagenhub.ai/api/templates \
  -H "Authorization: Bearer JWT_TOKEN"
```

Returns your private templates plus all public templates. Supports pagination and search:

```bash
# Search by name
curl "https://api.imagenhub.ai/api/templates?s=product photo"

# Page 2
curl "https://api.imagenhub.ai/api/templates?page=2"
```

## Get a template

```bash
curl https://api.imagenhub.ai/api/templates/019d29c5-9663-71c4-b698-9cbf898948d4 \
  -H "Authorization: Bearer JWT_TOKEN"
```

## Use a template

Pass `template_id` to `/process` instead of `model_id`:

```bash
curl -X POST https://api.imagenhub.ai/api/process \
  -H "Authorization: Bearer sk_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "019d29c5-9663-71c4-b698-9cbf898948d4",
    "prompt": { "type": "string", "content": "A red sneaker" }
  }'
```

The template's `default_inputs` are merged with your request body. If the template sets `size` to `1024x1024` and you don't override it, that default is used. If you pass your own `size`, yours wins.

## Example template structure

```json
{
  "id": "019d29c5-9663-71c4-b698-9cbf898948d4",
  "name": "Product Photo Enhancement",
  "description": "Enhance product photos with professional lighting",
  "default_inputs": {
    "style": { "type": "string", "content": "natural" },
    "size": { "type": "string", "content": "1024x1024" }
  },
  "model": {
    "id": 1,
    "name": "dall-e-3",
    "display_name": "DALL-E 3"
  }
}
```
