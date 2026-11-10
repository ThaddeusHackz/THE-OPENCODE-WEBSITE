export type MeResponse = {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
    githubLogin: string | null;
  } | null;
};

export type ConfigStatus = {
  supabaseConfigured: boolean;
  githubAppConfigured: boolean;
  githubPatConfigured: boolean;
  githubMode: 'app' | 'pat' | 'none';
  openCodeConfigured: boolean;
  binaryPathProvided: boolean;
  model: string;
  freeModel: boolean;
  modelTestsEnabled: boolean;
  catalog: 'normal';
  modelEnvKeys: string[];
  missingModelEnvKeys: string[];
  modelKeyConfigured: boolean;
  keylessOnVercel: boolean;
  vercelOidcConfigured: boolean;
  disableZenFreeModels: boolean;
  githubOauthEnabled?: boolean;
  githubOauthReason?: string;
  githubOauthFix?: string | null;
  oauthStatusSource?: 'settings' | 'authorize-probe' | 'unavailable';
  missing: string[];
  setupMessage: string;
};

export type FreeModel = {
  provider: string;
  id: string;
  fullId: string;
  name: string;
  context: number;
  output: number;
  cost: 0;
  envKeys: string[];
  keylessOnVercel: boolean;
  preferred: boolean;
};

export type ModelTestResult = {
  ok: boolean;
  model: string;
  text: string | null;
  error: string | null;
  exitCode: number | null;
  durationMs: number;
  timedOut: boolean;
  quota?: { retryAfterMs: number; retryAfterHours: number } | null;
  hint?: string | null;
};

export type Repo = {
  full_name: string;
  name: string;
  owner: string;
  private: boolean;
  default_branch: string;
  description: string | null;
};

export type Session = {
  id: string;
  title: string;
  repo_full_name: string;
  repo_ref: string;
  updated_at: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata: {
    patch?: string;
    changes?: Array<{ path: string; status: string }>;
    runtime?: string;
    durationMs?: number;
    workspace?: string;
    [key: string]: unknown;
  };
};

export type ProbeResult = {
  available: boolean;
  runtimeId: string;
  binaryPath: string | null;
  versionOutput: string | null;
  error: string | null;
};

export type RunResult = {
  ok: boolean;
  sessionId: string;
  result: {
    text: string | null;
    error: string | null;
    exitCode: number | null;
    durationMs: number;
    timedOut: boolean;
    patch: string;
    changes: Array<{ path: string; status: string }>;
    runtime: string;
    workspace: string;
  };
};
