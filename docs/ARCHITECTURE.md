# Architecture, Vercel constraints and the runtime adapter boundary
> **Historical note (read first).** The sections below describe the original
> **OpenCode Zen** proof of concept (`opencode/*` free models) and its live
> verification. That path was **rejected**: every Zen free model returned
> `provider.free-limit` HTTP 429. The **current build uses normal free models
> from ordinary providers** (`models.dev`), keyless on Vercel via the automatic
> `VERCEL_OIDC_TOKEN`. See [FREE_MODELS.md](FREE_MODELS.md) and
> [the fifth deployment in VERCEL_POC.md](VERCEL_POC.md). The binary, function,
> Supabase/RLS, and GitHub findings below remain valid infrastructure facts.

## 1. What was verified from official documentation

Sources (official): <https://github.com/anomalyco/opencode>,
<https://opencode.ai/v2/docs/cli>, `/config`, `/mcp-servers`, `/permissions`, `/providers`,
<https://vercel.com/docs/functions/limitations>, `/runtimes/node-js`, `/runtimes`,
`/node-js-versions`, `/sandbox`.

| Requirement | Official Vercel behaviour | Consequence here |
|---|---|---|
| Runtime / Node | Node.js 22.x / 24.x / 26.x (26 default, minor/patch automatic); full Node.js APIs, Web-standard handlers, TypeScript `/api` | `export const runtime = 'nodejs'`; `engines.node = 22.x`; all routes are Route Handlers, no browser SDK |
| Process execution | Full Node.js APIs including `child_process` are available in Node.js Functions | `spawn()` of the real OpenCode binary is possible in principle |
| Writable temp dir | Read-only function filesystem plus a writable `/tmp` (up to 500 MB) | Every request uses `fs.mkdtemp(os.tmpdir())`, removed in `finally`; no persistent workspace |
| Package / binary size | 250 MB uncompressed bundle by default; 5 GB with **Large Functions** beta (`VERCEL_SUPPORT_LARGE_FUNCTIONS=1`, Fluid compute + Active CPU) | OpenCode's binary is ~241 MB (252,713,136 bytes); bundled successfully with Large Functions + `outputFileTracingIncludes` — **verified by deployment** (`docs/VERCEL_POC.md`) |
| Function duration | Hobby 300 s; Pro/Enterprise 300 s default, 800 s max (1800 s extended beta); 504 `FUNCTION_INVOCATION_TIMEOUT` | `maxDuration = 300`, hard `OPENCODE_TIMEOUT_MS` (default 240 000 ms), clear `AGENT_TIMEOUT` error |
| Alternate compute | Vercel Sandbox: isolated Linux Firecracker microVMs, `@vercel/sandbox`, `Sandbox.create()` / `runCommand`, up to 45 min, full filesystem | Documented as the smallest follow-up adapter below; **not implemented** |

Vercel's own docs describe Node.js Functions as isolated microVMs with a read-only
filesystem. A process spawned by a handler runs inside the invocation; no process, file or
background job is assumed to survive it. Snap-based installation is impossible there
(no `sudo`/snapd, read-only root).

## 2. What the real OpenCode runtime is

- `@opencode/cli@2.2.5` is a small npm launcher. Its `postinstall.mjs` selects a
  platform package by OS/CPU/glibc vs musl/AVX2, hardlinks/copies its binary to
  `bin/opencode.exe`, and verifies it with `--version`.
- `@opencode/cli-linux-x64@2.2.5` contains **one** dynamically linked ELF executable of
  252,713,136 bytes (~241 MiB). `readelf`/`ldd` show it needs `libc.so.6`,
  `ld-linux-x86-64.so.2`, `libpthread.so.0`, `libdl.so.2`, `libm.so.6` and glibc symbols up
  to `GLIBC_2.17` — modest requirements. The real deployment spawned the binary successfully,
  so the Vercel runtime image is compatible (`docs/VERCEL_POC.md`).
- `opencode run --format json` emits newline-delimited JSON:
  `{"type":"text",...,"part":{"text":"..."}}` and
  `{"type":"error",...,"error":{"type":"...","message":"..."}}`
  (`packages/cli/src/run/noninteractive.ts`). The adapter parses exactly these.
- `--standalone` starts a private server for the run instead of the shared background
  service. This avoids the hardcoded managed port `49374` conflict
  ([#52234](https://github.com/anomalyco/opencode/issues/52234)).
- Config V2 uses `mcp.servers.<name>`; `mcp.<name>` is ignored
  ([#56602](https://github.com/anomalyco/opencode/issues/56602)). Permissions are
  `{action, resource, effect}` rules; `shell`, `external_directory`, `webfetch`,
  `websearch`, `subagent`, `execute` and `.env` reads are denied in the workspace config.
- A real run requires a model and a provider key. With none, the CLI returns a genuine
  `provider.no-route` / `Model unavailable: anthropic/claude-sonnet-4-5` error (verified
  locally with `opencode --standalone run`). There is no offline fallback model.

## 3. What this prototype actually does

```
Browser ──(cookie session)──> Next.js Route Handler (Vercel Node.js Function)
   │                              │
   │                              ├─ Supabase Auth getUser() → verified user.id
   │                              ├─ GitHub App JWT → installation token
   │                              ├─ /installation/repositories + collaborator check
   │                              ├─ GET /repos/{owner}/{repo}/tarball/{ref} → /tmp
   │                              ├─ tar extract (strip 1, path/symlink/size guards)
   │                              ├─ write strict opencode.jsonc into /tmp workspace
   │                              ├─ before/after bounded file snapshots
   │                              ├─ spawn real binary:
   │                              │    opencode --standalone run --format json --auto
   │                              │            --model <model>   (prompt via stdin)
   │                              │    env = PATH + /tmp XDG_* + allowlisted model keys
   │                              ├─ parse JSON events, redact secrets, compute diff
   │                              ├─ save user/assistant/system messages + bounded diff
   │                              └─ rm -rf /tmp workspace in finally
   └── saved conversations ───── Supabase Postgres (RLS, user_id)
```

`/api/runtime/probe` (authenticated) and `/api/runtime/poc` (public, read-only) are the
**real minimal PoC**: they spawn the actual binary with `--version` inside a fresh `/tmp`
workspace and report the real stdout/exit code. It is not a mock, not an echo, and not a
model call. A production deployment on a Hobby project returned
`{"available":true,"binaryPath":"/var/task/node_modules/@opencode/cli-linux-x64/bin/opencode","versionOutput":"opencode v2.2.5"}`
— see `docs/VERCEL_POC.md` for the exact result, build logs and created resources.

### Runtime adapter boundary

`src/lib/runtime/` defines one adapter, `opencode-cli`, implementing:

```ts
interface RuntimeAdapter {
  id: 'opencode-cli';
  probe(): Promise<RuntimeProbeResult>;
  run(request: AgentRunRequest): Promise<AgentRunResult>;
}
```

There is **no mock adapter, no fallback coding model, and no simulated reply**. In the current
build the catalog is **normal (non-Zen) free models**; each declares the credential env var
NAME it needs, and `vercel/*` models are satisfied by Vercel's automatic OIDC token. When the
binary is missing the API returns `OPENCODE_RUNTIME_NOT_FOUND`; when the chosen model's key is
absent it returns `OPENCODE_NOT_CONFIGURED` with the exact missing env name. A browser-supplied
`model` is validated against the catalog / the configured model before it reaches the CLI, so
there is no silent switch. Real upstream errors (`provider.free-limit`, `provider.no-route`,
`AGENT_TIMEOUT`) are surfaced and recorded as `system` messages. A `VercelSandboxAdapter`
could implement the same interface in the future without changing any route or UI code.

## 4. Runtime blockers: resolved vs remaining

**Resolved by a real deployment** (`docs/VERCEL_POC.md`, deployment
`dpl_EkZXxPf7WvE9taASL5Z2xYiXT8Vi`, <https://the-opencode-website-poc.vercel.app>):

| Former concern | Result |
|---|---|
| 241 MB binary exceeds the standard 250 MB function bundle | Resolved with `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` (Fluid compute + Active CPU) and `outputFileTracingIncludes`; the binary appeared at `/var/task/node_modules/@opencode/cli-linux-x64/bin/opencode` |
| Vercel image lacks the required glibc / dynamic loader | Resolved — the real binary executed and printed `opencode v2.2.5` |
| Node.js Functions cannot spawn native processes | Resolved — `child_process.spawn` worked |
| `/tmp` is not writable / isolated workspace impossible | Resolved — `withTempWorkspace` created and removed a fresh `/tmp` workspace |
| Shared service port 49374 conflict | Avoided by `--standalone` (used by the adapter) |

**Resolved in the second deployment** (`dpl_4egrjDETAEJq5Uv5cjKg6Ap4iCqX`,
commit `c80b210` and later):

| Former concern | Result |
|---|---|
| No model configured | `OPENCODE_MODEL=opencode/deepseek-v4.1-flash-free`; `configStatus()` returns `openCodeConfigured: true`, `freeModel: true`, `missing: []` from the live site |
| No GitHub access | Server-side fine-grained PAT fallback added (App still preferred); live `githubMode: "pat"` |
| No Supabase | Publishable key + project URL set; migration applied and verified; redirect allowlist extended |
| Free model catalog stale | `/api/models` now reads the **live** official catalog (10 zero-cost chat models at verification time) with the 47-model snapshot fallback; a newly added id is treated as free and needs no key |
| No way to verify each free model | `GET/POST /api/models/test?model=opencode/<id>` runs the real CLI with a tiny prompt and returns the real text or real error |

**Remaining (external / not in this repo's control):**

1. **Upstream Zen free quota — HISTORICAL, now avoided.** All live `opencode/*` free models
   returned `provider.free-limit` / HTTP 429 (~22 h). The product path was therefore changed
   to normal free models from ordinary providers, with `OPENCODE_DISABLE_FREE_MODELS=1`
   removing Zen models from the child process. Free providers can still have their own
   rate limits; the app reports them honestly rather than fabricating a reply.
2. **Duration.** A single HTTP request must finish within `maxDuration` (300 s Hobby).
   Long runs return `AGENT_TIMEOUT` (or Vercel's 504) instead of a partial fake answer.
   A `VercelSandboxAdapter` (microVM) is the production path for multi-minute runs.
3. **Supabase GitHub OAuth.** The connector cannot set the OAuth client id/secret;
   `external_github_enabled` remains `false`. Enable it once in the dashboard
   (`docs/SUPABASE.md`). Until then `/api/me` returns `user: null` and the sign-in button
   cannot start OAuth.
4. **Snap / privileged install.** Still impossible in Vercel Functions; see `docs/SETUP.md`.
5. **PAT rotation.** The PAT pasted in chat is compromised; rotate/revoke it and replace the
   sensitive Vercel env var.

So: **the actual OpenCode binary ran a full model-backed `opencode run` on Vercel** and the
whole chain (Function → CLI → `--standalone` → upstream request → NDJSON error) is proven.
The Zen-era runs never produced a successful assistant answer because that free tier was
exhausted; the normal-model build is verified separately in the fifth deployment notes.

## 5. Smallest change that completes the end-to-end agent run

**Option A — this Function (already proven for the binary; only credentials remain):**

1. ✅ Enable Large Functions: `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` with Fluid compute +
   Active CPU (done on the PoC project).
2. ✅ Confirm `node_modules/@opencode/cli-linux-x64/bin/opencode` is in the deployed bundle
   (done: `GET /api/runtime/poc` returned `available: true`, `opencode v2.2.5`).
3. Set `OPENCODE_MODEL` and one provider key as encrypted env vars on the Vercel project.
4. Provision Supabase (migration + GitHub provider) and the GitHub App, then set their env
   vars. Sign in, select a repo, and send a request. No source change is needed for the
   runtime adapter.

**Option B — Vercel Sandbox (removes size and duration constraints):**

Add a second `RuntimeAdapter` that calls `@vercel/sandbox`'s `Sandbox.create()` with an
OIDC token, `runCommand` to execute the official installer/binary inside the microVM, and
reads back stdout/diff. Purge the sandbox after the request. The website, auth, DB, GitHub
App, validation and UI stay identical; only `src/lib/runtime/index.ts` changes. This is the
recommended production path for multi-minute coding-agent runs. It needs `@vercel/sandbox`
and a Vercel project with Sandbox enabled; it was **not implemented** here.

## 6. Security invariants

- GitHub App private key, installation token and model keys never leave the server. The
  installation token is generated per request and is never stored.
- The child process gets a **new** environment (not `process.env`): `PATH`, `HOME`/`XDG_*`
  inside `/tmp`, `CI`, `NO_COLOR`, plus allowlisted model keys. GitHub/Supabase/Vercel env
  vars are absent.
- Untrusted input: strict `owner/repo` and ref validators, `isSafeArchivePath` for every tar
  member, rejection of symlinks/devices/links, bounded archive, file and output sizes, and a
  strict workspace `opencode.jsonc`.
- Ownership: RLS policies + server-side `.eq('user_id', verifiedUser.id)` on every query;
  `assertOwnership` rejects any browser-supplied user id.
- No full repository copy is persisted; only bounded text, a bounded diff summary and file
  hashes are stored. No auto write-back: `/api/sessions/[id]/publish` requires an explicit
  confirmation phrase and then deliberately returns `501 WRITE_BACK_NOT_IMPLEMENTED`.
