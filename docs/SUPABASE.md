# Supabase work performed

## Project used

Existing project `anticodex`, ref `xmbkmdqaczlxkdarayyy`, region `us-east-1`, status
`ACTIVE_HEALTHY`, Postgres 17. It is shared with another app
(`https://anticodex.vercel.app`), so **only additive changes were made** — nothing was deleted,
no existing table/policy/domain was modified, and `site_url` was left untouched.

## Changes applied through the Supabase connector

1. **Migration `opencode_website_sessions`** (via `create_migration`). Verified afterwards with
   SQL: `public.agent_sessions` and `public.agent_messages` exist with **4 RLS policies each**
   (select/insert/update/delete, all `auth.uid() = user_id`; message inserts also require the
   session to belong to the same user). Trigger `agent_messages_touch_session` keeps
   `updated_at` fresh. No full repository copies or secret values are stored.
2. **Auth redirect allowlist (additive).** `uri_allow_list` was extended with
   `https://the-opencode-website-poc.vercel.app/*`,
   `https://the-opencode-website-poc.vercel.app/auth/callback`, and
   `http://localhost:3000/*`. All pre-existing entries for `anticodex.vercel.app` and
   `localhost:8787` were preserved. `site_url` was **not** changed.
3. **Vercel project env vars** (server-side / public-as-appropriate):
   - `NEXT_PUBLIC_SUPABASE_URL = https://xmbkmdqaczlxkdarayyy.supabase.co` (plain)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the project's **publishable** key (plain, RLS-scoped)
   - `GITHUB_TOKEN` = **sensitive** (encrypted, never in the repo, browser, logs or localStorage)
   - `OPENCODE_MODEL = opencode/deepseek-v4.1-flash-free` (plain)
   - `ENABLE_MODEL_TESTS = 1` (plain)
   - `VERCEL_SUPPORT_LARGE_FUNCTIONS = 1` (plain, from the earlier PoC)

   The `service_role` / secret key was **not** used or exposed.

## Verified

- `validate_credential` → success; `list_projects` → one healthy project.
- `execute_query` confirmed the two tables and 8 policies.
- `get_auth_config` confirms the new redirect entries are present.

## Root cause of the broken GitHub sign-in (reproduced 2026-11-05)

`POST /api/auth/signin` is correct: it builds a Supabase OAuth URL and returns a 307 to
`https://xmbkmdqaczlxkdarayyy.supabase.co/auth/v1/authorize?provider=github&redirect_to=https://the-opencode-website-poc.vercel.app/auth/callback`
with valid PKCE challenge / `code_verifier` cookies. The failure is one hop later, in the
Supabase project itself:

```
GET /auth/v1/authorize?provider=github&redirect_to=...  -> HTTP 400
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

Controls reproduce the same 400 for `provider=google` and `provider=discord`, and a
`Provider azuread could not be found` 400 for `provider=azuread`.
`GET /auth/v1/settings` without an `apikey` returns `No API key found in request`.
`get_auth_config` on project `xmbkmdqaczlxkdarayyy` shows **every**
`external_*_enabled: false` and `external_github_client_id: null`,
`external_github_secret: null`. There is no third-party OAuth provider enabled at all.

**Conclusion: dashboard configuration gap, not an application bug.** RLS and the existing
server auth wiring are unchanged (reproduction did not implicate them).

The app no longer ships a dead-end button: `/api/config` performs a real server-side check
(`src/lib/supabase/oauth.ts`) — `GET /auth/v1/settings` with `SUPABASE_SERVICE_ROLE_KEY` if
configured, otherwise the publishable anon key; if that is unreadable it probes the
`/auth/v1/authorize?provider=github` endpoint. It returns `githubOauthEnabled`,
`githubOauthReason`, `githubOauthFix` and `oauthStatusSource` (`settings` /
`authorize-probe` / `unavailable`). When the provider is disabled the UI shows the exact
reason and fix and disables the sign-in button. No key value is ever returned or logged.
Results are cached 60 s so config checks do not hammer Supabase.

## EXACT enablement steps — dashboard-only, I cannot perform these myself

1. **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
   (or `https://github.com/settings/developers` → **New OAuth App**).
   - Application name: anything (e.g. `OpenCode Web PoC`).
   - Homepage URL: `https://the-opencode-website-poc.vercel.app`.
   - **Authorization callback URL** (exact):
     `https://xmbkmdqaczlxkdarayyy.supabase.co/auth/v1/callback`
   - Click **Register application**, then **Generate a new client secret**. Copy the
     **Client ID** and the **Client Secret**. Never paste either into this repo, chat, or a
     `NEXT_PUBLIC_*` variable.
2. **Supabase Dashboard → select project `anticodex` (`xmbkmdqaczlxkdarayyy`) →
   Authentication → Providers (Third-party) → GitHub.**
   - Turn the GitHub provider **Enabled**.
   - Paste the **Client ID** and **Client Secret** from step 1.
   - Click **Save**.
3. **Supabase Dashboard → Authentication → URL Configuration.**
   - **Site URL:** confirm it is appropriate for this app. It is currently
     `https://anticodex.vercel.app` (this Supabase project is shared with another app; we
     deliberately left it unchanged — decide in the dashboard, don't let this PoC rewrite it).
   - **Redirect URLs:** confirm
     `https://the-opencode-website-poc.vercel.app/auth/callback` is present. It **is** already
     in `uri_allow_list` (added additively earlier), together with
     `https://the-opencode-website-poc.vercel.app/*` and `http://localhost:3000/*`.
   - Click **Save** if you changed anything.
4. **Verify:** reload the live app; `/api/config` should report
   `githubOauthEnabled: true` and `oauthStatusSource: "settings"`, the sign-in button
   re-enables, and `/api/me` should return a user after signing in.

All four steps are **dashboard-only actions** that I cannot perform myself: the Supabase
connector's `update_auth_config` exposes email/phone toggles, JWT, signup, site URL and the
redirect allowlist, but **not** `external_github_client_id`, `external_github_secret` or
`external_github_enabled`, and GitHub OAuth App creation requires your GitHub account.
Until step 2 is done, `/api/me` returns `{ "user": null }` and sign-in cannot start.

## Security model unchanged

- RLS + server-side `.eq('user_id', verifiedUser.id)` on every query.
- A user id from the browser is rejected by `assertOwnership`.
- GitHub token is server-side only, never sent to the browser or the OpenCode child process.

## Post-verification note

`supabase__create_migration` initially returned `{"version":null,"name":"opencode_website_sessions"}`.
Rather than assuming it applied, the tables were checked with SQL and confirmed present with
4 policies each. The connector also cannot set `external_github_client_id` /
`external_github_secret` / `external_github_enabled`, so GitHub sign-in stays a manual
dashboard step. The PAT used for repository access lives only as a Vercel sensitive env var;
rotate/revoke it because it was pasted into chat.

## Final verification (2026-11-05)

`execute_query`:

```sql
select relname, relrowsecurity from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('agent_sessions','agent_messages');
```

→ `agent_messages: true`, `agent_sessions: true`. RLS is enabled on both tables.

`get_auth_config` re-checked: redirect allowlist holds all original entries plus the three new
ones; `external_github_enabled: false`, `external_github_client_id: null`,
`external_github_secret: null`, `site_url: https://anticodex.vercel.app` (unchanged).
No connector tool exposes the GitHub OAuth provider fields, so this remains a manual
dashboard step.
