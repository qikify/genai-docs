# Teeinblue Integration

ImagenHub is a standalone AI model management application. While it features native integration with Teeinblue, it functions independently to manage and optimize AI image generation workflows.

![ImagenHub overview](/teeinblue/image1.png)

It provides advanced control over AI models through the following features:

- **Multi-Model Templates** — Assign specific models and prompts to individual templates, allowing you to run multiple AI models simultaneously.
- **Prompt Security** — Prompts are secured within the data structure and completely hidden from client-side console inspection.
- **Flexible API Access** — Connect your own model API keys or use an ImagenHub subscription for built-in model access.
- **Fail-Safe Redundancy** — If a custom API key runs out of tokens, the system automatically falls back to ImagenHub's network to ensure uninterrupted image generation.

This section walks you through connecting ImagenHub to Teeinblue and setting up your first AI workflow.

## Steps

1. [Create an API key](/teeinblue/api-keys) and paste it into Teeinblue.
2. [Choose how to power your models](/teeinblue/model-access) — your own provider keys, or an ImagenHub subscription.
3. [Build a template](/teeinblue/templates) — pick a model, write a prompt, test the output.
4. [Wire the template into Teeinblue](/teeinblue/integration) on a Photo Upload Layer.
