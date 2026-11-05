# Official OpenCode source inspection + REA analysis

All inspection was **read-only** in a separate temporary location
(`/tmp/opencode-src`, `git clone --depth 1 --branch dev`). No OpenCode core source was
copied into this website, rewritten, or modified. OpenCode is MIT-licensed
(© 2025 opencode); this project is not affiliated with the OpenCode team.

## 1. Official repository / docs as source of truth

- Recursive GitHub tree of `dev`: **10,373 entries**, not truncated. Shallow clone = 248 MB.
- Root `package.json`: private monorepo `opencode@2.2.5`, `"type": "module"`,
  `"packageManager": "bun@1.4.4"`, Bun workspaces + catalog + patched deps.
- `packages/cli/package.json`: `bin: { opencode: "./bin/opencode" }`, build via
  `bun run script/build.ts` / `bun build --compile ./src/index.ts`, Effect + ACP + MCP +
  PTY + native dependencies. It is a **Bun-compiled desktop/CLI application**, not a small
  Node library.
- `packages/function/package.json`: Hono + `@octokit/auth-app` + `@octokit/rest` +
  `jose` + Cloudflare Workers types — an upstream edge-function package, **not** a Vercel
  integration we can reuse.
- README installation: `curl -fsSL https://opencode.ai/v2/install | bash` (installs to
  `$HOME/.opencode/bin`), `npm i -g @opencode/cli@latest`, Homebrew, paru, mise, nix,
  desktop apps. Docs root: `https://opencode.ai/v2/docs`. Built-in agents: `build`,
  `plan`, `general`.
- CLI docs: `opencode run` for automation; `--standalone` bypasses the shared background
  service; `--server` starts a headless server; `service set disabled true` disables the
  service; `debug paths` shows config/cache paths; `debug config` prints the merged config.
- Config docs: JSONC, project config searched from cwd to root, then global
  `~/.config/opencode/opencode.json` (XDG), then `/etc/opencode`. V2 MCP shape is
  `mcp.servers.<name>` with `command`, `environment`, `cwd`, `disabled`, `timeout`, etc.
- Permissions docs: rules `{action, resource, effect}` with actions `read`, `edit`, `glob`,
  `grep`, `shell`, `subagent`, `skill`, `webfetch`, `websearch`, `external_directory`,
  `execute`, `<server>_<tool>`; last matching rule wins; base policy is
  `{action:"*",resource:"*",effect:"allow"}` plus `.env` asks.
- Providers docs: models.dev catalogue, `/connect`, `/models`, OpenCode Go, ChatGPT sign-in,
  custom OpenAI-compatible `baseURL`. A model + provider credential is required.
- `packages/schema/src/config/mcp.ts`: `Config.MCP` has only optional `timeout` and
  `servers: Schema.Record(Schema.String, Mcp.ServerConfig)` — confirming V2 shape.
- `packages/cli/src/commands/handlers/mcp/list.ts`: `ServerConnection.resolve()` →
  `OpenCode.make(...)` → `client.mcp.list({ location: { directory: process.cwd() } })`.
  So `mcp list` is a **server API response**, not a local config reader; a cold location or
  private-server timing can yield the false `No MCP servers configured` seen locally
  ([#54192](https://github.com/anomalyco/opencode/issues/54192),
  [context-mode#1308](https://github.com/mksglu/context-mode/issues/1308)).
- `packages/cli/src/run/noninteractive.ts`: with `--format json`, `emit(type, timestamp,
  data)` writes `{type, timestamp, sessionID, ...data}` per line. Text parts are
  `{type:"text", part:{text}}`; errors are `{type:"error", error:{...}}`. This is exactly
  what `extractAssistantText()` parses.

### Local CLI verification

- Installed `@opencode/cli@2.2.5` in `/tmp/opencode-verify`; `opencode --version` →
  `opencode v2.2.5`. Four optional platform binaries: x64/baseline 252,713,136 bytes,
  musl 251,573,672 bytes.
- `readelf -l/-d/-V` and `ldd`: dynamically linked ELF, `NEEDED` libc/ld-linux/pthread/dl/m,
  GLIBC up to `GLIBC_2.17`. `file` is not installed in this sandbox.
- `opencode --standalone --version` → `opencode v2.2.5` (exit 0).
- `opencode --standalone run --format json --model anthropic/claude-sonnet-4-5 "Reply with
  the single word OK."` in an isolated `/tmp` HOME/XDG tree → exit 1 with
  `{"type":"error","error":{"type":"provider.no-route","message":"Model unavailable:
  anthropic/claude-sonnet-4-5"}}`. **No agent reply was obtained** because no provider
  credential exists. This is a real error, not a fabricated result.
- `mcp add` wrote a correct V2 `mcp.servers.rea` project config; `debug config --standalone`
  loaded it. `mcp list` still reported empty (cold-location/server timing), and shared-service
  commands failed with `Managed service port 49374 on 127.0.0.1 is already in use`
  ([#52234](https://github.com/anomalyco/opencode/issues/52234)).

## 2. REA static analysis (approved reverse-engineering step)

`npx rea-agents@latest analyze-javascript-application` was run against the **published
`@opencode/cli@2.2.5` wrapper** in `/tmp/opencode-verify/node_modules/@opencode/cli` with
`--format json --detail summary --evidence_output /tmp/oc-rea-evidence`. It exited 0 with
coverage 15/15 and evidence `ev_7b158927...`, but selected only **2 files**:
`package.json` and `postinstall.mjs`.

Findings (from that wrapper only):

- `package.json`: version `2.2.5`, `bin`/`postinstall`, four `optionalDependencies`
  (`cli-linux-x64`, `cli-linux-x64-baseline`, `cli-linux-x64-musl`, `cli-darwin-arm64`),
  MIT license, engines.
- `postinstall.mjs`: uses `process.platform`/`arch` and glibc/AVX2 detection to select the
  platform package, tries `createHardLink` then `copyFile`, verifies the copied binary with
  `--version`, and falls back to a temporary `npm install` of the platform package.
- REA reported inherent limits: single-language, static/inert analysis; no runtime
  behaviour, native/binary internals, minified bundles, or dynamic model execution.

`npx rea-agents@latest inspect-binary-layout` on the 241 MB binary **failed** with
`provider_unavailable` — REA requires a caller-supplied Python with `pwntools 4.15.0`,
`pyelftools 0.33`, `Unicorn 2.1.2`. Those were not installed (no silent dependency install);
`readelf` was used instead. The full monorepo was **not** REA-analysed (the wrapper
analysis is not a full source reconstruction). Setup/verification details are in
`docs/REA.md`.

## 3. Design consequences

| Finding | Design decision here |
|---|---|
| Bun-compiled 241 MB native binary, not a Node library | Spawn the official binary on the server; never bundle OpenCode source; never run it in the browser |
| `run --format json` NDJSON events | Parse `text` / `error` events; keep bounded raw stdout for diagnostics |
| Shared service uses fixed port 49374 | Always `--standalone` |
| MCP config V2 `mcp.servers` | Project `opencode.jsonc` + global config use V2 shape |
| Permissions are configurable rules | Strict workspace config denies shell/network/subagents/external paths and `.env` reads |
| Requires model credentials | `configStatus()` gates requests and shows a setup message; no mock |
| 241 MB binary | `outputFileTracingIncludes` + Large Functions requirement documented in `docs/ARCHITECTURE.md` |
| No write-back API used | Diff shown in UI; explicit-confirmation gate; `501` write-back |
