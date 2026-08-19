# Connecting a Client

The MCP server is a single endpoint. Point your MCP client at it, add your API key as a header, and the client discovers the tools automatically.

## Endpoint

| Environment | URL |
|---|---|
| Production | `https://api.imagenhub.ai/mcp/imagenhub` |

The transport is Streamable HTTP — the client sends requests and reads responses over this one URL.

## Authentication

Send your ImagenHub API key as a Bearer token, the same key you'd use for the [REST API](/guide/authentication):

```
Authorization: Bearer sk_igh_YOUR_KEY
```

The model itself never sees the key — your MCP client stores it and attaches it to every request, so keep keys in client config, not in prompts.

Need a key? Create one from the [dashboard](https://imagenhub.ai) under **API Keys → Create Key** — see [Creating the API Keys](/teeinblue/api-keys).

## Claude Code

```bash
claude mcp add --transport http imagenhub \
  https://api.imagenhub.ai/mcp/imagenhub \
  --header "Authorization: Bearer sk_igh_YOUR_KEY"
```

## Config-file clients

Clients that read an `mcpServers` config (Claude Desktop and others) take an HTTP server block:

```json
{
  "mcpServers": {
    "imagenhub": {
      "type": "http",
      "url": "https://api.imagenhub.ai/mcp/imagenhub",
      "headers": {
        "Authorization": "Bearer sk_igh_YOUR_KEY"
      }
    }
  }
}
```

## Verifying

Once connected, the client lists six tools — `list-templates`, `get-template`, `list-models`, `generate-image`, `get-task`, and `list-tasks`. Ask the agent to "list my ImagenHub templates" to confirm the key works end to end.

## Next

- [Tool Reference](/mcp/tools) — what each tool accepts and returns.
