# Errors

When the API refuses a request for a reason that needs more than a status code, the body is a problem details object as defined by [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html), sent as `application/problem+json`.

```json
{
  "type": "https://docs.imagenhub.ai/errors/insufficient-credits",
  "title": "Insufficient credits",
  "status": 403,
  "detail": "Your current balance is 3 credits, but this run costs 10.",
  "balance": 3,
  "cost": 10,
  "overage_limit": 0
}
```

## Reading a problem

| Member | Meaning |
|--------|---------|
| `type` | A URL that identifies the kind of problem. Switch on this in code; it never changes for a given problem. It is also the address of that problem's page in this section. |
| `title` | A short name for the type. Same for every occurrence. |
| `status` | The HTTP status, repeated in the body. |
| `detail` | What went wrong this time, for a human. Do not parse it; the extra fields carry the same information as data. |
| `instance` | A URI for this specific occurrence. Not sent today; reserved for a request id. |

Anything else in the object is specific to the type and is documented on its page.

## Problem types

| Type | Status | When |
|------|--------|------|
| [`insufficient-credits`](/errors/insufficient-credits) | `403` | The account cannot cover the credit cost of a run |

## Other errors

Errors that a status code fully describes keep Laravel's plain shape, `{"message": "..."}`:

| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid credentials |
| `403` | Not authorized for this resource |
| `404` | Resource does not exist |
| `422` | Invalid request body. Includes an `errors` object keyed by field |
| `429` | Too many upload requests. Check the `Retry-After` header |

The free-tier request limit is the one error still on the older envelope. It answers `429` with `{"error": {"type": "rate_limit_exceeded", "message": "..."}}` and the `Retry-After` and `X-RateLimit-*` headers; see [Rate Limits & Credits](/guide/rate-limits). It will move to a problem details body in a later release.
