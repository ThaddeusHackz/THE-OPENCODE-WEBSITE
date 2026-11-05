# Real Vercel Function proof of concept — result

**Result: the actual OpenCode v2.2.5 binary DID run inside a deployed Vercel Node.js Function.**

## What was created (external Vercel resources)

| Resource | Value |
|---|---|
| New Vercel project | `the-opencode-website-poc` (`prj_Yg3db0S7VyiNTHA4BhpHe5IsSDlY`) in team `thaddeus' projects` |
| Project env var | `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` (plain, all targets) |
| Framework / runtime | Next.js 16.4.5, Node.js **22.x**, Fluid compute + Active CPU, `functionTimeout: 300`, region `iad1`, Hobby plan |
| Deployment | `dpl_EkZXxPf7WvE9taASL5Z2xYiXT8Vi`, production, from branch `arena/3a7379f3-the-opencode-website` at `becdc61` |
| Public URL | <https://the-opencode-website-poc.vercel.app> |

This created a new project and one production deployment on the connected Vercel account.
It did not modify or delete any existing project, domain, env var or deployment.

## Sequence

1. `validate_credential` → `success: true`; `get_authenticated_user` confirmed the Hobby account.
2. `list_projects` showed no project for this repository, so a new project was created explicitly
   (no project was auto-created by the deployment call).
3. `create_env_var` set `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`; `update_project` set `framework: nextjs`.
4. A first attempt to deploy a tiny standalone PoC via `create_deployment` with inline `files`
   failed: `400 Bad Request … files[0].data should be string`. That is a connector validation
   limitation, not an application error. Recovered by committing/pushing the branch and using
   `git_source: {type:"github", repoId:1446385292, ref:"arena/3a7379f3-the-opencode-website"}`.
5. Build logs (`get_deployment_events`): cloned the branch, `npm install` added 198 packages,
   detected Next.js 16.4.5, `vercel build` completed in 32 s, generated 8 Node.js functions,
   `Deploying outputs...`. `get_deployment` → `READY` / `PROMOTED` in ~77 s.
6. `list_deployment_files` returned `404 File tree not found` for this deployment type; the
   binary's presence was proven directly by running it (below), not by listing the tree.

## The proof

`GET https://the-opencode-website-poc.vercel.app/api/runtime/poc` (public, read-only: only
spawns `opencode --version` inside a fresh `/tmp` workspace):

```json
{
  "available": true,
  "runtimeId": "opencode-cli",
  "binaryPath": "/var/task/node_modules/@opencode/cli-linux-x64/bin/opencode",
  "versionOutput": "opencode v2.2.5",
  "error": null,
  "ephemeralWorkspace": true
}
```

`GET /api/config` on the same deployment:

```json
{
  "supabaseConfigured": false,
  "githubAppConfigured": false,
  "openCodeConfigured": false,
  "binaryPathProvided": false,
  "missing": [
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY / GITHUB_APP_INSTALLATION_ID",
    "OPENCODE_MODEL",
    "one model-provider key (see .env.example)"
  ],
  "setupMessage": "Setup incomplete. Configure: … The agent will not run and no reply will be fabricated."
}
```

`GET /` renders the responsive sign-in screen with the "not affiliated with the OpenCode team"
notice. No fake agent reply is produced.

## What this proves, and what it does not

**Proven on real Vercel infrastructure**

- Node.js Functions can spawn a native child process (`child_process.spawn`).
- The 241 MB `@opencode/cli-linux-x64@2.2.5` binary is bundled successfully when
  `next.config.ts` `outputFileTracingIncludes` names it and Large Functions are enabled.
- The binary is dynamically linked but runs on Vercel's runtime image (glibc/loader compatible).
- `/tmp` is writable: `withTempWorkspace` created a fresh `mkdtemp` workspace and removed it.
- OpenCode's `--standalone`/version path works without the shared port 49374 service.
- The website, API routes and setup-status UI build and deploy on Vercel.

**NOT proven / still blocked**

- A **full model-backed `opencode run`** on Vercel. The deployed project has no `OPENCODE_MODEL`
  and no provider key, so `configStatus()` correctly returns `openCodeConfigured: false` and
  `/api/agent/run` would return `OPENCODE_NOT_CONFIGURED` rather than a fabricated reply.
  Locally, a real `run` with a dummy key produced genuine NDJSON `step_start` events and hit the
  hard `AGENT_TIMEOUT` (no provider network access in this sandbox).
- Supabase Auth/Postgres, GitHub App, encrypted secrets and RLS are configured by you, not by me.
- Function duration for a multi-minute agent run (300 s Hobby default) is untested; the adapter
  returns a clear `AGENT_TIMEOUT` error if it cannot finish.
- Vercel Sandbox (microVM) adapter was not implemented; it remains the recommended production
  path for long runs.

## Smallest remaining change

Set `OPENCODE_MODEL` and one encrypted provider key on the project, then call the authenticated
`/api/runtime/probe` and send a conversation request. No source change is needed for the binary
spawn. For longer runs, add the `VercelSandboxAdapter` described in `docs/ARCHITECTURE.md`.
