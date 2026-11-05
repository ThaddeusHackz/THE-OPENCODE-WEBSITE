# Normal free models (NOT OpenCode Zen)

## Why this changed

The previous build used the **OpenCode Zen** promotional free tier (`opencode/*`
models from `https://opencode.ai/zen/v1/models`). Real runs on Vercel showed the
whole tier was quota-limited: every routable free model returned
`provider.free-limit` / HTTP 429 with `retryAfterMs ≈ 78–80,000,000` (~22 h).
Those models are served by the Zen gateway, and the CLI's signed-out free tier
is exactly that gateway — there is no way to avoid the quota from inside the app.

This build **removes Zen entirely** and uses the **normal free models that
OpenCode itself supports through ordinary providers**.

## Source of truth

- `anomalyco/opencode` dev → `packages/core/src/models-dev/snapshot.txt` — the
  bundled **models.dev** catalog (8.2 MB, 230 providers). This is OpenCode's
  normal model list, not Zen.
- Selection: `type: "chat"`, zero **input and output** price, tool-capable, not
  deprecated, from an ordinary provider with a declared credential env var.
  `opencode` and `opencode-go` (Zen) providers are excluded.
- **Validated against the deployed binary**: every id in `src/lib/models.ts` was
  checked against `opencode --standalone models` from the pinned
  `@opencode/cli-linux-x64@2.2.5`, with all provider env names present and
  `OPENCODE_DISABLE_FREE_MODELS=1`. 3 stale dev-branch ids were dropped.
- Result: **214 normal free models across 45 providers**, each with the exact
  credential env var NAME it needs (`envKeys`). `GET /api/models` returns the
  catalog; no credential values are ever returned.

Official provider auth evidence: `packages/ai/src/providers/vercel-ai-gateway.ts`
line 226 → `bearerRouteDefaults(input, ["AI_GATEWAY_API_KEY", "VERCEL_OIDC_TOKEN"], baseURL)`.
`packages/core/src/model.ts` → `OPENCODE_DISABLE_FREE_MODELS` removes zero-cost
models from the `opencode` / `opencode-go` providers.

## Keyless on Vercel

The `vercel` provider (Vercel AI Gateway) has 5 zero-cost tool-capable chat
models in the catalog:

- `vercel/reflection/beam-free` (**default**)
- `vercel/poolside/laguna-s-2.1-free`
- `vercel/nvidia/nemotron-3.5-lightning-free`
- `vercel/stealth/glyph-cluster`
- `vercel/reflection/beam`

Vercel injects `VERCEL_OIDC_TOKEN` into every Function. `buildChildEnv()` passes
it through and exposes it as `AI_GATEWAY_API_KEY` too, so OpenCode enables the
`vercel` provider and authenticates **without any user-supplied API key**. This
is the only keyless normal-free-model path available on serverless Vercel.

All other normal free models need a free API key from their provider, e.g.:

| Model | Needs |
|---|---|
| `amd/DeepSeek-V4.1-Flash` (normal DeepSeek V4.1 Flash) | `AMD_API_KEY` |
| `nvidia/deepseek-ai/deepseek-v4.1-flash` | `NVIDIA_API_KEY` |
| `openrouter/openrouter/free` | `OPENROUTER_API_KEY` |
| `openrouter/google/gemma-4-31b-it:free` | `OPENROUTER_API_KEY` |
| `kilo/kilo-auto/free` | `KILO_API_KEY` |
| `groq/allam-2-7b` | `GROQ_API_KEY` |
| `huggingface/zai-org/GLM-4.7-Flash` | `HF_TOKEN` |

The UI shows the required env var name next to each model, and `/api/config`
reports exactly which credential is missing. No reply is fabricated when a key
is absent, and the app never silently switches to Zen or another model.

## What is wired

1. `src/lib/models.ts` — generated, binary-validated catalog; `validateModel()`
   accepts only normal free ids or the configured model, and explicitly rejects
   `opencode/*` / `opencode-go/*`.
2. `src/lib/env.ts` — widened credential allowlist (52 env names), per-model key
   check, ignores an old Zen `OPENCODE_MODEL`, `OPENCODE_DISABLE_FREE_MODELS=1`.
3. `src/lib/runtime/opencode-cli.ts` — child env gets only allowlisted provider
   keys plus the OIDC alias; `OPENCODE_DISABLE_FREE_MODELS=1` disables Zen;
   `assertModelKeysConfigured()` fails honestly with the exact missing env name.
4. `GET /api/models` — normal catalog, `envKeys`, `keylessOnVercel`, key status.
5. `GET|POST /api/models/test?model=<provider>/<id>` — real CLI run per model,
   gated by `ENABLE_MODEL_TESTS=1`; real text or real error, never a fake reply.
6. UI model selector over all 214 normal free models with provider + key name.
7. `tests/models.test.ts`, `tests/runtime.test.ts` — 58 tests total pass.

## Honest caveats

- Free models can be promotional and region/rate limited; the catalog should be
  regenerated when the pinned OpenCode CLI version changes.
- Most normal providers require **a free API key**. Set it as a sensitive Vercel
  env var — never paste it into chat, the repo, or `NEXT_PUBLIC_*`.
- The `vercel` provider relies on Vercel's OIDC token; it will not work in a
  plain local `npm run dev` outside Vercel (config will show the missing token).
- No silent fallback: if the chosen model fails, the real error is displayed.

## Live verification (production, 2026-11-05)

Deployment `dpl_2drJMTFR5qyJm7Q6XZT6eDY5UvYY` / commit `daa9cc3`. Real HTTP
requests against `https://the-opencode-website-poc.vercel.app`:

- `/api/config` → `openCodeConfigured: true`, `missing: []`,
  `vercelOidcConfigured: true`, `disableZenFreeModels: true`.
- `/api/models` → 214 models / 45 providers / 5 keyless, `oidcTokenPresent: true`.
- `/api/runtime/poc` → real `opencode v2.2.5` binary present.
- Four `vercel/*` keyless models → real `provider.auth` 403
  `customer_verification_required` from the Vercel AI Gateway: the account
  needs a card on file to unlock its free credits. The OIDC token was accepted
  as authentication; this is not a missing-key error.
- `vercel/poolside/laguna-s-2.1-free` → `provider.no-route` (live catalog drift;
  it remains in the catalog but was demoted from "preferred", and the app shows
  the real error rather than hiding it).
- `amd/DeepSeek-V4.1-Flash` → honest `OPENCODE_NOT_CONFIGURED` naming
  `AMD_API_KEY`. No reply was generated.
- Any `opencode/*` Zen id → `INVALID_MODEL`, "OpenCode Zen models are disabled".

### OIDC token delivery (important)

`VERCEL_OIDC_TOKEN` exists as an env var only during **builds** and in local dev
(`vercel env pull`). In a Function it arrives as the **`x-vercel-oidc-token`
request header**. `src/lib/runtime/credentials.ts` reads it per request and
exposes it to the child under both `VERCEL_OIDC_TOKEN` and
`AI_GATEWAY_API_KEY`, without mutating `process.env` (Fluid compute can serve
concurrent invocations with different tokens). Only presence is ever reported;
the value is never returned, logged, or persisted.

### What is needed for a successful answer

1. **Keyless `vercel/*` models:** add a card on file to the Vercel account to
   unlock AI Gateway free credits (Vercel's own requirement), then re-run
   `/api/models/test?model=vercel/reflection/beam-free`.
2. **Any other normal free model:** set that provider's free key as a sensitive
   Vercel env var (the UI and `/api/models` show the exact name), then select it.

Neither step involves putting a key value in the repo or in chat. No fake reply
is generated while either is missing.
