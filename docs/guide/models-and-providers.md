# Models & Providers

ImagenHub aggregates multiple AI image generation models across different providers. You choose a model; ImagenHub handles the provider routing.

## Models

A **model** represents an AI image generation model (e.g., DALL-E 3, Flux Dev, Stable Diffusion XL). Each model defines:

- **Input schema** — JSON schema describing accepted parameters (prompt, size, style, etc.)
- **Providers** — Which providers offer this model and at what cost

### List all models

```bash
curl https://api.imagenhub.ai/api/models
```

No authentication required. Returns all visible models with their input schemas and provider options.

### Get a specific model

```bash
curl https://api.imagenhub.ai/api/models/1
```

Returns full details including the `input` JSON schema and all available `providers` with per-request cost.

## Providers

A **provider** is a third-party AI service that hosts models (e.g., OpenAI, Fal.ai, Replicate). The same model may be available from multiple providers at different price points.

### List all providers

```bash
curl https://api.imagenhub.ai/api/providers \
  -H "Authorization: Bearer sk_live_YOUR_KEY"
```

### Model-provider combinations

To see all model-provider combinations with cost and endpoint details:

```bash
curl https://api.imagenhub.ai/api/model-providers
```

Filter by model or provider:

```bash
# All providers for model 1
curl https://api.imagenhub.ai/api/model-providers?model_id=1

# All models from provider 2
curl https://api.imagenhub.ai/api/model-providers?provider_id=2
```

## How routing works

When you submit a request to `/process`, ImagenHub:

1. Looks up available providers for the requested model
2. Checks if you have a [BYOK key](/guide/byok) for any of those providers
3. Routes to the best available provider
4. Transforms your input to match the provider's format
5. Returns the result in ImagenHub's unified format

You can also request a specific provider by passing a `provider` field in the request body.

## Input format

Each model defines its own input schema. The common pattern is typed key-value pairs:

```json
{
  "prompt": { "type": "string", "content": "A sunset over mountains" },
  "size": { "type": "string", "content": "1024x1024" },
  "style": { "type": "string", "content": "natural" }
}
```

Check the model's `input` field for the full schema of accepted parameters.
