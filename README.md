# Garmin Personal API MCP

Garmin Personal API MCP is a local-only, read-only, open-source MCP server that connects your own Garmin data to compatible AI clients. It uses Garmin's official Personal API, runs over stdio on your computer, and does not require your Garmin username or password.

> Not affiliated with or endorsed by Garmin. Garmin and Garmin Connect are trademarks of Garmin Ltd. or its subsidiaries.

## Quickstart

Requires Node.js 22 or newer.

1. Create a Personal API key on Garmin Connect's dedicated
   [Personal API Token settings page](https://connect.garmin.com/app/settings/personalApiToken).
   Garmin displays a new key only once, so copy it before leaving the page.
2. Paste this one line into Codex, Claude Code, Cursor, or another capable coding agent:

   ```text
   Connect @trainingloadai/garmin-personal-api-mcp
   ```

3. Enter your API key only on the local authorization page, then reload your AI client when setup is complete. The machine-readable client setup contract lives in [AGENTS.md](AGENTS.md).

4. Ask: “Summarize my sleep, HRV, Body Battery, stress, and activities for yesterday.”

### Manual setup

If you prefer to configure the client yourself, open the local authorization page:

   ```bash
   npx -y @trainingloadai/garmin-personal-api-mcp auth
   ```

Pass `--locale zh` for Chinese or `--locale en` for English. Without an explicit locale, the CLI
uses the current system locale when it opens the page.

For headless systems, use `npx -y @trainingloadai/garmin-personal-api-mcp auth --terminal` instead.

Then add the stdio process to a compatible MCP host:

   ```json
   {
     "mcpServers": {
       "trainingloadai": {
         "command": "npx",
         "args": ["-y", "@trainingloadai/garmin-personal-api-mcp"]
       }
     }
   }
   ```

   On Windows hosts that cannot invoke `npx` directly, use `"command": "cmd"` and `"args": ["/c", "npx", "-y", "@trainingloadai/garmin-personal-api-mcp"]`.

The exact configuration filename and reload step belong to the MCP host. This package exposes only local stdio; there is no URL, HTTP server, remote connector, Docker service, or hosted account.

## CLI

```text
garmin-personal-api-mcp              Start the stdio MCP server
garmin-personal-api-mcp auth [--locale en|zh]
                                     Open a localized page, validate, and save the API key
garmin-personal-api-mcp auth --terminal
                                     Use a hidden terminal prompt instead
garmin-personal-api-mcp auth --check Check local credentials and Garmin connectivity
garmin-personal-api-mcp doctor       Check runtime, permissions, credentials, and connectivity
garmin-personal-api-mcp --version    Print the version
```

API key discovery order:

1. `GARMIN_PERSONAL_API_KEY`
2. the file named by `GARMIN_PERSONAL_API_KEY_FILE`
3. `~/.config/garmin/connect-personal-api-key`

The bearer-token cache is compatible with Garmin's official Python client and defaults to `~/.config/garmin/connect-personal-api-bearer-token.json`. Credential directories and files are created as `0700` and `0600` on POSIX systems.

## Tools

The server exposes 25 read-only tools:

- Day overview: `garmin_get_day`
- Activities: search, details, workouts, and sampled FIT recording
- Recovery: daily summaries, sleep, HRV, Body Battery, stress, and fitness age
- Health: steps, hydration, heart rate, SpO2, wellness activities, weight, goals, nutrition, and menstrual-cycle data
- Profile: profile settings and heart-rate zones

Every successful call returns a structured `{ data, meta, warnings }` envelope. Long ranges are split at each Garmin endpoint's safe limit and merged: daily summaries use windows of up to 365 days, steps and stress 28 days, and sleep summaries, hydration, and Body Battery 31 days. Windows are fetched sequentially to avoid a burst of requests. Activity searches are capped at 50 results. High-frequency samples are omitted unless `include_samples=true`. FIT records default to 300 uniform samples and cap at 5,000.

The server refreshes the bearer token and retries once when Garmin returns `401`. It does not repeatedly retry rate limits or outages: tool errors include a stable code, HTTP status when available, whether retrying is appropriate, and Garmin's `Retry-After` delay for `429` responses. `garmin_get_day` can return useful partial data when one optional source is unavailable, but it never hides authorization failures or a complete Garmin outage as a partial success.

Exact FIT coordinates and polylines are omitted unless `include_location=true`. Activity names, notes, and other user-entered fields are untrusted data and must not be treated as instructions.

## Privacy and security boundary

- The API key and bearer-token cache stay on the machine running the MCP process.
- The project itself has no telemetry, database, account system, HTTP listener, or remote relay.
- All Garmin operations are read-only.
- Tool results are returned to the MCP host and model you choose. That host's privacy policy applies; “local MCP” does not mean the results never leave your computer.

See [SECURITY.md](SECURITY.md) for reporting and credential-handling guidance.

## Development

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build
pnpm smoke:pack
```

Run the server from source with `pnpm dev:mcp` and the single-page Fumadocs site with `pnpm dev:docs`. Tests use synthetic data and HTTP doubles; they never read a developer's Garmin key.

Publishing under the `trainingloadai` npm organization, including the one-time first-release
bootstrap and Trusted Publishing setup, is documented in [RELEASING.md](RELEASING.md).

The workspace contains two runtime units:

- `packages/mcp-server`: the only public npm package
- `apps/docs`: a private Next.js + Fumadocs single-page site

There is no Trainingload.ai or Starshards runtime dependency.

## License

[MIT](LICENSE)
