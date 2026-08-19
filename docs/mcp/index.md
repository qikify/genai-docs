# MCP Server

ImagenHub speaks the [Model Context Protocol](https://modelcontextprotocol.io) (MCP), so an AI agent — Claude, or any MCP-compatible client — can browse models and templates, generate images, and read back results by calling tools instead of writing HTTP requests by hand.

It's the same product as the [REST API](/api/) behind the scenes — the same account, credits, templates, and tasks. MCP just exposes them as agent-callable tools.

## When to use it

| Use the MCP server when… | Use the [REST API](/api/) when… |
|---|---|
| You want an AI agent to drive ImagenHub conversationally or autonomously | You're writing application code that calls ImagenHub directly |
| Your client already speaks MCP (Claude Desktop, Claude Code, …) | You need fine-grained control over each request |

## Endpoint

```
https://api.imagenhub.ai/mcp/imagenhub
```

A single MCP endpoint over Streamable HTTP. Authentication uses your ImagenHub API key — the same key as the REST API. The agent never sees the key; your MCP client holds it and sends it on every call. See [Connecting a Client](/mcp/connecting).

## The tools

| Tool | What it does |
|---|---|
| `list-templates` | Browse the templates available to the account |
| `get-template` | Inspect one template's inputs and prompt variables |
| `list-models` | List models and their input schemas |
| `generate-image` | Start a generation from a template or model |
| `get-task` | Poll a generation for status and output images |
| `list-tasks` | Review past generations |

## Typical workflow

1. **Discover** — `list-templates` or `list-models` to see what's available.
2. **Inspect** — `get-template` to see the inputs a template accepts.
3. **Generate** — `generate-image`. Generation is asynchronous; it returns a task id with status `created`.
4. **Poll** — `get-task` with that id until status is `success`, then read the output image URLs. `list-tasks` reviews earlier runs.

Each successful generation charges credits to the account, just like the REST API.

## Next

- [Connecting a Client](/mcp/connecting) — point Claude or another MCP client at the server.
- [Tool Reference](/mcp/tools) — every tool, its parameters, and what it returns.
