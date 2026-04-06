# Image Generation

The `/process` endpoint is the core of ImagenHub. Submit a prompt, get back generated images.

## Submit a request

```bash
curl -X POST https://api.imagenhub.ai/api/process \
  -H "Authorization: Bearer sk_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": 1,
    "prompt": { "type": "string", "content": "Product photo on white background" }
  }'
```

You must provide exactly one of:
- `model_id` — Direct model selection
- `template_id` — Use a saved template (resolves the model automatically)

These are mutually exclusive. Providing both returns a `422` error.

## Task lifecycle

Every request creates a **task** that moves through these states:

```
created → processing → success
                    └→ error
```

| Status | Meaning |
|--------|---------|
| `created` | Task queued, waiting for processing |
| `processing` | Request sent to AI provider |
| `success` | Images generated, URLs in `output` |
| `error` | Generation failed |

## Polling

Check task status by polling:

```bash
curl https://api.imagenhub.ai/api/tasks/{task_id} \
  -H "Authorization: Bearer sk_live_YOUR_KEY"
```

Poll every 1-2 seconds until `status` is `success` or `error`.

## Streaming

For real-time updates, use Server-Sent Events:

```bash
curl -N https://api.imagenhub.ai/api/tasks/{task_id}/stream \
  -H "Authorization: Bearer sk_live_YOUR_KEY"
```

Each SSE event contains a JSON-encoded task object. The stream closes automatically when the task reaches `success` or `error`.

### JavaScript example

```javascript
const eventSource = new EventSource(
  'https://api.imagenhub.ai/api/tasks/019d29c6.../stream',
  { headers: { 'Authorization': 'Bearer sk_live_YOUR_KEY' } }
);

eventSource.onmessage = (event) => {
  const task = JSON.parse(event.data);
  if (task.status === 'success') {
    console.log('Images:', task.output);
    eventSource.close();
  }
};
```

## Output format

On success, the `output` field contains an array of signed image URLs:

```json
{
  "output": [
    "https://cdn.imagenhub.ai/generated/abc123.png?signature=..."
  ]
}
```

URLs are signed and **valid for 1 hour**. Download them immediately or serve them to your users within that window.

## Using templates

Instead of specifying `model_id` and all parameters, you can use a template:

```bash
curl -X POST https://api.imagenhub.ai/api/process \
  -H "Authorization: Bearer sk_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "019d29c5-9663-71c4-b698-9cbf898948d4",
    "prompt": { "type": "string", "content": "A product photo" }
  }'
```

The template's `default_inputs` are merged with your request — your values take priority. See [Templates](/guide/templates) for more.

## Error handling

| Status | Error | Action |
|--------|-------|--------|
| `401` | Invalid auth | Check your API key |
| `402` | Credit limit exceeded | Top up credits or wait for reset |
| `403` | Template not accessible | Use your own or a public template |
| `422` | Validation error | Check request body format |
| `429` | Rate limited | Wait for `Retry-After` seconds |
