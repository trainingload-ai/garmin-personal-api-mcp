# @trainingloadai/garmin-personal-api-mcp

Local-only, read-only MCP access to your own Garmin activities, sleep, HRV, Body Battery, heart
rate, and wellness data through Garmin’s official Personal API.

Website: [garminpersonalapi.com](https://garminpersonalapi.com/) · Chinese:
[garminpersonalapi.com/zh](https://garminpersonalapi.com/zh) · AI-readable project context:
[llms.txt](https://garminpersonalapi.com/llms.txt) and
[llms-full.txt](https://garminpersonalapi.com/llms-full.txt)

## Let your AI client connect it

Paste this one line into Codex, Claude Code, Cursor, or another capable coding agent:

```text
Connect @trainingloadai/garmin-personal-api-mcp
```

The full machine-readable setup contract is in the repository’s
[AGENTS.md](https://github.com/trainingload-ai/garmin-personal-api-mcp/blob/main/AGENTS.md).
The agent should run the local auth command, ask you to enter the API key only on the temporary
`127.0.0.1` page, register the stdio process for the current client, and verify the connection.

## Manual setup

Requires Node.js 22 or newer.

```bash
npx -y @trainingloadai/garmin-personal-api-mcp auth
npx -y @trainingloadai/garmin-personal-api-mcp doctor
```

Then configure a local stdio MCP server with `command: "npx"` and
`args: ["-y", "@trainingloadai/garmin-personal-api-mcp"]`.

The package has no hosted relay, remote MCP endpoint, account system, or write tools. Credentials
stay in user-only files on the computer running the process. Tool results are returned to the MCP
client and model you choose.

See the [repository README](https://github.com/trainingload-ai/garmin-personal-api-mcp#readme) for
tools, privacy details, development, and source code.
