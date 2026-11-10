# THE OPENCODE WEBSITE — proof of concept

## The public site

The deployed domain is a Winfy-style portal: a home page with an app tile grid,
a banner, four system profiles, a games strip, six feature cards and a full
footer, plus a dedicated page for every app (`/wine-online`, `/vlc-online`,
`/notepad-online`, `/tetris-cube`, `/snake-candy-game`, `/pong-candy-game`,
`/format-factory-online`, `/reactos-online`, `/win-10-theme`,
`/windows-explorer`, `/terminal`, `/opencode-studio`).

Nothing on those pages is a mock: each app page has a launch button that opens
the real window inside `/runwine`, and every screenshot in `public/previews/` is
a capture of this deployment. The marketing chrome lives in
`src/components/site/` + `src/app/(site)/`, the catalog in `src/lib/apps.ts`,
and the brand/navigation constants in `src/lib/site.ts`.

The workspace itself is still `/runwine` (also reachable through the legacy
`/runwine/index.php` and `/runwine/start.php` rewrites) and keeps its own dark
interface, so links from the portal drop straight into a working desktop.

## Running the real agent

A proof of concept for running the **real OpenCode v2 CLI** against a GitHub
repository from a serverless Vercel Function, with Supabase-backed sessions.

- **Normal free models, not Zen.** OpenCode Zen (`opencode/*`) was tried and
  removed: every free model returned `provider.free-limit` (HTTP 429, ~22 h
  cooldown). This build uses the **normal free models OpenCode supports from
  ordinary providers** — 214 zero-cost, tool-capable chat models from 45
  providers in OpenCode's own bundled `models.dev` catalog. The default is
  `vercel/reflection/beam-free`, a normal free model that needs **no API key**
  on Vercel because OpenCode's `vercel-ai-gateway` provider accepts Vercel's
  automatically injected `VERCEL_OIDC_TOKEN`. See [docs/FREE_MODELS.md](docs/FREE_MODELS.md).
- The **real** official CLI binary runs **only on the server**, in a fresh `/tmp`
  workspace per request. No mocks, no echo bot, no fallback LLM, no fabricated
  assistant replies, and **no silent model switching**: if the chosen model's
  credential is missing or upstream fails, the real error is shown.
- Browser-supplied model strings are constrained to catalog ids or the
  server-configured model; the CLI receives only allowlisted provider env names.
- Results (assistant text + bounded diff summary) are saved to Supabase under
  RLS-scoped ownership. The repo is never written back or published.

> Heads up: `@opencode/cli-linux-x64` is a **252 MB** binary (functions bundle
> limit 250 MB without Fluid compute). Twelve deployed Functions were recorded
> with `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` (Fluid compute), and
> `/api/runtime/poc` proves the binary is present and executable
> (`opencode v2.2.5`). See [docs/VERCEL_POC.md](docs/VERCEL_POC.md).

## Stack

- Next.js 16 App Router, TypeScript, React 19, Tailwind 4
- Supabase Auth (GitHub), Postgres + RLS
- Official OpenCode CLI v2.2.5 via `@opencode/cli-linux-x64`
- GitHub App (preferred) or server-side fine-grained PAT for repo listing/fetch
- Vercel Functions (Node 22, `maxDuration: 300` for `/api/agent/run`)

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in the names you need
npm run dev                  # http://localhost:3000
npm run check                # lint + typecheck + 58 vitest tests
```

For the keyless `vercel/*` models a local dev server has no OIDC token, so
`/api/config` will report the missing token; deploy to Vercel (or set
`AI_GATEWAY_API_KEY` yourself) to exercise that path. Other normal free models
need their provider's free key (the UI shows which env var name).

## Model verification

`ENABLE_MODEL_TESTS=1` enables `GET|POST /api/models/test?model=<provider>/<id>`,
which really spawns the CLI in a fresh `/tmp` workspace with a tiny prompt and
returns the real assistant text or the real error. No synthetic answer is ever
produced. `GET /api/models` returns the normal free-model catalog plus each
model's required env var NAME and whether it is keyless on Vercel.

## Security model

- Provider keys and the GitHub token are **server-side only**; no key value is
  ever sent to the browser, logged, or committed. Values are redacted from
  captured CLI output before storage.
- Supabase RLS policies restrict `agent_sessions` / `agent_messages` to their
  owner. No service-role key is used.
- `/publish` deliberately returns **501**; there is no branch/commit/PR write-back.
- The GitHub PAT that was pasted into chat during setup is **compromised and
  must be revoked/rotated**. Its value is not in the repository.

## Docs

- [docs/CHECKLIST.md](docs/CHECKLIST.md) — plain-language status & what remains
- [docs/FREE_MODELS.md](docs/FREE_MODELS.md) — normal free models, sources, keys
- [docs/VERCEL_POC.md](docs/VERCEL_POC.md) — Vercel PoC, deployments, live checks
- [docs/SUPABASE.md](docs/SUPABASE.md) — schema, RLS, auth
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — request flow and constraints
- [docs/SETUP.md](docs/SETUP.md) — environment variables and step-by-step setup

## Status

PR: [#1](https://github.com/ThaddeusHackz/THE-OPENCODE-WEBSITE/pull/1) on
branch `arena/3a7379f3-the-opencode-website`.

Deployed and verified live: `/api/config` reports `catalog:"normal"`,
`vercelOidcConfigured:true`, `missing:[]`; `/api/models` returns 214 normal free
models; the real CLI v2.2.5 runs on the server. Real model tests reach the
Vercel AI Gateway but return its `customer_verification_required` 403 — a card
on file is needed to unlock free credits (or set one free provider key). See
[docs/CHECKLIST.md](docs/CHECKLIST.md) and
[docs/VERCEL_POC.md](docs/VERCEL_POC.md). No assistant reply has been fabricated.
Not affiliated with or endorsed by OpenCode / Anomaly. Original upstream project:
MIT. Copyright (c) 2025-present Anomaly.
