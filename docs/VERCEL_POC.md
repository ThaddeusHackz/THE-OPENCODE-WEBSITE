# Real Vercel Function proof of concept — result
> **Historical note (read first).** The sections below describe the original
> **OpenCode Zen** proof of concept (`opencode/*` free models) and its live
> verification. That path was **rejected**: every Zen free model returned
> `provider.free-limit` HTTP 429. The **current build uses normal free models
> from ordinary providers** (`models.dev`), keyless on Vercel via the automatic
> `VERCEL_OIDC_TOKEN`. See [FREE_MODELS.md](FREE_MODELS.md) and
> [the fifth deployment in VERCEL_POC.md](VERCEL_POC.md). The binary, function,
> Supabase/RLS, and GitHub findings below remain valid infrastructure facts.

**Result: the actual OpenCode v2.2.5 binary DID run inside a deployed Vercel Node.js Function.**

## What was created (external Vercel resources)

| Resource | Value |
|---|---|
| New Vercel project | `the-opencode-website-poc` (`prj_Yg3db0S7VyiNTHA4BhpHe5IsSDlY`) in team `thaddeus' projects` |
| Project env var | `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` (plain, all targets) |
| Framework / runtime | Next.js 16.4.5, Node.js **22.x**, Fluid compute + Active CPU, `functionTimeout: 300`, region `iad1`, Hobby plan |
| Deployment | `dpl_EkZXxPf7WvE9taASL5Z2xYiXT8Vi`, production, from branch `arena/3a7379f3-the-opencode-website` at `becdc61` |
| Public URL | <https://the-opencode-website-poc.vercel.app> |

This created a new project and one production deployment on the connected Vercel account.
It did not modify or delete any existing project, domain, env var or deployment.

## Sequence

1. `validate_credential` → `success: true`; `get_authenticated_user` confirmed the Hobby account.
2. `list_projects` showed no project for this repository, so a new project was created explicitly
   (no project was auto-created by the deployment call).
3. `create_env_var` set `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`; `update_project` set `framework: nextjs`.
4. A first attempt to deploy a tiny standalone PoC via `create_deployment` with inline `files`
   failed: `400 Bad Request … files[0].data should be string`. That is a connector validation
   limitation, not an application error. Recovered by committing/pushing the branch and using
   `git_source: {type:"github", repoId:1446385292, ref:"arena/3a7379f3-the-opencode-website"}`.
5. Build logs (`get_deployment_events`): cloned the branch, `npm install` added 198 packages,
   detected Next.js 16.4.5, `vercel build` completed in 32 s, generated 8 Node.js functions,
   `Deploying outputs...`. `get_deployment` → `READY` / `PROMOTED` in ~77 s.
6. `list_deployment_files` returned `404 File tree not found` for this deployment type; the
   binary's presence was proven directly by running it (below), not by listing the tree.

## The proof

`GET https://the-opencode-website-poc.vercel.app/api/runtime/poc` (public, read-only: only
spawns `opencode --version` inside a fresh `/tmp` workspace):

```json
{
  "available": true,
  "runtimeId": "opencode-cli",
  "binaryPath": "/var/task/node_modules/@opencode/cli-linux-x64/bin/opencode",
  "versionOutput": "opencode v2.2.5",
  "error": null,
  "ephemeralWorkspace": true
}
```

`GET /api/config` on the same deployment:

```json
{
  "supabaseConfigured": false,
  "githubAppConfigured": false,
  "openCodeConfigured": false,
  "binaryPathProvided": false,
  "missing": [
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY / GITHUB_APP_INSTALLATION_ID",
    "OPENCODE_MODEL",
    "one model-provider key (see .env.example)"
  ],
  "setupMessage": "Setup incomplete. Configure: … The agent will not run and no reply will be fabricated."
}
```

`GET /` renders the responsive sign-in screen with the "not affiliated with the OpenCode team"
notice. No fake agent reply is produced.

## What this proves, and what it does not

**Proven on real Vercel infrastructure**

- Node.js Functions can spawn a native child process (`child_process.spawn`).
- The 241 MB `@opencode/cli-linux-x64@2.2.5` binary is bundled successfully when
  `next.config.ts` `outputFileTracingIncludes` names it and Large Functions are enabled.
- The binary is dynamically linked but runs on Vercel's runtime image (glibc/loader compatible).
- `/tmp` is writable: `withTempWorkspace` created a fresh `mkdtemp` workspace and removed it.
- OpenCode's `--standalone`/version path works without the shared port 49374 service.
- The website, API routes and setup-status UI build and deploy on Vercel.

**NOT proven / still blocked**

- A **full model-backed `opencode run`** on Vercel. The deployed project has no `OPENCODE_MODEL`
  and no provider key, so `configStatus()` correctly returns `openCodeConfigured: false` and
  `/api/agent/run` would return `OPENCODE_NOT_CONFIGURED` rather than a fabricated reply.
  Locally, a real `run` with a dummy key produced genuine NDJSON `step_start` events and hit the
  hard `AGENT_TIMEOUT` (no provider network access in this sandbox).
- Supabase Auth/Postgres, GitHub App, encrypted secrets and RLS are configured by you, not by me.
- Function duration for a multi-minute agent run (300 s Hobby default) is untested; the adapter
  returns a clear `AGENT_TIMEOUT` error if it cannot finish.
- Vercel Sandbox (microVM) adapter was not implemented; it remains the recommended production
  path for long runs.

## Smallest remaining change

Set `OPENCODE_MODEL` and one encrypted provider key on the project, then call the authenticated
`/api/runtime/probe` and send a conversation request. No source change is needed for the binary
spawn. For longer runs, add the `VercelSandboxAdapter` described in `docs/ARCHITECTURE.md`.

---

# Second deployment — free models, PAT fallback, Supabase, real model-backed run

Deployment `dpl_4egrjDETAEJq5Uv5cjKg6Ap4iCqX`, git source
`arena/3a7379f3-the-opencode-website` @ `c80b210b23ccfd2bcc821e69ae2083886b0910e1`,
Node 22.x / Hobby / iad1 / Fluid + Active CPU / `functionTimeout: 300` / 10 Node functions.
Final state `READY` → `PROMOTED`, `timeToReady: 65535`. Alias
`the-opencode-website-poc.vercel.app` assigned. The build env list confirms
`VERCEL_SUPPORT_LARGE_FUNCTIONS`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ENABLE_MODEL_TESTS`, `OPENCODE_MODEL`, `GITHUB_TOKEN`
(all present; values not exposed here).

## Live configuration (after env vars were added)

`GET https://the-opencode-website-poc.vercel.app/api/config`

```json
{
  "supabaseConfigured": true,
  "githubAppConfigured": false,
  "githubPatConfigured": true,
  "githubMode": "pat",
  "openCodeConfigured": true,
  "binaryPathProvided": false,
  "model": "opencode/deepseek-v4.1-flash-free",
  "freeModel": true,
  "modelTestsEnabled": true,
  "missing": [],
  "setupMessage": "Configuration present. Using opencode/deepseek-v4.1-flash-free (official free OpenCode Zen model, no API key needed). The real OpenCode runtime is attempted on the server only."
}
```

`GET /api/runtime/poc` still returns

```json
{"available":true,"runtimeId":"opencode-cli","binaryPath":"/var/task/node_modules/@opencode/cli-linux-x64/bin/opencode","versionOutput":"opencode v2.2.5","error":null,"ephemeralWorkspace":true}
```

`GET /api/models` returned 47 zero-cost official models (preferred first:
`big-pickle`, `deepseek-v4.1-flash-free`, `glm-5.3-flash-free`,
`muse-spark-1.3-contributor-free`) from the official catalog. A later commit changed this
route to read the **live** `https://opencode.ai/zen/v1/models` catalog with a snapshot
fallback, because some bundled ids are retired.

## Real model-backed run on Vercel

`GET /api/models/test?model=opencode%2Fdeepseek-v4.1-flash-free` executes a fresh
`opencode --standalone run --format json --auto --model opencode/deepseek-v4.1-flash-free`
in a temp `/tmp` workspace with the prompt "Reply with the single word OK." Exact real result:

```json
{
  "ok": false,
  "runtimeId": "opencode-cli",
  "model": "opencode/deepseek-v4.1-flash-free",
  "text": null,
  "error": "Free usage limit reached. Connect a provider or subscribe to OpenCode Go to keep going, or switch models.",
  "exitCode": 1,
  "durationMs": 6038,
  "timedOut": false,
  "stdout": "{\"type\":\"error\",...\"error\":{\"type\":\"provider.free-limit\",\"message\":\"Free usage limit reached...\",\"status\":429,...},\"retryAfterMs\":80035000}"
}
```

Native CLI stdout contained the genuine upstream NDJSON error:

```json
{"type":"error","error":{"type":"provider.free-limit","message":"Free usage limit reached. Free models work in OpenCode (https://opencode.ai); subscribe to OpenCode Go to keep going: https://opencode.ai/go"},"status":429,"retryAfterMs":80035000}
```

`retryAfterMs: 80035000` ≈ **22.2 hours**. No assistant text, no fabricated reply, no silent
model switch.

### Other free models actually tested on the same deployment

| Model | Real result |
|---|---|
| `opencode/big-pickle` | `provider.free-limit` HTTP 429, `retryAfterMs: 78134000`, 19.5 s |
| `opencode/glm-5.3-flash-free` | `provider.free-limit` HTTP 429, `retryAfterMs: 78132000`, 19.2 s |
| `opencode/beam-free` | `provider.free-limit` HTTP 429, `retryAfterMs: 78014000`, 20.6 s |
| `opencode/deepseek-v4.1-flash-free` | `provider.free-limit` HTTP 429, `retryAfterMs: 80035000`, 6.0 s |
| `opencode/mimo-v2.5-free` | `provider.no-route` — `Model unavailable: opencode/mimo-v2.5-free` |
| `opencode/nemotron-3-ultra-free` | `provider.no-route` — `Model unavailable: opencode/nemotron-3-ultra-free` |
| `opencode/north-mini-code-free` | `provider.no-route` — `Model unavailable: opencode/north-mini-code-free` |
| `opencode/grok-code` | `provider.no-route` — `Model unavailable: opencode/grok-code` |

A few requests failed at the HTTP-fetch layer under concurrency and were not counted as model
results. No model returned `ok: true`.

## What this second deployment proves

1. The whole runtime chain works on Vercel: Next.js Route Handler → `child_process.spawn` →
   real 241 MB OpenCode binary → `--standalone run` → workspace `opencode.jsonc` → network
   request to OpenCode Zen → NDJSON parsed back into an HTTP response.
2. Configuration is complete: Supabase public env, GitHub PAT (sensitive), free model, and
   model-test gate are all live, with `missing: []`.
3. Free `opencode/*` models genuinely require **no provider key** — the CLI reached the model
   gateway and got a quota error, not "no credentials".
4. The blocker is now **external**: OpenCode's promotional free tier is exhausted for this
   deployment, and some bundled free ids have been retired. Neither can be fixed in this repo.

## What remains

- Wait for the free quota reset (~22 h), subscribe to OpenCode Go, or set a provider key with
  a non-free `OPENCODE_MODEL`; then repeat `/api/models/test` to obtain a real assistant answer.
- Enable the Supabase GitHub OAuth provider in the dashboard (connector cannot set the OAuth
  client id/secret). See `docs/SUPABASE.md`.
- Rotate/revoke the fine-grained PAT that was pasted in chat.
- Optional: `VercelSandboxAdapter` for multi-minute runs; write-back remains deliberately off.

## Third deployment — live catalog refresh

`dpl_C8KZNeJfUzyfMX3BS5bN85hdVk9Z`, git ref pinned to commit
`456615bd176e4209d68b7598e96903d3cc4e4149`. This deployment replaces the static
47-model list in `/api/models` with a live read of `https://opencode.ai/zen/v1/models`
(snapshot fallback), relaxes `validateModel()` for newly added official free ids, adds quota
metadata to `/api/models/test` results, and records the real 429 findings in the docs.

## Third deployment verification — all 10 live free models

`GET /api/models?v=20261105c` on `dpl_C8KZNeJfUzyfMX3BS5bN85hdVk9Z` returned
`source: "live"`, `count: 10`:

```
big-pickle, deepseek-v4.1-flash-free, glm-5.3-flash-free, beam-free,
crouton-alpha-free, flint-40b-free, mimo-v2.6-flash-free,
nemotron-3.5-lightning-free, nemotron-3.5-super-vl-free, pulse-alpha-free
```

Each was run through `GET /api/models/test?model=opencode/<id>` (real CLI, real Zen request,
tiny prompt "Reply with the single word OK."). Real results:

| Live free model | Result |
|---|---|
| `big-pickle` | HTTP 429 `provider.free-limit`, ~21.7 h retry |
| `deepseek-v4.1-flash-free` | HTTP 429 `provider.free-limit`, ~22.2 h retry |
| `glm-5.3-flash-free` | HTTP 429 `provider.free-limit`, ~21.7 h retry |
| `beam-free` | HTTP 429 `provider.free-limit`, ~21.7 h retry |
| `flint-40b-free` | HTTP 429 `provider.free-limit`, `retryAfterMs: 77635000` (21.6 h) |
| `mimo-v2.6-flash-free` | HTTP 429 `provider.free-limit`, `retryAfterMs: 77637000` (21.6 h) |
| `nemotron-3.5-lightning-free` | HTTP 429 `provider.free-limit`, `retryAfterMs: 77610000` (21.6 h) |
| `nemotron-3.5-super-vl-free` | HTTP 429 `provider.free-limit`, `retryAfterMs: 77609000` (21.6 h) |
| `crouton-alpha-free` | Initially `OPENCODE_NOT_CONFIGURED` (bug: a new live id was not in the 47-id snapshot, so the adapter wrongly demanded a provider key). After the fix: real run → HTTP 429 `provider.free-limit`, `retryAfterMs: 78138000` (21.7 h) |
| `pulse-alpha-free` | Same bug class. After the fix: real run → HTTP 429 `provider.free-limit`, `retryAfterMs: 77988000` (21.7 h) |

**No model produced a successful assistant answer.** The quota error is uniform across every
routable free model, indicating a deployment/account-wide free-tier limit rather than a
per-model issue. The quota metadata is now returned explicitly, e.g.:

```json
{"ok":false,"model":"opencode/flint-40b-free","error":"OPENCODE_FREE_LIMIT: Free usage limit reached. ... Retry in about 21.6 h.","exitCode":1,"durationMs":5792,"quota":{"retryAfterMs":77635000,"retryAfterHours":21.6}}
```

No reply was fabricated, no model was silently switched, and no provider key was invented.

## Fourth deployment — key-free fix for new live free ids

`dpl_E8GbeWKg9dcEXFZXi3vsTkPQ28h7`, commit
`4579ee6bc54f791d25d562d8886e47092cc121ca`. Fixed `runOpenCodeAgent()` and
`runOpenCodeSmokeTest()` to treat **every** validated `opencode/*` id as free (no provider key
needed) rather than checking membership in the 47-id bundled snapshot. This resolves the
`OPENCODE_NOT_CONFIGURED` error seen for newly added live ids such as `crouton-alpha-free` and
`pulse-alpha-free`.

## Final state of the fourth deployment

`GET /api/config?v=final` → `missing: []`, `githubMode: "pat"`, `freeModel: true`.
`GET /api/models/test?v=final1&model=opencode/crouton-alpha-free` and
`...&model=opencode/pulse-alpha-free` both now spawn the real CLI and return the real
`provider.free-limit` HTTP 429 with quota metadata — confirming the key-free fix works for
ids that were not in the bundled snapshot.

**All 10 currently-live official free models have now been individually run through the real
OpenCode CLI on Vercel. Every one returned the same upstream free-tier quota error. There is
still no successful model-backed assistant answer, and no fake reply has been produced.**

---

# Fifth and sixth deployments — NORMAL free models (current end state)

The four Zen deployments above are **historical**. All ten live `opencode/*` free
models returned `provider.free-limit` HTTP 429 (~22 h cooldown), so Zen was
removed from the product path entirely.

| Deployment | Commit | Result |
|---|---|---|
| `dpl_65KA1xJZPJmsPfLocSbnpEY7YGth` | `ad961a7963b5156413899f801010776e31078ec5` | READY / PROMOTED, `timeToReady: 69992`, production alias assigned. Normal-model catalog shipped. |
| `dpl_2drJMTFR5qyJm7Q6XZT6eDY5UvYY` | `daa9cc37b883583b75b4464702999a3aa16c8f91` | READY / PROMOTED, `timeToReady: 67834`, production alias assigned. Per-request OIDC header fix. |

Vercel env `OPENCODE_MODEL` is now `vercel/reflection/beam-free` and
`OPENCODE_DISABLE_FREE_MODELS=1` was added. OIDC Federation is enabled on the
project (`oidcTokenConfig.enabled: true`).

## Important platform finding

`VERCEL_OIDC_TOKEN` is listed in the deployment's **build** env, but it is **not**
in `process.env` inside a Function. Vercel delivers the token per invocation as
the `x-vercel-oidc-token` **request header** ([system env vars doc][1],
[OIDC reference][2]). The first normal-model deployment therefore reported
`vercelOidcConfigured: false` / `missing: ["credential for
vercel/reflection/beam-free: AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN"]`.
`src/lib/runtime/credentials.ts` now reads that header per request and places it
in an in-memory env record (never mutating `process.env`, never returning or
logging the value). That record is threaded through `configStatus`,
`assertModelKeysConfigured`, `buildChildEnv` and `redactSecrets`.

[1]: https://vercel.com/docs/environment-variables/system-environment-variables
[2]: https://vercel.com/docs/oidc/reference

## Live results on `dpl_2drJMT...` (2026-11-05, real HTTP requests)

`GET /api/config?v=oidc1` →
`openCodeConfigured: true`, `missing: []`, `catalog: "normal"`,
`model: "vercel/reflection/beam-free"`, `keylessOnVercel: true`,
`vercelOidcConfigured: true`, `disableZenFreeModels: true`,
`missingModelEnvKeys: []`. Setup message: "normal Vercel AI Gateway free model;
keyless via the automatic OIDC token".

`GET /api/models?v=oidc1` → `count: 214`, `providers: 45`,
`keylessOnVercel: 5`, `catalog: "normal"`, `oidcTokenPresent: true`,
`defaultModel` / `configuredModel` = `vercel/reflection/beam-free`. No credential
values, only env var NAMES.

`GET /api/runtime/poc?v=normal1` → real binary
`/var/task/node_modules/@opencode/cli-linux-x64/bin/opencode`,
`opencode v2.2.5`, `available: true`.

Real `opencode --standalone run` model tests (each spawns the actual CLI in a
fresh `/tmp` workspace, ~3–4 s each):

| Model | Real outcome |
|---|---|
| `vercel/reflection/beam-free` (default) | `provider.auth` HTTP 403 `customer_verification_required`: "AI Gateway requires a valid credit card on file to service requests… to add a card and unlock your free credits." |
| `vercel/nvidia/nemotron-3.5-lightning-free` | Same real 403 `customer_verification_required` |
| `vercel/stealth/glyph-cluster` | Same real 403 `customer_verification_required` |
| `vercel/reflection/beam` | Same real 403 `customer_verification_required` |
| `vercel/poolside/laguna-s-2.1-free` | `provider.no-route` — "Model unavailable" (live OpenCode catalog no longer routes this dev-snapshot id; demoted from preferred) |
| `amd/DeepSeek-V4.1-Flash` (keyed normal free model) | `OPENCODE_NOT_CONFIGURED`: "Missing credential for amd/DeepSeek-V4.1-Flash: AMD_API_KEY … No reply was generated." |
| `opencode/deepseek-v4.1-flash-free` (Zen) | `INVALID_MODEL`: "OpenCode Zen models are disabled; choose a normal provider free model" |

**Interpretation.** The keyless normal-model path is proven end-to-end:
Function → real OpenCode CLI → `vercel-ai-gateway` provider → real HTTPS call to
the Vercel AI Gateway, authenticated by the automatic OIDC token. The gateway
accepted the request far enough to return its own account-verification 403. That
is a **Vercel account requirement** (a card on file to unlock free AI Gateway
credits), not a missing API key and not a code bug. Four of five keyless ids
reach it; one id has drifted out of the live catalog.

**There is still no successful model-backed assistant answer, and no reply has
been fabricated or silently switched.** To get one, either add a card on file to
the Vercel account (unlocking AI Gateway free credits for the `vercel/*` models),
or set any one free provider credential (e.g. `OPENROUTER_API_KEY`,
`GROQ_API_KEY`, `NVIDIA_API_KEY`, `AMD_API_KEY`, `HF_TOKEN`) as a sensitive
Vercel env var and select one of the other 209 normal free models.

No provider key values, OIDC token, GitHub PAT or Supabase service-role key are
in the browser, logs, workspace or repository. `npm run check` (63 tests),
`npm run build`, and a credential-pattern scan all pass.
