# Support Promise Vault

Support Promise Vault is a narrow extension-first product for capturing support-chat promises before they disappear.

## MVP

- detect supported chat providers
- capture the visible conversation context
- preserve screenshot + URL + timestamp
- extract key details:
  - promised outcome
  - case/order ID
  - amount at stake
  - follow-up date
- save the case for follow-up

## Repo Layout

- `apps/extension`
  - `WXT` browser extension MVP
- `apps/web`
  - `Next.js` landing page and dashboard shell
- `supabase/schema.sql`
  - starter database schema for the future synced backend

## Current State

- extension capture flow is scaffolded for:
  - provider detection
  - visible transcript extraction
  - screenshot capture
  - local draft/case persistence
- web app is scaffolded as the product shell and demo dashboard
- Supabase OAuth wiring is in place for the web app, but credentials/providers still need to be configured

## Commands

```bash
pnpm dev:web
pnpm dev:extension
pnpm build:web
pnpm build:extension
```

## Environment

Set these when ready:

- `apps/web/.env.local`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - optional legacy fallback: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `apps/extension/.env`
  - `WXT_PUBLIC_APP_URL`

## Supabase OAuth Setup

1. Create a Supabase project.
2. In `Authentication -> URL Configuration`, add:
   - `http://localhost:3000/auth/callback`
   - your future production callback URL, for example `https://your-domain.com/auth/callback`
3. Enable the providers you want first in `Authentication -> Providers`.
4. For GitHub and Google provider setup, the OAuth provider callback URI should be your Supabase Auth callback:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
5. Copy your project URL and publishable key into `apps/web/.env.local`.

The app currently offers Google and GitHub sign-in buttons.

## Honest MVP Limits

- provider support is best-effort, not equal quality on every widget
- visible transcript capture is much stronger than hidden-history capture
- unsupported widgets should still be usable through screenshot fallback
