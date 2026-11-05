# Architecture, Vercel constraints and the runtime adapter boundary

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
| Package / binary size | 250 MB uncompressed bundle by default; 5 GB with **Large Functions** beta (`VERCEL_SUPPORT_LARGE_FUNCTIONS=1`, Fluid compute + Active CPU) | OpenCode's Linux x64 binary alone is ~241 MB (252,713,136 bytes) — **the standard limit is almost certainly exceeded** |
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
  to `GLIBC_2.17` — modest requirements, but Vercel's Amazon Linux image compatibility has
  **not** been proven by a deployment in this session.
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

`/api/runtime/probe` is the **real minimal PoC**: it spawns the actual binary with
`--version` inside a fresh `/tmp` workspace and reports the real stdout/exit code. It is not
a mock, not an echo, and not a model call.

### Runtime adapter boundary

`src/lib/runtime/` defines one adapter, `opencode-cli`, implementing:

```ts
interface RuntimeAdapter {
  id: 'opencode-cli';
  probe(): Promise<RuntimeProbeResult>;
  run(request: AgentRunRequest): Promise<AgentRunResult>;
}
```

There is **no mock adapter, no fallback coding model, and no simulated reply**. When
`OPENCODE_MODEL`, a provider key, or the binary is missing, the API returns
`OPENCODE_NOT_CONFIGURED` / `OPENCODE_RUNTIME_NOT_FOUND` with a clear setup message and
records a `system` message. A `VercelSandboxAdapter` could implement the same interface in
the future without changing any route or UI code.

## 4. Exact blockers for the real runtime on Vercel

1. **Bundle size (primary, unverified).** The ~241 MB binary plus Next.js server layers
   almost certainly exceeds the 250 MB standard limit. The project therefore requires
   `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` (Fluid compute + Active CPU). Enabling it, and
   confirming Vercel actually traces `outputFileTracingIncludes` for a spawned (not
   imported) native binary, needs a real deployment — **no deployment was completed in this
   session**, so this remains unverified. If Large Functions are unavailable on the target
   plan/account, the Function adapter cannot ship as-is.
2. **glibc / dynamic loader compatibility (unverified).** `readelf` shows the binary's local
   requirements, but the Vercel runtime image was not tested.
3. **Model credentials.** No provider key exists by default. Without one, the real CLI
   returns `provider.no-route` (verified locally). Keys must be set as encrypted Vercel env
   vars; they are never sent to the browser.
4. **Duration.** A single HTTP request must finish within `maxDuration`. Long agent runs
   return `AGENT_TIMEOUT` (or Vercel's own 504) instead of a partial fake answer. Saved
   state is only what completed within the invocation.
5. **Fixed-port service.** Default OpenCode commands hit the `49374` shared-service bug;
   `--standalone` is mandatory and is set by the adapter.
6. **Snap / privileged install.** Not possible in Vercel Functions; see `docs/SETUP.md`.

Because these blockers are deployment-time facts rather than code facts, the code is
**foundation plus a real adapter**, not a claim that OpenCode ran on Vercel. The final
checklist states this explicitly.

## 5. Smallest change that makes the real runtime run on Vercel

**Option A — this Function (smallest code change, environment change only):**

1. Enable Large Functions: add `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` with Fluid compute +
   Active CPU; redeploy.
2. Confirm `node_modules/@opencode/cli-linux-x64/bin/opencode` is present in the deployed
   function bundle (the probe route reports `OPENCODE_RUNTIME_NOT_FOUND` otherwise).
3. Set `OPENCODE_MODEL` and one provider key as encrypted env vars.
4. Call `POST /api/runtime/probe`. A result of `available: true` with
   `versionOutput: "opencode v2.2.5"` proves the binary runs; then send a conversation
   request. No source change is needed.

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
