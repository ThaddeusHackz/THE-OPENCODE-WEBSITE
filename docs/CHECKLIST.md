# Plain-language final checklist

## What works (code + tests in this repository)

- [x] The original `README.md` heading was preserved; no existing file was deleted or overwritten destructively.
- [x] REA setup was planned, approved, executed and verified. MCP server `rea` is registered
      (V2 shape) and a direct stdio handshake listed 229 tools. Node version mismatches,
      the `mcp list` false negative, the port 49374 conflict and the pwntools provider error
      are all documented in `docs/REA.md`.
- [x] Official OpenCode repository/docs were inspected read-only; license/attribution noted;
      no core source copied or modified (`docs/REVERSE_ENGINEERING.md`).
- [x] Vercel + OpenCode constraints were checked against current official docs
      (`docs/ARCHITECTURE.md`).
- [x] Real backend routes: `/api/me`, `/api/config`, `/api/repos`, `/api/sessions`,
      `/api/sessions/[id]/messages`, `/api/agent/run`, `/api/runtime/probe`,
      `/api/sessions/[id]/publish`, `/api/runtime/poc`, `/api/auth/signin`,
      `/api/auth/signout`, `/auth/callback`.
- [x] Supabase GitHub sign-in, cookie-based server-verified sessions, user-owned
      sessions/messages, migration with RLS policies, and server-side ownership checks.
- [x] Least-privilege GitHub App (Contents: read, Metadata: read) for repo listing,
      collaborator verification and archive download. No token pasted into source.
- [x] Fresh `/tmp` workspace per request, safe tar extraction, bounded sizes, stripped child
      environment, strict OpenCode permissions, `finally` cleanup.
- [x] Responsive UI with sign-in, repo selection, conversation, saved sessions,
      loading/error/empty states, ephemeral-workspace notice, diff review, runtime probe.
- [x] No fake successful agent replies; setup errors and real runtime errors are shown.
- [x] No automatic write-back. A diff is shown and `/publish` requires an explicit
      confirmation phrase, then deliberately returns `501` (no branch/commit/PR created).
- [x] `.env.example` with variable names/descriptions only; no secret values committed.
- [x] **Real Vercel deployment + minimal runtime PoC.** Next.js 16.4.5 / Node 22.x / Hobby
      / Fluid+Active CPU / `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`. The actual OpenCode v2.2.5
      binary was spawned inside a deployed Function and returned `opencode v2.2.5` from
      `/api/runtime/poc`. Build logs, created resources and exact JSON are in
      `docs/VERCEL_POC.md`.
- [x] Tests for validation, auth, ownership/request validation and the runtime boundary;
      lint, typecheck and tests run via `npm run check`.

## What is scaffold / not proven

- [ ] A **full model-backed `opencode run` has NOT been completed on Vercel**: no
      `OPENCODE_MODEL` or provider key is configured on the deployment, so `/api/agent/run`
      returns `OPENCODE_NOT_CONFIGURED` rather than a fake reply. Locally a real `run`
      emitted NDJSON `step_start` events then hit the hard `AGENT_TIMEOUT`.
- [ ] Supabase project, GitHub App, OAuth app, encrypted model/provider env vars and the
      migration have **not** been provisioned by me — they need your account
      (setup steps in `docs/SETUP.md`).
- [ ] A real model-backed agent response was not obtained locally: without provider keys the
      CLI returned `provider.no-route` / `Model unavailable`; with a dummy key it emitted real
      NDJSON events then timed out (documented, not hidden).
- [ ] Write-back (branch/commit/PR) is intentionally not implemented.
- [ ] Full-source REA analysis of the 248 MB OpenCode monorepo was not run; only the
      published CLI wrapper was statically analysed. Binary-layout REA needs a pwntools
      Python provider that was not installed.

## Errors encountered and how they were addressed

| Error | Handling |
|---|---|
| REA 6.8.0 rejects system Node 22.22.3 | Approved ephemeral Node 22.23.4 in `/tmp`; system Node unchanged |
| `mcp list` empty with valid config | Traced to official source/issues; verified with `debug config` + real MCP stdio handshake instead |
| Port 49374 already in use | `--standalone` in every runtime invocation |
| `provider.no-route` on `opencode run` | Honest setup error; no mock/fallback model |
| `provider_unavailable` for REA binary layout | Not installed silently; used `readelf`; documented |
| `file` command missing | Used `readelf -l/-d/-V` and `ldd` |
| Vercel `create_deployment` with inline `files` → `400 files[0].data should be string` | Connector validation limitation; recovered by pushing the branch and using `git_source` |
| Vercel `list_deployment_files` → `404 File tree not found` | Not retried; binary presence proven by actually spawning it |
| Snap requires root/snapd | Explained it is Debian-machine-only; not run, not claimed installed |

## Limitations and next steps

1. Provision Supabase + GitHub App + encrypted env vars per `docs/SETUP.md`.
2. Set `OPENCODE_MODEL` and one provider key on the Vercel project (binary bundling is already
   proven). Confirm `/api/runtime/poc` still returns `available: true`.
3. Send a small request and confirm a real assistant message (not a system error) is saved.
4. For runs longer than a single function invocation, implement the `VercelSandboxAdapter`
   (same interface, no UI/DB changes).
5. Only after explicit user confirmation, implement write-back behind the existing
   confirmation gate with a fresh least-privilege token.
