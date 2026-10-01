# Changelog

All notable changes to the ImagenHub API.

## Unreleased

Removed the live/test API key distinction. There is now one kind of key, prefixed `sk_igh_`.

A `sk_test_` key never behaved differently from a `sk_live_` one — both generated real images and deducted real credits — so the documentation describing test keys as free was wrong. Keys already issued under either prefix continue to work unchanged; the `type` field is gone from the key resource and from the `/ping` response.

A Free organization is now limited to 20 requests a day to `POST /process`, counted per organization and reset at 00:00 UTC. The request after the twentieth is answered with a `429` [`daily-limit-reached`](/errors/daily-limit-reached) problem and saved as a failed task.

This replaces the earlier limit of 50 requests a day, which counted every authenticated request including reads. The `X-RateLimit-Limit-Day` and `X-RateLimit-Remaining-Day` response headers are gone with it; the per-minute limit and its headers are unchanged.

## v1.0.0

Initial public release.

- Image generation via `/process` endpoint
- Multi-provider routing (OpenAI, Fal.ai, Replicate)
- API key and JWT authentication
- Real-time task streaming via SSE
- Template system (public and private)
- BYOK (Bring Your Own Keys) support
- Analytics: request history, usage aggregation, performance metrics
- Credit-based billing for paid tier
- Rate limiting for free tier
