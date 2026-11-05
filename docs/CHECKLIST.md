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
      `/api/sessions/[id]/publish`, `/api/auth/signin`, `/api/auth/signout`, `/auth/callback`.
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
- [x] Tests for validation, auth, ownership/request validation and the runtime boundary;
      lint, typecheck and tests run via `npm run check`.

## What is scaffold / not proven

- [ ] **The actual OpenCode agent has NOT been run on Vercel.** No Vercel deployment,
      credential validation, or Function/Sandbox PoC was completed in this sandbox. The
      `/api/runtime/probe` route is implemented but its result on Vercel is unverified.
- [ ] Supabase project, GitHub App, OAuth app, encrypted env vars and the migration have
      **not** been provisioned by me — they need your account (setup steps in `docs/SETUP.md`).
- [ ] The 241 MB binary fits within Vercel's **Large Functions** beta only; this is an
      environment prerequisite, not a proven deployment.
- [ ] A real model-backed agent response was not obtained locally: without provider keys the
      CLI returned `provider.no-route` / `Model unavailable` (documented, not hidden).
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
| Snap requires root/snapd | Explained it is Debian-machine-only; not run, not claimed installed |

## Limitations and next steps

1. Provision Supabase + GitHub App + encrypted env vars per `docs/SETUP.md`.
2. Deploy to Vercel with `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`; click **Check real OpenCode
   runtime**. If it returns `available: false`, read the exact error and either fix the
   binary bundling/glibc issue or move to the Vercel Sandbox adapter.
3. If a model provider key is configured, send a small request and confirm a real assistant
   message (not a system error) is saved.
4. For runs longer than a single function invocation, implement the `VercelSandboxAdapter`
   (same interface, no UI/DB changes).
5. Only after explicit user confirmation, implement write-back behind the existing
   confirmation gate with a fresh least-privilege token.
