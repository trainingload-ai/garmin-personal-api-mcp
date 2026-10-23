# Changelog

All notable changes to this project will be documented here.

## 0.1.4 - 2026-10-24

- Add a complete Simplified Chinese README and link it from the repository and npm documentation.
- Stop publishing JavaScript and declaration source maps.
- Clean the build output before compilation and fail the packed-package smoke test if any source map
  is included.

## 0.1.3 - 2026-10-23

- Localize the temporary browser authorization flow in English, Simplified Chinese, Japanese,
  Spanish, German, French, Portuguese, and Korean.
- Add an accessible language menu and improve the authorization layout on narrow screens.
- Localize verification, retry, rate-limit, and completion states while keeping API keys confined
  to the loopback authorization flow.

## 0.1.2 - 2026-10-23

- Fix browser authorization forms being rejected when Chrome serializes a privacy-restricted form origin as `null`.
- Preserve locale and authorization state in retry URLs, and add explicit localized verification-failed and retry actions.
- Close local authorization connections after the completion page is delivered so the CLI exits cleanly.

## 0.1.1 - 2026-10-23

- Add a localized authorization-complete page with a clear return-to-website action.
- Force every submitted Personal API key through a fresh Garmin token exchange before saving it, then verify read access against Garmin user settings.
- Keep the local authorization server alive through the redirect to the completion page and reject direct access before verification.

## 0.1.0 - 2026-10-23

- Add the local, read-only stdio MCP server with 25 Garmin Personal API tools.
- Add a localized temporary loopback authorization page, terminal fallback, secure API-key storage, Garmin-compatible bearer-token caching, one-time 401 refresh, and diagnostics.
- Add endpoint-specific date-range chunking, sequential long-range fetching, stable retry guidance, output envelopes, sample controls, GPS privacy defaults, and in-memory FIT decoding.
- Add synthetic unit, contract, process, and packed-tarball smoke tests.
- Add the private, single-page Next.js + Fumadocs product site with light/dark themes, one-line agent onboarding, multi-client configuration, capabilities, privacy, FAQ, SEO metadata, robots, and sitemap.
