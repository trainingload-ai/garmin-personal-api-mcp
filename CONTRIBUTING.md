# Contributing

Thanks for helping improve Garmin Personal API MCP.

## Development setup

Use Node.js 22 or newer, pnpm 10, and synthetic test data only.

```bash
pnpm install
pnpm check
pnpm smoke:pack
```

Installing dependencies enables the repository's Husky hook. It runs ESLint only against staged
JavaScript and TypeScript files; the full cross-platform suite remains in CI.

## Branches and pull requests

- `main` is the protected, releasable branch. Do not push feature work directly to it.
- Use short-lived branches named `feat/<topic>`, `fix/<topic>`, `docs/<topic>`,
  `refactor/<topic>`, `test/<topic>`, or `chore/<topic>`.
- Open a pull request, keep it focused, and use a Conventional Commit-style PR title such as
  `feat: add recovery summary` or `fix: preserve authorization state`.
- Squash merge after the `Required checks` status passes. Delete the source branch after merging.
- Releases are immutable `v*` tags created from `main`; the release workflow verifies that the tag
  matches the npm package version before publishing.

Fork pull requests run tests but never receive Cloudflare or npm deployment credentials.

## Website deployment

The website is a complete Next.js static export. `pnpm --filter docs build` writes the deployable
files to `apps/docs/out`, and `pnpm verify:docs` checks the two public routes, locale metadata,
structured data, and Open Graph assets.

Production deployment runs only after CI succeeds for a push to `main`. Configure the `production`
GitHub environment with these encrypted secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`, scoped to Workers Scripts: Edit for the deployment account

The deploy job uploads `apps/docs/out` through Wrangler. It does not deploy the MCP server or expose
the Garmin Personal API over HTTP. To deploy manually after `wrangler login`, run
`pnpm deploy:docs`.

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
