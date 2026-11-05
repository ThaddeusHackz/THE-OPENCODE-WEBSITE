# THE-OPENCODE-WEBSITE

> **This project is not built by the OpenCode team and is not affiliated with them in any way.**
> OpenCode is MIT-licensed (© 2025 opencode); see <https://github.com/anomalyco/opencode>.
> The original one-line README heading above is preserved.

A **Vercel-first, best-effort prototype** for driving the *actual* OpenCode coding agent
from a website. Vercel is not persistent: every agent request creates a fresh temporary
workspace in `/tmp`, fetches the selected repository, runs the real OpenCode CLI on the
server, saves the response plus a bounded diff summary to Supabase, and deletes the
workspace. It is **not** a persistent cloud development environment.

**Live deployment:** <https://the-opencode-website-poc.vercel.app> · **PR:** #1

## What is here

| Area | Status |
|---|---|
| Supabase Auth (GitHub provider), cookie-based server-verified sessions | Code implemented; **GitHub OAuth client id/secret still must be enabled in the Supabase dashboard** |
| Supabase `agent_sessions` / `agent_messages` with RLS | Migration applied remotely and verified (4 policies per table) — `docs/SUPABASE.md` |
| Least-privilege GitHub App repo access, **plus a server-side PAT fallback** | Implemented; App preferred. The supplied PAT is stored as a Vercel sensitive env var |
| Per-request ephemeral `/tmp` workspace, path-traversal & size guards | Implemented |
| Official free OpenCode Zen models (incl. DeepSeek V4.1 Flash Free): 47 in the vetted snapshot, **10 currently live**; live catalog refresh, model selector, real per-model verification route | Implemented — `docs/FREE_MODELS.md` |
| Responsive UI: sign-in, repo/model selection, conversation, saved sessions, loading/error/empty states | Implemented |
| Real OpenCode CLI runtime adapter (`opencode run --standalone`) | Implemented. **The real binary ran a full model-backed `opencode run` on Vercel** — upstream returned a real `provider.free-limit` (HTTP 429) |
| REA MCP server `rea` | Installed & verified locally — `docs/REA.md` |
| Writing changes back to GitHub | **Deliberately disabled**; explicit-confirmation gate only |
| Mock / simulated agent replies | **None**, by design |

## Verified on real infrastructure

- `GET /api/runtime/poc` → the actual `opencode v2.2.5` binary at
  `/var/task/node_modules/@opencode/cli-linux-x64/bin/opencode`.
- `GET /api/config` → `supabaseConfigured: true`, `githubMode: "pat"`,
  `openCodeConfigured: true`, `freeModel: true`, `missing: []`.
- `GET /api/models` → the **live** official zero-cost catalog: 10 free chat models at the time of
  verification (`source: "live"`); 47 are retained in the vetted snapshot fallback.
- `GET /api/models/test?model=opencode/deepseek-v4.1-flash-free` → the real CLI spawned, the
  real Zen endpoint was called, and the real upstream answer was
  `provider.free-limit` / HTTP 429 `Free usage limit reached` with `retryAfterMs ≈ 80,000,000`.
  **No reply was fabricated and no model was silently swapped.** See `docs/VERCEL_POC.md`.

The remaining blocker is **external**: OpenCode's free tier quota is exhausted for this
deployment, and some bundled free ids are retired (`provider.no-route`). Free models cannot be
made to "work perfectly" from inside this repo. Once the quota resets, or with an OpenCode Go
subscription / a provider key, the same path returns a real assistant answer. Exact steps are in
`docs/CHECKLIST.md`.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in values in Vercel/Supabase, never commit secrets
npm run dev                  # http://localhost:3000
npm run check                # lint + typecheck + tests
```

Full instructions: **[docs/SETUP.md](docs/SETUP.md)**. The remote migration is already applied;
local SQL is in `supabase/migrations/20261105000000_init.sql`.

## Documentation

- [docs/CHECKLIST.md](docs/CHECKLIST.md) — plain-language final checklist.
- [docs/VERCEL_POC.md](docs/VERCEL_POC.md) — real deployment proof and honest blocker list.
- [docs/FREE_MODELS.md](docs/FREE_MODELS.md) — official free models, how they are wired, real
  per-model verification results and quota caveats.
- [docs/SUPABASE.md](docs/SUPABASE.md) — remote project changes, verified migration, OAuth gap.
- [docs/SETUP.md](docs/SETUP.md) — GitHub App/PAT, Supabase, env vars, Vercel deployment.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — runtime adapter boundary, verified Vercel
  constraints, resolved vs remaining blockers.
- [docs/REA.md](docs/REA.md) — approved REA setup plan, commands run, verification results.
- [docs/REVERSE_ENGINEERING.md](docs/REVERSE_ENGINEERING.md) — official-source findings.

## Security model (short version)

- GitHub App has only `Contents: read` and `Metadata: read`; its private key and all
  model-provider keys live only in server-side environment variables. A fine-grained PAT is a
  server-side fallback, never exposed to the browser, logs, localStorage or commits.
- The OpenCode child process receives a **stripped environment**: `PATH`, `HOME`/`XDG_*`
  pointing at the temp workspace, and allowlisted model keys. No GitHub, Supabase or
  Vercel credentials.
- Repo contents/agent output are untrusted: validated `owner/repo`, ref and archive paths,
  no symlinks, bounded archive/file/output sizes, strict OpenCode permissions in the workspace.
- Only official free `opencode/*` ids (or the configured model) can be selected; arbitrary
  model strings are rejected. There is no silent model fallback.
- Ownership is enforced twice: RLS (`auth.uid() = user_id`) and server-side
  `.eq('user_id', verifiedUser.id)`. A user id from the browser is rejected.
- No full repository copies and no secret values are stored in the database.
