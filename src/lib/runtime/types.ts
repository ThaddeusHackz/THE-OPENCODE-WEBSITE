import type { TempWorkspace } from '../workspace';
import type { FileChange } from '../workspace';

export type RuntimeProbeResult = {
  available: boolean;
  runtimeId: 'opencode-cli';
  binaryPath: string | null;
  versionOutput: string | null;
  error: string | null;
  ephemeralWorkspace: true;
};

export type AgentRunResult = {
  ok: boolean;
  runtimeId: 'opencode-cli';
  text: string | null;
  error: string | null;
  exitCode: number | null;
  durationMs: number;
  stdout: string;
  stderr: string;
  changes: FileChange[];
  patch: string;
  workspaceEphemeral: true;
  timedOut: boolean;
};

export type AgentRunRequest = {
  workspace: TempWorkspace;
  prompt: string;
  repoFullName: string;
  ref: string;
  /** Validated normal free model or the server-configured model. */
  model?: string;
  /**
   * Request-scoped server env (includes Vercel's per-request OIDC token).
   * Never mutates process.env, so concurrent Function invocations stay isolated.
   */
  serverEnv?: Record<string, string | undefined>;
};

export interface RuntimeAdapter {
  id: 'opencode-cli';
  probe(): Promise<RuntimeProbeResult>;
  run(request: AgentRunRequest): Promise<AgentRunResult>;
}
