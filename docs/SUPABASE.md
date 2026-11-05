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

## Remaining manual step (connector limitation)

`external_github_enabled` is still `false` (as before). The connector's `update_auth_config`
schema exposes email/phone toggles, JWT, signup, site URL and redirect allowlist — it does
**not** expose `external_github_client_id` / `external_github_secret` /
`external_github_enabled`. Therefore GitHub sign-in must be enabled once in the Supabase
dashboard:

1. Create a GitHub OAuth App (or reuse an existing one) with callback
   `https://xmbkmdqaczlxkdarayyy.supabase.co/auth/v1/callback`.
2. Supabase Dashboard → Authentication → Providers → GitHub → enable and paste the client ID
   and secret (never into this repo).
3. Confirm the Vercel domain is in Redirect URLs (already added above).

Until that is done, `/api/me` returns `{ "user": null }` and the sign-in button cannot start an
OAuth flow. The app shows a setup message instead of pretending a user is signed in.

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
