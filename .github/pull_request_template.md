## Summary

Describe what changed and why.

## Verification

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test:coverage`
- [ ] `pnpm build`
- [ ] `pnpm smoke:pack`

## Safety checklist

- [ ] Garmin operations remain read-only.
- [ ] No API keys, tokens, Authorization headers, raw upstream HTML, or precise home locations were added.
- [ ] New or changed behavior uses synthetic tests.
- [ ] Public website changes preserve `/` and `/zh` as the only indexable pages.
