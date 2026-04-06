# Analytics

ImagenHub tracks every API request and provides endpoints to query usage, costs, and performance metrics.

## Request history

Get a detailed log of all API requests:

```bash
curl "https://api.imagenhub.ai/api/analytics/requests" \
  -H "Authorization: Bearer sk_live_YOUR_KEY"
```

Each entry includes the model used, provider, status, cost, and duration.

### Filtering

| Parameter | Description |
|-----------|-------------|
| `model_id` | Filter by AI model |
| `api_key_id` | Filter by specific API key |
| `status` | `success`, `user_error`, or `error` |
| `start` / `end` | Date-time range (defaults to last 24h) |
| `sort_by` | `ended_at` (default) or `duration` |

```bash
curl "https://api.imagenhub.ai/api/analytics/requests?status=error&model_id=1" \
  -H "Authorization: Bearer sk_live_YOUR_KEY"
```

### Pagination

Request history uses cursor-based pagination:

```bash
# First page
curl "https://api.imagenhub.ai/api/analytics/requests?limit=20"

# Next page (use cursor from previous response)
curl "https://api.imagenhub.ai/api/analytics/requests?limit=20&cursor=42"
```

### Filter options

Get available filter values for building UI dropdowns:

```bash
curl "https://api.imagenhub.ai/api/analytics/requests/filters" \
  -H "Authorization: Bearer sk_live_YOUR_KEY"
```

Returns unique model and provider names from your request history.

## Usage & cost aggregation

Get time-bucketed cost and request count data:

```bash
curl "https://api.imagenhub.ai/api/analytics/usage?timeframe=day" \
  -H "Authorization: Bearer sk_live_YOUR_KEY"
```

Timeframe options: `hour`, `day`, `week`, `month`.

Response includes per-bucket data and a summary:

```json
{
  "time_series": [
    { "bucket": "2026-03-17", "request_count": 42, "total_cost": 1.68 }
  ],
  "summary": { "total_requests": 150, "total_cost": 6.00 }
}
```

## Performance metrics

Get latency percentiles and error rates for a specific model:

```bash
curl "https://api.imagenhub.ai/api/analytics/metrics?model_id=1&timeframe=day" \
  -H "Authorization: Bearer sk_live_YOUR_KEY"
```

Returns success/error counts and latency percentiles (p50, p75, p90):

```json
{
  "summary": {
    "request_count": 150,
    "success_count": 140,
    "user_error_count": 7,
    "error_count": 3,
    "p50_duration": 1.3,
    "p75_duration": 2.4,
    "p90_duration": 5.0
  }
}
```

Use these metrics to compare model performance and identify reliability issues.
