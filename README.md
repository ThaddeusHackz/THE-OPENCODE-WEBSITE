# THE-OPENCODE-WEBSITE

> **This project is not built by the OpenCode team and is not affiliated with them in any way.**
> OpenCode is MIT-licensed (© 2025 opencode); see <https://github.com/anomalyco/opencode>.
> The original one-line README heading above is preserved.

A **Vercel-first, best-effort prototype** for driving the *actual* OpenCode coding agent
from a website. Vercel is not persistent: every agent request creates a fresh temporary
workspace in `/tmp`, fetches the selected repository, runs the real OpenCode CLI on the
server, saves the response plus a bounded diff summary to Supabase, and deletes the
workspace. It is **not** a persistent cloud development environment.

## What is here

| Area | Status |
|---|---|
| Supabase Auth with GitHub sign-in (cookie-based, server-verified) | Implemented |
| Least-privilege GitHub App repo listing / authorization / archive download | Implemented |
| Per-request ephemeral `/tmp` workspace, path-traversal & size guards | Implemented |
| User-owned sessions/messages in Supabase Postgres with RLS | Implemented (migration provided) |
| Responsive UI: sign-in, repo selection, conversation, saved sessions, loading/error/empty states | Implemented |
| Real OpenCode CLI runtime adapter (`opencode run --standalone`) | Implemented; **the actual binary was verified in a deployed Vercel Function** (`--version` PoC). A full model-backed run still needs provider credentials |
| REA (Reverse Engineer Anything) MCP server `rea` | Installed & verified locally — see `docs/REA.md` |
| Writing changes back to GitHub | **Deliberately disabled**; explicit-confirmation gate only |
| Mock / simulated agent replies | **None**, by design |

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in values in Vercel/Supabase, never commit secrets
npm run dev                  # http://localhost:3000
npm run check                # lint + typecheck + tests
```

Then apply `supabase/migrations/20261105000000_init.sql` in the Supabase SQL editor
(or `supabase db push`). Full instructions: **[docs/SETUP.md](docs/SETUP.md)**.

## Documentation

- [docs/SETUP.md](docs/SETUP.md) — GitHub App, Supabase, env vars, Vercel deployment.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — runtime adapter boundary, verified Vercel
  constraints, resolved vs remaining blockers, and the smallest change needed.
- [docs/VERCEL_POC.md](docs/VERCEL_POC.md) — **real deployment proof**: the actual OpenCode
  v2.2.5 binary ran in a Vercel Node.js Function at
  <https://the-opencode-website-poc.vercel.app/api/runtime/poc>.
- [docs/REA.md](docs/REA.md) — approved REA setup plan, commands run, verification results, errors.
- [docs/REVERSE_ENGINEERING.md](docs/REVERSE_ENGINEERING.md) — findings from the official OpenCode
  repository/docs plus the REA static-analysis run.
- [docs/CHECKLIST.md](docs/CHECKLIST.md) — plain-language final checklist.

## Security model (short version)

- GitHub App has only `Contents: read` and `Metadata: read`; its private key and all
  model-provider keys live only in server-side environment variables.
- The OpenCode child process receives a **stripped environment**: `PATH`, `HOME`/`XDG_*`
  pointing at the temp workspace, and allowlisted model keys. No GitHub, Supabase or
  Vercel credentials.
- Repo contents/agent output are untrusted: validated `owner/repo`, ref and archive paths,
  no symlinks, bounded archive/file/output sizes, strict OpenCode permissions in the workspace.
- Ownership is enforced twice: RLS (`auth.uid() = user_id`) and server-side
  `.eq('user_id', verifiedUser.id)`. A user id from the browser is rejected.
- No full repository copies and no secret values are stored in the database.
