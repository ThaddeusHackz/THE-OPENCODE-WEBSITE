# Plain-language final checklist

## What works (code + tests + real infrastructure)

- [x] The original `README.md` heading was preserved; no existing file was deleted or overwritten destructively.
- [x] PR **#1** was created before the new work: <https://github.com/ThaddeusHackz/THE-OPENCODE-WEBSITE/pull/1>.
- [x] REA setup was planned, approved, executed and verified. MCP server `rea` is registered
      (V2 shape) and a direct stdio handshake listed 229 tools (`docs/REA.md`).
- [x] Official OpenCode repository/docs were inspected read-only; license/attribution noted
      (`docs/REVERSE_ENGINEERING.md`).
- [x] Vercel + OpenCode constraints checked against official docs
      (`docs/ARCHITECTURE.md`).
- [x] Real backend routes: `/api/me`, `/api/config`, `/api/repos`, `/api/sessions`,
      `/api/sessions/[id]/messages`, `/api/agent/run`, `/api/runtime/probe`,
      `/api/sessions/[id]/publish`, `/api/runtime/poc`, `/api/auth/signin`,
      `/api/auth/signout`, `/auth/callback`, **`/api/models`**, **`/api/models/test`**.
- [x] Supabase Auth (cookie-based, server-verified), user-owned sessions/messages, RLS.
      The remote migration `opencode_website_sessions` was applied and **verified by SQL**:
      `agent_sessions` + `agent_messages`, 4 policies each (`docs/SUPABASE.md`).
- [x] Least-privilege GitHub App path **plus a server-side fine-grained PAT fallback**, with
      an installation/user allowlist and a collaborator check before any archive download.
      The token is a Vercel **sensitive** env var; no secret in the repo.
- [x] **All official free OpenCode Zen models** (including DeepSeek V4.1 Flash Free)
      compiled into a vetted 47-model snapshot; `/api/models` reads the **live** official
      catalog so retired ids disappear. At verification time the live catalog listed **10**
      zero-cost chat models. UI has a model selector and sends the chosen model.
      `docs/FREE_MODELS.md`.
- [x] Fresh `/tmp` workspace per request, safe tar extraction, bounded sizes, stripped child
      environment, strict OpenCode permissions, `finally` cleanup.
- [x] Responsive UI with sign-in, repo + model selection, conversation, saved sessions,
      loading/error/empty states, diff review, runtime probe, model test results.
- [x] No fake successful agent replies; setup errors and real runtime errors are shown.
      No silent model switching.
- [x] No automatic write-back. `/publish` requires an explicit confirmation phrase, then
      deliberately returns `501`.
- [x] `.env.example` updated with `GITHUB_TOKEN`, `OPENCODE_MODEL`, `ENABLE_MODEL_TESTS`;
      no secret values committed. Post-edit secret grep was negative.
- [x] **Real Vercel deployments.** `dpl_EkZXxPf7WvE9taASL5Z2xYiXT8Vi` proved the binary;
      `dpl_4egrjDETAEJq5Uv5cjKg6Ap4iCqX` (commit `c80b210`) deployed the full
      free-model/PAT/Supabase refresh; `dpl_C8KZNeJfUzyfMX3BS5bN85hdVk9Z` (commit
      `456615b`) added the live catalog refresh and honest quota reporting.
      `docs/VERCEL_POC.md`.
- [x] `GET /api/config` on the live site → `supabaseConfigured: true`, `githubMode: "pat"`,
      `openCodeConfigured: true`, `freeModel: true`, `missing: []`.
- [x] `GET /api/runtime/poc` → real `opencode v2.2.5` binary at
      `/var/task/node_modules/@opencode/cli-linux-x64/bin/opencode`.
- [x] **Full `opencode run` executed on Vercel with the real free DeepSeek V4.1 Flash model.**
      The CLI spawned, reached OpenCode Zen, and returned a real
      `provider.free-limit` / HTTP 429 (`retryAfterMs ≈ 80,000,000`). This is a real upstream
      answer, not a mock, and it confirms the whole runtime chain works.
- [x] `npm run check` (lint + `tsc --noEmit` + 55 tests) and `npm run build` pass after all
      edits.

## What is scaffold / not yet proven

- [ ] **A successful model-backed assistant answer has NOT been obtained.** OpenCode's free
      tier returned HTTP 429 "Free usage limit reached" with a retry of about 22 hours. This
      is an external quota, not a code defect; we did not bypass it and did not fake a reply.
- [ ] **"All free models work perfectly" is not achievable from inside this repo.** All 10
      currently-live free models were individually run through the real CLI on Vercel; every
      one returned `provider.free-limit` / HTTP 429 with a ~21.6 h retry. Retired snapshot ids
      returned `provider.no-route` ("Model unavailable"). The live catalog refresh removes
      retired ids. Full per-model table in `docs/VERCEL_POC.md`. A bug that made two newly
      added live ids demand a provider key was found and fixed; both were then verified with
      real runs (also HTTP 429).
- [ ] **Supabase GitHub sign-in is still disabled** (`external_github_enabled: false`). The
      connector cannot set an OAuth client id/secret; enable it once in the Supabase dashboard
      with a GitHub OAuth App (`docs/SUPABASE.md`). Until then `/api/me` returns `user: null`
      and the sign-in button cannot start OAuth.
- [ ] Write-back (branch/commit/PR) is intentionally not implemented.
- [ ] Full-source REA analysis of the 248 MB OpenCode monorepo was not run; binary-layout REA
      needs a pwntools Python provider that was not installed.
- [ ] `VercelSandboxAdapter` (long-running microVM) not implemented; a single Hobby function
      is capped at 300 s and `maxDuration=300` is set on `/api/agent/run`.
- [ ] Multi-minute function duration not tested end-to-end.

## Errors encountered and how they were addressed

| Error | Handling |
|---|---|
| User's GitHub fine-grained PAT was pasted in chat twice | Used it only transiently + as a Vercel sensitive env var; never written to repo/output. **Rotate/revoke it** — it is compromised |
| REA 6.8.0 rejects system Node 22.22.3 | Approved ephemeral Node 22.23.4 in `/tmp`; system Node unchanged |
| `mcp list` empty with valid config | Traced to official source/issues; verified with `debug config` + real MCP stdio handshake |
| Port 49374 already in use | `--standalone` in every runtime invocation |
| `provider.no-route` / `Model unavailable` | Real CLI error shown; live official catalog refresh added so retired ids are not offered |
| `provider.free-limit` / HTTP 429 | Real upstream error shown with retry hours; no fallback model, no fake answer |
| `provider_unavailable` for REA binary layout | Not installed silently; used `readelf`; documented |
| Vercel inline `files` deployment → `400 files[0].data should be string` | Recovered by pushing the branch and using `git_source` |
| Supabase `create_migration` returned `version: null` | Verified with SQL instead of assuming: tables + 8 policies present |
| `vercel__list_deployment_files` → `404 File tree not found` | Not retried; binary presence proven by actually spawning it |

## Limitations and next steps

1. **Rotate/revoke the PAT** that was pasted in chat, then replace it with a fresh Vercel
   sensitive env var (or move to the GitHub App path).
2. In the Supabase dashboard, enable the GitHub provider with a GitHub OAuth App client id and
   secret; confirm the redirect allowlist already contains the Vercel domain.
3. To get a real assistant answer, either wait for the free quota to reset (~22 h from
   2026-11-05), subscribe to OpenCode Go, or set one provider key + a non-free
   `OPENCODE_MODEL`. Then use the UI model selector and re-run `/api/models/test` for each
   free model; every result will be a real one.
4. For runs longer than a single function invocation, implement the `VercelSandboxAdapter`
   (same interface, no UI/DB changes).
5. Only after explicit user confirmation, implement write-back behind the existing
   confirmation gate with a fresh least-privilege token.
