# Setup instructions
> **Historical note (read first).** The sections below describe the original
> **OpenCode Zen** proof of concept (`opencode/*` free models) and its live
> verification. That path was **rejected**: every Zen free model returned
> `provider.free-limit` HTTP 429. The **current build uses normal free models
> from ordinary providers** (`models.dev`), keyless on Vercel via the automatic
> `VERCEL_OIDC_TOKEN`. See [FREE_MODELS.md](FREE_MODELS.md) and
> [the fifth deployment in VERCEL_POC.md](VERCEL_POC.md). The binary, function,
> Supabase/RLS, and GitHub findings below remain valid infrastructure facts.

All secrets are set **only** in server-side environment variables (Vercel Project Settings →
Environment Variables, or `.env.local` locally). `.env.example` lists names and descriptions
only. Never paste a token into source code, never commit `.env*`, never put a GitHub token or
a model key in `NEXT_PUBLIC_*`, localStorage, or logs.

## 1. Supabase

1. Create a Supabase project. Copy its **Project URL** and **anon/publishable key**
   (never the `service_role` key) into `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The anon key is public but every table is protected by RLS.
2. **Authentication → Providers → GitHub**: enable it and configure a GitHub OAuth App with
   scopes `read:user user:email` (identity only — no repo scopes are needed because repository
   access uses the GitHub App below).
   - OAuth callback: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - Website redirect after login: `https://<your-vercel-domain>/auth/callback`
   - Add both `http://localhost:3000/auth/callback` and the production URL to
     **Authentication → URL Configuration → Redirect URLs**.
   - You do **not** need to persist GitHub `provider_token`s; this app never reads them.
3. **SQL Editor**: run `supabase/migrations/20261105000000_init.sql` (or `supabase db push`).
   It creates `agent_sessions` / `agent_messages`, enables RLS, and adds policies scoped to
   `auth.uid() = user_id`. The server also enforces ownership independently. On the PoC project
   this migration was already applied through the Supabase connector and verified by SQL
   (`docs/SUPABASE.md`).

   > **Connector limitation:** the Supabase connector cannot enable the GitHub provider or set
   > an OAuth client id/secret. Do step 2 manually in the dashboard; it is the only remaining
   > auth prerequisite.

## 2. GitHub App (least privilege)

Using a GitHub App is preferred over a broad OAuth `repo` scope.

1. Create a GitHub App with **Repository permissions**:
   - `Contents: read` (download repository archives)
   - `Metadata: read` (list repositories and check collaborator access)
   - No write permissions, no webhook, no user-to-server token needed.
2. Install it on the account/organisation and choose only the repositories users may select.
3. Generate a **private key** (PEM). Put it in `GITHUB_APP_PRIVATE_KEY`; when stored as a
   single line, replace real newlines with `\n`.
4. Set `GITHUB_APP_ID` (numeric App ID) and `GITHUB_APP_INSTALLATION_ID` (numeric installation ID).

At runtime the server signs a short-lived RS256 App JWT, exchanges it for an installation
token, lists `/installation/repositories`, and verifies the signed-in GitHub login is a
collaborator (`GET /repos/{owner}/{repo}/collaborators/{login}` → 204) before any download.
Inventory of repos is capped at 30 collaborator checks per request.

> Alternative: a GitHub OAuth app with `repo` scope would also work but grants write access to
> private repos; that is why this prototype uses the App.
>
> **PAT fallback (used on the PoC):** set `GITHUB_TOKEN` to a fine-grained PAT as a Vercel
> *sensitive* environment variable. `resolveGitHubContext()` then calls `GET /user` for the
> owner login and `GET /user/repos` for the allowlist, and
> `assertRepoAuthorized()` additionally verifies the signed-in Supabase user's GitHub login is
> a collaborator before any archive download. The App takes precedence when both are set.
> Never expose this token to the browser, logs, localStorage or commits; rotate it if it was
> ever pasted into chat.

## 3. OpenCode runtime (server-side only)

Official installation methods (from `anomalyco/opencode` README):
`npm i -g @opencode/cli@latest`, Homebrew, the curl installer, `mise`, `nix`, desktop app.
The npm package `@opencode/cli@2.2.5` is a tiny launcher whose `postinstall` selects a
platform package such as `@opencode/cli-linux-x64@2.2.5` (**~241 MB unpacked**).

For this website:

- `package.json` pins `@opencode/cli-linux-x64@2.2.5` as an **optionalDependency** so only one
  platform binary is installed on Vercel's Linux x64 builders. `next.config.ts` includes it in
  `outputFileTracingIncludes` for the two server functions.
- Optionally set `OPENCODE_BINARY_PATH` to an absolute path of an already-provisioned binary.
- `OPENCODE_MODEL` defaults to the normal free model `vercel/reflection/beam-free`, which
  needs **no new API key** on Vercel: OpenCode's `vercel-ai-gateway` provider uses the
  automatically injected `VERCEL_OIDC_TOKEN` (aliased to `AI_GATEWAY_API_KEY` in the child).
  Locally, set `AI_GATEWAY_API_KEY` yourself; `/api/config` reports the missing token.
- `GET /api/models` returns **214 normal free models from 45 ordinary providers**, validated
  against the pinned CLI v2.2.5. Each model lists its required credential env var NAME. Zen
  (`opencode/*`) is excluded and `OPENCODE_DISABLE_FREE_MODELS=1` disables it in the CLI.
- For any normal free model other than `vercel/*`, set that provider's free key (e.g.
  `OPENROUTER_API_KEY`, `AMD_API_KEY`, `NVIDIA_API_KEY`, `GROQ_API_KEY`, `HF_TOKEN`) as a
  sensitive Vercel env var. Keys are passed to the child process only, never to the browser,
  and are redacted from captured output. `/api/config` names exactly what is missing.
- `OPENCODE_MODEL` pointing at an old Zen id is ignored (falls back to the default) rather
  than silently running Zen.
- Set `ENABLE_MODEL_TESTS=1` to enable `GET/POST /api/models/test?model=<provider>/<id>`, which
  spawns the real CLI with a tiny prompt and returns the real answer or real upstream error.
  Disable it when not needed so free quota is not consumed by anonymous traffic.
- **Free-tier caveat:** free models are promotional and rate-limited by their own providers.
  Zen's `provider.free-limit` 429 is historical; see `docs/FREE_MODELS.md`.
- Set `OPENCODE_TIMEOUT_MS` below your function's `maxDuration`. Defaults: 240 000 ms,
  `maxDuration = 300` (Hobby). Pro/Enterprise can raise `maxDuration` to 800.
- `OPENCODE_MAX_REPO_BYTES` (default 50 MB) and `OPENCODE_MAX_OUTPUT_BYTES` (default 200 KB)
  bound untrusted input and output.

### Snapcraft note

The Debian instructions at <https://snapcraft.io/install/opencode/debian> are:

```bash
sudo apt update && sudo apt install snapd
sudo snap install snapd
sudo snap install opencode --classic
```

Those steps apply to a **Debian machine with root and snapd**. Vercel Functions have a
read-only root filesystem, no `sudo`, and no snapd; a snap does not install files into this
repository and cannot be used in a Vercel Function. I did **not** run these privileged
commands and do **not** claim the snap was installed. The npm platform binary is the only
path used here.

## 4. Vercel deployment

1. Import this Git repository into Vercel (framework: Next.js). `engines.node` is `22.x`;
   Vercel supports 22.x / 24.x / 26.x.
2. Set all environment variables from `.env.example` in Project Settings. Mark the private
   key and model keys as **Sensitive/Encrypted**. Do not set any of them as `NEXT_PUBLIC_*`.
3. Because the OpenCode binary is ~241 MB, the standard 250 MB uncompressed function bundle
   limit is exceeded. Enable **Large Functions** (Fluid compute + Active CPU): set
   `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` and redeploy. New projects are eligible by default;
   existing projects must opt in. This was **verified working** on a real Hobby deployment —
   see `docs/VERCEL_POC.md`.
4. Set the project's function max duration consistent with `OPENCODE_TIMEOUT_MS`
   (`app/api/agent/run/route.ts` exports `maxDuration = 300`; raise to 800 on Pro).
5. Deploy. A real deployment of this branch already exists: see `docs/VERCEL_POC.md`.
   `GET /api/runtime/poc` is a public, read-only `--version` probe that proves the binary runs;
   `GET /api/config` lists exactly which variables are still missing. The **Check real OpenCode
   runtime** button in the footer uses the authenticated `/api/runtime/probe` route and needs a
   Supabase session. If anything is missing, the UI shows a setup message rather than a
   fabricated reply.
6. Add the Vercel domain to Supabase Redirect URLs.

### Local development

```bash
npm install           # on linux-x64 this also fetches the pinned optional binary
cp .env.example .env.local
npm run dev           # bound to 0.0.0.0 for previews
npm run check         # lint + typecheck + tests
```

If you do not want the 241 MB package locally, install with `npm install --omit=optional`
and point `OPENCODE_BINARY_PATH` at a separately installed OpenCode CLI (e.g. from
`npm i -g @opencode/cli@latest` on your own machine — that is a machine install, not Vercel).

## 5. Tests

`npm test` runs Vitest suites for input validation (path traversal, ref/option injection),
authentication (401 on missing session, GitHub identity extraction), ownership (every DB query
scoped to the verified user id, rejection of browser-supplied ids), and the runtime boundary
(stripped child env, secret redaction, JSON event parsing, binary resolution, bounded diffs).
`npm run lint` and `npm run typecheck` run ESLint and `tsc --noEmit`.
