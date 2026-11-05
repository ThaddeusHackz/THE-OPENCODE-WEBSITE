/**
 * Runtime adapter boundary.
 *
 * Only ONE adapter exists in this prototype: `opencode-cli`, which spawns the
 * actual official OpenCode v2 binary on the server inside a /tmp workspace.
 * There is intentionally NO mock, NO echo bot and NO fallback LLM. If the
 * binary or model credentials are missing, the adapter returns a clear error.
 * See docs/ARCHITECTURE.md for the Vercel constraints and the smallest change
 * (a Vercel Sandbox adapter) that would remove the function-bundle blocker.
 */
export { assertModelKeysConfigured, openCodeCliAdapter, probeOpenCode, runOpenCodeAgent, runOpenCodeSmokeTest } from './opencode-cli';
export {
  resolveOpenCodeBinary,
  buildChildEnv,
  extractAssistantText,
  redactSecrets,
  writeWorkspaceOpenCodeConfig,
} from './opencode-cli';
export type { ModelSmokeResult } from './opencode-cli';
export type {
  AgentRunRequest,
  AgentRunResult,
  RuntimeAdapter,
  RuntimeProbeResult,
} from './types';

export { hasVercelOidc, serverEnvWithOidc, vercelOidcToken, VERCEL_OIDC_HEADER } from './credentials';
