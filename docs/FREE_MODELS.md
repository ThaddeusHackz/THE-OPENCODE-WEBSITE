# Official free OpenCode Zen models

## Source of truth

- Live official catalog: <https://opencode.ai/zen/v1/models>
- Official repository `anomalyco/opencode` dev:
  - `packages/core/src/model.ts` → `PREFERRED_FREE = ["big-pickle", "deepseek-v4.1-flash-free", "glm-5.3-flash-free", "muse-spark-1.3-contributor-free"]` with the comment *"Signed out, only free OpenCode models are enabled."* — i.e. **no API key is required**.
  - `packages/core/src/models-dev/snapshot.txt` → the bundled models.dev catalog. Every model under the `opencode` provider with zero input **and** zero output cost is free.
- `docs/providers` (`https://opencode.ai/v2/docs/providers`) confirms the catalog comes from models.dev and that providers are referenced as `providerID/modelID`.
- `https://opencode.ai/v2/docs/console/go` notes free listings are promotional and can change.

`src/lib/models.ts` was generated from the bundled official catalog snapshot: **47 free
models**, each with
`id`, `fullId` (`opencode/<id>`), display name, context window and output limit. No OpenCode
core source code is copied — only public model metadata. `GET /api/models` returns the catalog.

## Models included (all 47)

Preferred first: `big-pickle` (Big Pickle), `deepseek-v4.1-flash-free` (DeepSeek V4.1 Flash Free),
`glm-5.3-flash-free` (GLM-5.3-Flash Free), `muse-spark-1.3-contributor-free` (Muse Spark 1.3 Free).
Also included: `deepseek-v4-flash-free`, `deepseek-v4-pro` variants that are zero-cost in the
catalog, `grok-code` (Grok Code Fast 1), `nemotron-3-ultra-free`,
`nemotron-3.5-lightning-free`, `mimo-v2.5-free`, `hy3-free`, `laguna-s-2.1-free`,
`kimi-k2.5-free`, `minimax-m3-free`, `qwen3.6-plus-free`, `ling-3.0-flash-free`, `beam-free`,
`big-pickle`, `space-bunny-free`, and the rest — the full machine-readable list is at
`GET /api/models`.

Default: `opencode/deepseek-v4.1-flash-free` (the "DeepSeek V4.1 Flash" you asked for).

## What was implemented so they "work"

1. `src/lib/models.ts` — catalog, `isFreeOpenCodeModel()`, `validateModel()`. A browser can only
   choose an official free model or the server-configured model; arbitrary model strings are
   rejected (no option injection, no silent model switch).
2. `src/lib/env.ts` — defaults `OPENCODE_MODEL` to the free DeepSeek V4.1 Flash. Free models
   satisfy `openCodeConfigured` **without** any provider key. Non-free models still require one.
3. `src/lib/runtime/opencode-cli.ts` — `runOpenCodeAgent({ model })` passes the validated model
   to the real CLI (`--model`) and writes it into the workspace `opencode.jsonc`; the child
   still gets a stripped environment. No mock, no fallback LLM.
4. `GET /api/models` — public catalog + catalog source + configured model.
5. `GET|POST /api/models/test?model=opencode/<id>` — **real verification**: spawns the actual
   OpenCode binary with `--standalone run --format json --auto --model <id>` in a fresh `/tmp`
   workspace with the fixed prompt "Reply with the single word OK." Returns the real assistant
   text or the real error, with a hard 90 s cap. Gated by `ENABLE_MODEL_TESTS=1`.
6. UI — a model selector with all 47 free models, "Test this model" and "Test all free models"
   buttons, per-model PASS/FAIL with the real output/error. The selected model is sent with each
   conversation request.
7. Tests — `tests/models.test.ts` asserts the catalog, the DeepSeek V4.1 Flash entry, key-free
   configuration, PAT mode, and model validation.

## Honest caveats

- Free models are **promotional and can disappear or become rate-limited**; the catalog should be
  refreshed from `https://opencode.ai/zen/v1/models` periodically.
- Per the official Go docs, during free periods **collected data may be used to improve the
  model**, and some models are region-restricted. Do not send secrets or confidential source to a
  free endpoint. This prototype already strips host env secrets from the child process and denies
  `.env` reads.
- A model that fails returns its **real** error (timeout, `provider.free-limit`, transport error,
  no output). The app never fabricates a reply and never silently switches to another model.
- The 300 s Hobby function duration caps a single run; `AGENT_TIMEOUT` is returned clearly.

## Live catalog refresh (added after the first verification)

The bundled snapshot drifted: real runs showed `provider.no-route` for
`mimo-v2.5-free`, `nemotron-3-ultra-free`, `north-mini-code-free` and `grok-code`, while
`big-pickle`, `beam-free`, `glm-5.3-flash-free` and `deepseek-v4.1-flash-free` were routable.

`src/lib/models-live.ts` now fetches `https://opencode.ai/zen/v1/models` on each
`GET /api/models` request (8 s timeout, `no-store`), keeps only `type: "chat"` entries with
`cost.text.input.price === 0 && cost.text.output.price === 0`, sorts preferred models first,
and falls back to the vetted snapshot if the official endpoint is unreachable. `validateModel`
accepts any safe `opencode/<id>` so newly added free ids work without a code change; a retired
id returns a real `provider.no-route` error rather than a silent switch.

## Real verification results (2026-11-05, Vercel deployment)

`GET /api/models/test?model=opencode/deepseek-v4.1-flash-free` on
`https://the-opencode-website-poc.vercel.app` spawned the real CLI, called Zen, and returned:

- `provider.free-limit` / HTTP 429 — "Free usage limit reached. Connect a provider or
  subscribe to OpenCode Go to keep going, or switch models."
- `retryAfterMs: 80035000` ≈ 22.2 hours.

Real per-model results: `big-pickle`, `beam-free`, `glm-5.3-flash-free` and
`deepseek-v4.1-flash-free` → the same 429; `mimo-v2.5-free`, `nemotron-3-ultra-free`,
`north-mini-code-free`, `grok-code` → `provider.no-route` (retired). **No model produced a
successful assistant answer.** Full table and raw NDJSON are in `docs/VERCEL_POC.md`.

Therefore "all the free models work perfectly" cannot honestly be claimed: the integration is
complete and verified up to the upstream gateway, but the external free tier is exhausted.
Every result shown in the UI is a real one. When the quota resets — or with OpenCode Go or a
provider key — the same route returns the real model text without any code change.

## Live official catalog at verification time

`GET /api/models` returned `source: "live"`, `count: 10`, `fetchedAt: 2026-11-05T02:48:27Z`:

`big-pickle`, `deepseek-v4.1-flash-free`, `glm-5.3-flash-free`, `beam-free`,
`crouton-alpha-free`, `flint-40b-free`, `mimo-v2.6-flash-free`,
`nemotron-3.5-lightning-free`, `nemotron-3.5-super-vl-free`, `pulse-alpha-free`.

The other 37 ids in the bundled snapshot are no longer zero-cost/available on the live
gateway — real runs returned `provider.no-route` for several of them (`mimo-v2.5-free`,
`nemotron-3-ultra-free`, `north-mini-code-free`, `grok-code`). Showing the snapshot as if all
47 were selectable would be misleading, so `/api/models` prefers the live list. Newly added
`opencode/*` ids are accepted by `validateModel()` and, after a fix, are correctly treated as
key-free by both `runOpenCodeAgent()` and `runOpenCodeSmokeTest()`.

## Final result for all live free models

After fixing the key-free check, all **10** live zero-cost models were verified with real CLI
runs on the fourth deployment. Every one returned the identical upstream
`provider.free-limit` HTTP 429 (retry ~21.7 h). The table in `docs/VERCEL_POC.md` lists each
model's real result. No fake answer exists; the integration is complete and the remaining
blocker is purely the external free-tier quota.
