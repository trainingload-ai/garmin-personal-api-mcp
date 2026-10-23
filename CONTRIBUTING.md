# Contributing

Thanks for helping improve Garmin Personal API MCP.

## Development setup

Use Node.js 20 or newer, pnpm 10, and synthetic test data only.

```bash
pnpm install
pnpm check
pnpm smoke:pack
```

The repository is a pnpm workspace. Keep Garmin client code inside `packages/mcp-server` until a second real consumer exists. The website remains one indexable homepage in v0.1; do not add `/docs`, `/guides`, client, data, or tool pages without an approved scope change.

## Project rules

- Keep the MCP transport stdio-only. Do not add HTTP, SSE, or remote deployment code.
- Every Garmin operation must remain read-only and use an official Personal API endpoint.
- Never log API keys, bearer tokens, Authorization headers, or raw upstream HTML.
- Preserve structured tool output and stable error codes.
- Do not silently remove data. Report sampling, omission, pagination, and truncation in metadata or warnings.
- Keep exact location and high-frequency samples opt-in.
- Add or update synthetic tests for behavior changes. Never record real credentials, Authorization headers, or home coordinates in fixtures.
- Write all server diagnostics to stderr. stdout is reserved for MCP JSON-RPC.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build`, and `pnpm smoke:pack` before opening a pull request.
