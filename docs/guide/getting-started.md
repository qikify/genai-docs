# Getting Started

ImagenHub is a generative media API that gives you access to multiple image generation models — DALL-E 3, Flux, Stable Diffusion, and more — through a single, consistent interface.

## What you can do

- **Generate images** from text prompts using any supported model
- **Browse models** and compare pricing across providers
- **Create templates** to save and reuse generation presets
- **Track usage** with built-in analytics and cost monitoring
- **Bring your own keys** to use your own provider accounts

## How it works

1. **Get an API key** from the [ImagenHub dashboard](https://imagenhub.ai)
2. **Choose a model** from the catalog (or browse programmatically via `/models`)
3. **Submit a request** to `/process` with your prompt and model ID
4. **Poll or stream** the task status until your images are ready

Every request is routed to an AI provider, processed, and the generated images are returned as signed URLs valid for one hour.

## Base URLs

| Environment | URL |
|-------------|-----|
| Production  | `https://api.imagenhub.ai/api` |

## Next steps

- [Quickstart](/guide/quickstart) — Generate your first image in under 5 minutes
- [Authentication](/guide/authentication) — API keys, JWT tokens, and OAuth
- [Models & Providers](/guide/models-and-providers) — Browse the model catalog
- [API Reference](/api/) — Full endpoint documentation
