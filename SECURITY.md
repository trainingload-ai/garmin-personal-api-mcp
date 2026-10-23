# Security Policy

## Reporting a vulnerability

Please use the repository's private GitHub Security Advisory flow. Do not open a public issue containing a Garmin Personal API key, bearer token, Authorization header, private health data, activity notes, or precise location.

Include the affected version, a minimal reproduction, and the expected impact. Use synthetic values whenever possible.

## Credential model

The MCP server reads a Garmin Personal API key from the environment or a local file. Bearer tokens are cached locally. On POSIX systems, newly created credential directories and files use `0700` and `0600` permissions. Users remain responsible for securing existing files, their MCP host, and their computer account.

The MCP server does not expose a network transport, accept remote users, collect telemetry, or operate a hosted relay. The `auth` command temporarily binds a random `127.0.0.1` port for its private setup page, then closes the listener after success or timeout. Tool results are returned to the user's selected MCP host and may be processed by that host's model under its own privacy policy.

## Supported versions

Security fixes are provided for the latest published `0.x` release until a stable release policy is announced.
