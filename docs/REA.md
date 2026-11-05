# REA (Reverse Engineer Anything) MCP setup — plan, execution and verification

## 1. Pre-flight inspection (before any install)

- Repository contained exactly one tracked file, `README.md` (23 bytes). Clean tree.
- Node.js **v22.22.3**, npm 10.9.8, `engine-strict=false`. `$HOME` had no agent configs.
- You stated REA needs Node ≥ 22.19. That is true for REA ≤ 6.7.0. The published
  `rea-agents@latest` is **6.8.0**, whose `engines.node` is
  `^22.23.4 || ^24.22.1 || >=26.12.1`; its `setup` source hard-fails on an unsupported
  runtime with `Install Node.js 22.x (>=22.23.4) … and rerun setup.`
- Options were presented and **Option A was approved**: an ephemeral official Node
  22.23.4 binary in `/tmp` only, prepended to `PATH` for the setup commands. The
  system Node remains v22.22.3 (verified after setup).

## 2. Plan that was approved (no silent changes)

| Item | Detail |
|---|---|
| Exact command | `npx rea-agents@latest setup` — run verbatim first. In a non-TTY sandbox it is read-only and returns `status: ready` / `plannedActions: []`. |
| Then | `npx rea-agents@latest setup --client opencode --skill=false --dry-run --json` — reviewed plan before any write. |
| Then | `npx rea-agents@latest setup --client opencode --skill=false --yes --json` — apply that exact plan. No `--all-detected`, no `--install-hopper`. |
| Downloads | `rea-agents@6.8.0` (~49 MB unpacked, 2,398 files) + 42 runtime deps into `~/.npm/_npx/…`; optional native `frida`. Plus an official Node 22.23.4 npm binary package into `/tmp`. |
| Files written outside repo | `~/.config/opencode/opencode.json` (global client config), npm cache. Backups (`.rea.backup*`) are created when an existing config is edited. |
| Files written inside repo | `opencode.jsonc` (project-scoped `mcp.servers.rea`, no secrets), `.gitignore`, docs, app code. |
| Permissions | HTTPS to `registry.npmjs.org`, write to `~/.npm`, `~/.config/opencode`, `/tmp`; child-process execution (`npx`, `ps`) as the unprivileged user. **No sudo**, no apt/snap/rpm, no Hopper. |
| Secrets | None requested. Setup was run with non-interactive flags; no API key/token was pasted, logged or committed. |
| Risks disclosed | Third-party code execution, writes to home-dotfile configs, native dependency lifecycle scripts, Node engine mismatch, no Hopper ⇒ native binary providers unavailable, REA MCP server has broad local capability (local tooling only; never wired into the website or Vercel Functions). |

## 3. Execution results

```
$ npx rea-agents@latest setup          # with /tmp Node 22.23.4 first on PATH
status: ready
plannedActions: []
appliedActions: []
doctor.healthy: true
doctor.environment_healthy: false      # optional analysis engines not configured
npm warn deprecated prebuild-install@7.1.3   # transitive, expected
```

Dry-run plan (`--dry-run --json`) contained exactly one action:

```json
{"id":"configure_client:opencode","kind":"configure_client",
 "target":"/home/user/.config/opencode/opencode.json","operation":"create",
 "detail":"Command: \"npx\" \"-y\" \"rea-agents@6.8.0\" \"mcp\"."}
```

Apply result: `status: ready`, `appliedActions: ["configured_opencode"]`,
`doctor.healthy: true`, registration `state: "aligned"`.

REA wrote the **legacy** shape into the global config:

```json
{ "mcp": { "rea": { "type": "local", "command": ["npx","-y","rea-agents@6.8.0","mcp"], "enabled": true } } }
```

OpenCode V2 requires `mcp.servers.<name>` and silently ignores `mcp.<name>`
([anomalyco/opencode#56602](https://github.com/anomalyco/opencode/issues/56602)).
I therefore rewrote `~/.config/opencode/opencode.json` to the V2 shape and added the
same registration to this repository's `opencode.jsonc`. `rea doctor --client opencode --json`
still reports `healthy: true`, `registration:opencode` OK, and `state: aligned`.

## 4. Verification results

| Check | Result |
|---|---|
| `npx rea-agents@latest --version --json` | `{"name":"rea-agents","version":"6.8.0","runtime":{"id":"node","version":"22.23.4"},"supported_runtime":{"satisfied":true}}` |
| `npx rea-agents@latest doctor --client opencode --json` | `healthy: true`; `node 22.23.4` OK; `registration:opencode` OK; `state: aligned` |
| `opencode debug config --standalone` (real CLI v2.2.5) | Loads `~/.config/opencode/opencode.json` with `mcp.servers.rea` |
| Direct MCP stdio handshake with `npx -y rea-agents@6.8.0 mcp` | `initialize` → serverInfo `{"name":"rea","version":"6.8.0"}`; `tools/list` → **229 tools** (e.g. `inspect_analysis_settings`, `inspect_desktop_application`) |
| `git status` in website repo | Only intended new files; no secret values found by a grep for token/key patterns |
| System Node after setup | still `v22.22.3` (unchanged) |

### Errors encountered and how they were addressed

1. **Node engine mismatch** — `rea-agents@6.8.0` rejects Node 22.22.3. Fixed with the
   approved ephemeral Node 22.23.4 in `/tmp`; system Node unchanged. No silent upgrade.
2. **`opencode mcp list` printed `No MCP servers configured`** even with a config present.
   Root causes in the official tracker:
   - [#56602](https://github.com/anomalyco/opencode/issues/56602) — V2 ignores `mcp.<name>`.
   - [#54192](https://github.com/anomalyco/opencode/issues/54192) — cold-location race:
     the first `mcp list` can read an empty MCP registry.
   - [context-mode#1308](https://github.com/mksglu/context-mode/issues/1308) — on 2.2.5,
     `mcp list --standalone` can report empty before the private server connects MCP servers;
     recommends `opencode debug config --standalone`.
   Verification therefore uses `debug config` **plus** a real stdio MCP handshake.
3. **`Managed service port 49374 on 127.0.0.1 is already in use`** when OpenCode CLI commands
   used the default shared background service. Official CLI docs recommend `--standalone`
   for a private server; upstream issue
   [#52234](https://github.com/anomalyco/opencode/issues/52234) confirms the hardcoded port
   has no fallback. The website runtime adapter always passes `--standalone`.
4. **`inspect-binary-layout` on the OpenCode binary failed** with
   `provider_unavailable`: REA needs a caller-supplied Python with `pwntools 4.15.0`,
   `pyelftools 0.33`, `Unicorn 2.1.2`. REA never installs Python packages. I did **not**
   install them; ELF analysis was done with `readelf` instead. Static JS analysis succeeded.
5. **`opencode run` with no credentials** returned a real error, not a reply:
   `{"type":"error","error":{"type":"provider.no-route","message":"Model unavailable: anthropic/claude-sonnet-4-5"}}`.
   This is exactly why the website returns a setup error instead of fabricating a response.

No secrets were produced, requested, exposed or committed during setup.
