# API Reference

Complete reference for the ImagenHub REST API.

## Base URL

```
https://api.imagenhub.ai/api
```

## Authentication

Most endpoints require one of:

| Method | Header | Use case |
|--------|--------|----------|
| API Key | `Authorization: Bearer sk_igh_...` | Programmatic access, processing, analytics |
| JWT | `Authorization: Bearer eyJhbG...` | Dashboard operations, templates, key management |

Some catalog endpoints (`/models`, `/model-providers`) are public and require no authentication.

## Request format

All `POST`/`PUT` requests use JSON:

```bash
curl -X POST https://api.imagenhub.ai/api/process \
  -H "Authorization: Bearer sk_igh_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "model_id": 1, "prompt": { "type": "string", "content": "..." } }'
```

## Response format

All responses are JSON-wrapped in a `data` key:

```json
{ "data": { ... } }
```

List endpoints include pagination metadata in `meta`:

```json
{
  "data": [ ... ],
  "meta": { "current_page": 1, "last_page": 3, "per_page": 15, "total": 42 }
}
```

## Error responses

| Status | Description |
|--------|-------------|
| `401` | Missing or invalid credentials |
| `403` | Not authorized for this resource, or [insufficient credits](/errors/insufficient-credits) |
| `404` | Resource does not exist |
| `422` | Invalid request body |
| `429` | Free tier per-minute limit (check `Retry-After`), or the [daily limit](/errors/daily-limit-reached) on `POST /process` |

Refusals that need more than a status code come back as a problem details object. See [Errors](/errors/).

## Rate limit headers

Included on every authenticated response:

```
X-RateLimit-Limit-Minute: 60
X-RateLimit-Remaining-Minute: 55
X-Credits-Used: 150.50
X-Credits-Remaining: 849.50
```

## Endpoints

Every endpoint in the API, by group. Each endpoint has its own page.

<ApiEndpoints />
