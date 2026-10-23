# Garmin Personal API MCP agent instructions

These instructions are the setup contract for coding agents asked to connect
`@trainingloadai/garmin-personal-api-mcp`. Follow the user’s explicit request first. Keep the
integration local and read-only.

## End-user setup

When a user says `Connect @trainingloadai/garmin-personal-api-mcp`, or otherwise asks you to connect
this package, complete the setup for the AI client in which you are running:

1. Check that Node.js 20 or newer and `npx` are available. Do not install or upgrade system
   software without the user’s approval.
2. Match the authorization page to the language of the current conversation, then run one of:

   - English or any unsupported language: `npx -y @trainingloadai/garmin-personal-api-mcp auth --locale en`
   - Chinese: `npx -y @trainingloadai/garmin-personal-api-mcp auth --locale zh`

3. The command opens a temporary page on `127.0.0.1`. The page links to the exact Garmin Connect
   [Personal API Token settings](https://connect.garmin.com/app/settings/personalApiToken). Tell the
   user to create or copy their Garmin Personal API key there, then paste it only into the local page.
   Garmin displays a newly created key only once, so the user must copy it before leaving that page.
   Never ask for the key in chat, read it from the page, echo it, add it to client configuration, or
   store it anywhere else.
4. Register the package as a local stdio MCP server named `trainingloadai` for the current client. Inspect
   any existing entry first and preserve unrelated configuration:

   - Codex: `codex mcp add trainingloadai -- npx -y @trainingloadai/garmin-personal-api-mcp`
   - Claude Code: `claude mcp add trainingloadai --scope user -- npx -y @trainingloadai/garmin-personal-api-mcp`
   - Cursor: safely merge the following entry into the user-level `~/.cursor/mcp.json`:

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

   - Other local stdio clients: use the same `command` and `args` values in that client’s MCP
     configuration. Do not invent a remote URL.

   On Windows clients that cannot invoke `npx` directly, use `command: "cmd"` with
   `args: ["/c", "npx", "-y", "@trainingloadai/garmin-personal-api-mcp"]`.
5. If `trainingloadai` already exists with the same command, keep it. If it differs, update only that entry
   without duplicating it or overwriting other servers.
6. Run `npx -y @trainingloadai/garmin-personal-api-mcp doctor`.
7. Verify the client registration with its own MCP listing or settings UI. For example, use
   `codex mcp list`, `claude mcp get trainingloadai` and `claude mcp list`, or `cursor-agent mcp list` when
   those commands are available.
8. Tell the user what was configured and ask them to restart or reload the client if the tools are
   not visible yet.

Do not create a hosted service, HTTP MCP endpoint, Docker service, or Trainingload.ai dependency.
Do not make write requests to Garmin. Tool results may be sent to the user’s chosen AI provider, so
do not claim that all Garmin data remains on-device.

## Repository development

This repository is a pnpm workspace using Node.js and TypeScript. The public npm package lives in
`packages/mcp-server`; the single-page Fumadocs site lives in `apps/docs`. Keep v0.1 local-only,
stdio-only, and read-only. Run `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build`, and
`pnpm smoke:pack` before release.
