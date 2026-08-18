# Changelog

All notable changes to the ImagenHub API.

## Unreleased

Removed the live/test API key distinction. There is now one kind of key, prefixed `sk_igh_`.

A `sk_test_` key never behaved differently from a `sk_live_` one — both generated real images and deducted real credits — so the documentation describing test keys as free was wrong. Keys already issued under either prefix continue to work unchanged; the `type` field is gone from the key resource and from the `/ping` response.

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
