# Support Promise Vault

## Product
- Capture support-chat promises before they disappear.
- First wedge: `Zendesk`, `Intercom`, `Help Scout`, and `Gorgias`.
- Core user action: capture visible support context, extract key promise details, confirm, save, and follow up.

## Build Direction
- Narrow and strong beats broad and magical.
- Promise only what the extension can reliably capture:
  - provider detection
  - visible transcript extraction where possible
  - screenshot fallback everywhere else
- Do not imply full hidden-history recovery from every widget.

## Technical Bias
- Extension-first product using `WXT`.
- Small dashboard/web surface in `Next.js`.
- `Supabase` for auth/data/storage once credentials are available.
- Add `Trigger.dev` only if reminder delivery or retries genuinely need background reliability.

## UX Rules
- The user should confirm extracted details, not type everything from scratch.
- Always preserve source context:
  - URL
  - domain
  - timestamp
  - screenshot
  - visible transcript snippet when available
- Keep the first-run flow under one minute.
