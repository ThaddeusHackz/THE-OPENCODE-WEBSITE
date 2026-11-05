# Plain-language final checklist

## What you asked for, and what changed

You said: **"instead of using opencode zen use the normal free models … the
normal opencode free models"**. Done. OpenCode Zen (`opencode/*`, `opencode-go/*`)
is gone from the product path. The app now uses **normal free models from
ordinary providers** in OpenCode's own official `models.dev` catalog.

- [x] Generated `src/lib/models.ts` from `anomalyco/opencode` dev's bundled
      `models-dev/snapshot.txt` — the normal model catalog, not Zen.
- [x] **214** zero-cost, tool-capable chat models from **45** ordinary providers,
      each with the exact credential env var NAME it needs.
- [x] Validated every id against the real pinned `@opencode/cli-linux-x64@2.2.5`
      binary (`opencode --standalone models`) — 3 stale ids were dropped.
- [x] Zen ids are rejected (`validateModel`) and removed from the child process
      (`OPENCODE_DISABLE_FREE_MODELS=1`). An old Zen `OPENCODE_MODEL` is ignored
      instead of being used silently.
- [x] Default `vercel/reflection/beam-free`: a normal free model that needs **no
      API key you have to paste**, because OpenCode's Vercel AI Gateway provider
      accepts Vercel's automatic OIDC token.
- [x] Keyless Vercel models: 5. Keyed normal free models: 209, each clearly
      labelled in the UI with the env var name it needs.
- [x] No fabricated assistant replies, no echo bot, no silent model switching.
      Missing credentials and upstream errors are shown verbatim.
- [x] Browser-supplied model strings are restricted to catalog ids or the
      server-configured model. No provider key value is exposed to the browser,
      logs, workspace, or repo.
- [x] Real OpenCode CLI runs only on the server in a fresh `/tmp` workspace.
- [x] Supabase RLS/GitHub authorization unchanged. PR **#1** was not recreated
      (still <https://github.com/ThaddeusHackz/THE-OPENCODE-WEBSITE/pull/1>).
- [x] `npm run check` — **63 tests** pass (lint + typecheck + vitest);
      `npm run build` passes; credential-pattern scan is negative; no `.env*`
      file with secrets in the repo.
- [x] Deployed to production and verified live (details below).

## Live verification (real HTTP requests, 2026-11-05)

Production deployments: `dpl_65KA1xJZPJmsPfLocSbnpEY7YGth` (`ad961a7`) and
`dpl_2drJMTFR5qyJm7Q6XZT6eDY5UvYY` (`daa9cc3`), both READY / PROMOTED with the
production alias assigned.

| Check | Real result |
|---|---|
| `GET /api/config` | `catalog:"normal"`, `model:"vercel/reflection/beam-free"`, `openCodeConfigured:true`, `missing:[]`, `vercelOidcConfigured:true`, `disableZenFreeModels:true` |
| `GET /api/models` | `count:214`, `providers:45`, `keylessOnVercel:5`, `oidcTokenPresent:true` |
| `GET /api/runtime/poc` | real binary `/var/task/node_modules/@opencode/cli-linux-x64/bin/opencode`, `opencode v2.2.5` |
| Real run: 4 `vercel/*` free models | real `provider.auth` **HTTP 403** `customer_verification_required` from Vercel AI Gateway |
| Real run: `vercel/poolside/laguna-s-2.1-free` | real `provider.no-route` ("Model unavailable") — live catalog drift |
| Real run: `amd/DeepSeek-V4.1-Flash` | honest `OPENCODE_NOT_CONFIGURED` naming `AMD_API_KEY`; no reply generated |
| Real run: Zen `opencode/deepseek-v4.1-flash-free` | `INVALID_MODEL`, "OpenCode Zen models are disabled" |

**Two platform facts we had to solve and verify:**

1. `VERCEL_OIDC_TOKEN` is only a *build-time* env var. In Functions Vercel sends
   it as the `x-vercel-oidc-token` request header. The first normal-model
   deployment honestly reported `vercelOidcConfigured: false`; the second reads
   that header per request and now reports `true` with `missing: []`.
2. The Vercel AI Gateway requires **a credit card on file** to unlock its free
   credits. The OIDC-authenticated request reached the gateway and returned its
   own 403. This is an account setting, not a code defect.

## What still needs a human (honest remaining work)

- [ ] **Add a card on file to the Vercel account** to unlock AI Gateway free
      credits, then re-run `/api/models/test?model=vercel/reflection/beam-free`
      for a successful assistant answer. OR set one free provider key (e.g.
      `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `NVIDIA_API_KEY`, `AMD_API_KEY`,
      `HF_TOKEN`) as a **sensitive** Vercel env var and pick that model.
      Do not paste key values into chat or the repo.
- [ ] **Rotate/revoke the GitHub fine-grained PAT** that was pasted in chat
      earlier. It is compromised. Its value is not in the repo.
- [ ] **Enable Supabase GitHub OAuth** (client id + secret) in the Supabase
      dashboard — the connector does not expose those fields. Until then sign-in
      cannot be exercised; `/api/me` returns `user: null`. RLS policies and
      the redirect allowlist are already in place.
- [ ] Optional: regenerate the catalog when the pinned OpenCode CLI version is
      bumped (the live models.dev catalog can drift from the bundled snapshot).
- [ ] Still **not implemented / deliberately disabled**: Vercel Sandbox adapter,
      multi-minute durable runs, full-source REA binary analysis, automatic
      write-back/publish (`/publish` returns 501).

## Bottom line

The Zen quota dead end is gone. The app now ships the **normal free models
OpenCode supports**, prefers the keyless Vercel AI Gateway ones, exposes the
keyed ones with clear requirements, and is deployed and honestly verified.
**There is still no successful model-backed assistant answer** — blocked by the
Vercel AI Gateway account requirement above — and no reply has ever been faked
or silently switched to a different model.
