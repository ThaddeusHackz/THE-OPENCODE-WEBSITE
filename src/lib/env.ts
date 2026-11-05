/**
 * Server-side configuration reader. It returns NAMES and non-secret values only.
 * Secret values are read directly from process.env at the point of use and are
 * never returned by this module, never logged and never sent to the browser.
 */

export const PROVIDER_KEY_NAMES = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'OPENROUTER_API_KEY',
  'OPENCODE_GO_API_KEY',
] as const;

export type ServerEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  githubAppId: string;
  githubAppPrivateKey: string;
  githubInstallationId: string;
  openCodeBinaryPath: string;
  openCodeModel: string;
  openCodeTimeoutMs: number;
  openCodeMaxOutputBytes: number;
  openCodeMaxRepoBytes: number;
  /** Names only, never values. */
  providerKeyNames: string[];
};

function numberFrom(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), max) : fallback;
}

export function readServerEnv(env: Record<string, string | undefined> = process.env): ServerEnv {
  return {
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    githubAppId: env.GITHUB_APP_ID ?? '',
    githubAppPrivateKey: env.GITHUB_APP_PRIVATE_KEY ?? '',
    githubInstallationId: env.GITHUB_APP_INSTALLATION_ID ?? '',
    openCodeBinaryPath: env.OPENCODE_BINARY_PATH ?? '',
    openCodeModel: env.OPENCODE_MODEL ?? '',
    openCodeTimeoutMs: numberFrom(env.OPENCODE_TIMEOUT_MS, 240_000, 780_000),
    openCodeMaxOutputBytes: numberFrom(env.OPENCODE_MAX_OUTPUT_BYTES, 200_000, 1_000_000),
    openCodeMaxRepoBytes: numberFrom(env.OPENCODE_MAX_REPO_BYTES, 50_000_000, 200_000_000),
    providerKeyNames: PROVIDER_KEY_NAMES.filter((name) => Boolean(env[name])),
  };
}

export type ConfigStatus = {
  supabaseConfigured: boolean;
  githubAppConfigured: boolean;
  openCodeConfigured: boolean;
  binaryPathProvided: boolean;
  missing: string[];
  setupMessage: string;
};

/** Safe-to-send configuration status (booleans + variable names only). */
export function configStatus(env: Record<string, string | undefined> = process.env): ConfigStatus {
  const cfg = readServerEnv(env);
  const supabaseConfigured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
  const githubAppConfigured = Boolean(cfg.githubAppId && cfg.githubAppPrivateKey && cfg.githubInstallationId);
  const openCodeConfigured = Boolean(cfg.openCodeModel) && cfg.providerKeyNames.length > 0;
  const missing: string[] = [];
  if (!supabaseConfigured) missing.push('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!githubAppConfigured) missing.push('GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY / GITHUB_APP_INSTALLATION_ID');
  if (!cfg.openCodeModel) missing.push('OPENCODE_MODEL');
  if (cfg.providerKeyNames.length === 0) missing.push('one model-provider key (see .env.example)');
  const setupMessage = missing.length
    ? `Setup incomplete. Configure: ${missing.join(', ')}. The agent will not run and no reply will be fabricated.`
    : 'Configuration present. The real OpenCode runtime is attempted on the server only.';
  return {
    supabaseConfigured,
    githubAppConfigured,
    openCodeConfigured,
    binaryPathProvided: Boolean(cfg.openCodeBinaryPath),
    missing,
    setupMessage,
  };
}
