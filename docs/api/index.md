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

| Status | Type | Description |
|--------|------|-------------|
| `401` | `unauthenticated` | Missing or invalid credentials |
| `402` | `credit_limit_exceeded` | Credit limit reached — includes `resets_at` |
| `403` | `forbidden` | Not authorized for this resource |
| `404` | `not_found` | Resource does not exist |
| `422` | `validation_error` | Invalid request body |
| `429` | `rate_limit_exceeded` | Free tier rate limit — check `Retry-After` header |

## Rate limit headers

Included on every authenticated response:

```
X-RateLimit-Limit-Minute: 60
X-RateLimit-Remaining-Minute: 55
X-RateLimit-Limit-Day: 1000
X-RateLimit-Remaining-Day: 980
X-Credits-Used: 150.50
X-Credits-Remaining: 849.50
```

## Endpoints

### Utility
- [`GET /ping`](/api/ping) — Test API key and check balance

### Catalog
- [`GET /models`](/api/models) — List all models
- [`GET /models/{id}`](/api/models) — Get model details
- [`GET /providers`](/api/providers) — List providers
- [`GET /model-providers`](/api/providers) — List model-provider combinations

### Processing
- [`POST /process`](/api/process) — Submit image generation request
- [`GET /tasks/{id}`](/api/tasks) — Get task status
- [`GET /tasks/{id}/stream`](/api/tasks) — Stream task status (SSE)

### Templates
- [`GET /templates`](/api/templates) — List templates
- [`GET /templates/{id}`](/api/templates) — Get template details

### Analytics
- [`GET /analytics/requests`](/api/analytics-requests) — Request history
- [`GET /analytics/requests/filters`](/api/analytics-requests) — Filter options
- [`GET /analytics/usage`](/api/analytics-usage) — Usage & cost aggregation
- [`GET /analytics/metrics`](/api/analytics-metrics) — Performance metrics
