/**
 * Server-side configuration reader. It returns NAMES and non-secret values only.
 * Secret values are read directly from process.env at the point of use and are
 * never returned by this module, never logged and never sent to the browser.
 */

import { DEFAULT_FREE_MODEL, isFreeOpenCodeModel } from './models';

export const PROVIDER_KEY_NAMES = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'OPENROUTER_API_KEY',
  'OPENCODE_GO_API_KEY',
] as const;

export type GitHubMode = 'app' | 'pat' | 'none';

export type ServerEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  githubAppId: string;
  githubAppPrivateKey: string;
  githubInstallationId: string;
  /** Server-side fine-grained PAT, used only when no GitHub App is configured. */
  githubToken: string;
  githubMode: GitHubMode;
  openCodeBinaryPath: string;
  openCodeModel: string;
  openCodeTimeoutMs: number;
  openCodeMaxOutputBytes: number;
  openCodeMaxRepoBytes: number;
  enableModelTests: boolean;
  /** Names only, never values. */
  providerKeyNames: string[];
};

function numberFrom(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), max) : fallback;
}

export function readServerEnv(env: Record<string, string | undefined> = process.env): ServerEnv {
  const appReady = Boolean(env.GITHUB_APP_ID && env.GITHUB_APP_PRIVATE_KEY && env.GITHUB_APP_INSTALLATION_ID);
  return {
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    githubAppId: env.GITHUB_APP_ID ?? '',
    githubAppPrivateKey: env.GITHUB_APP_PRIVATE_KEY ?? '',
    githubInstallationId: env.GITHUB_APP_INSTALLATION_ID ?? '',
    githubToken: env.GITHUB_TOKEN ?? '',
    githubMode: appReady ? 'app' : env.GITHUB_TOKEN ? 'pat' : 'none',
    openCodeBinaryPath: env.OPENCODE_BINARY_PATH ?? '',
    // Official OpenCode Zen free models work signed out, so a free model is the default.
    openCodeModel: env.OPENCODE_MODEL || DEFAULT_FREE_MODEL,
    openCodeTimeoutMs: numberFrom(env.OPENCODE_TIMEOUT_MS, 240_000, 780_000),
    openCodeMaxOutputBytes: numberFrom(env.OPENCODE_MAX_OUTPUT_BYTES, 200_000, 1_000_000),
    openCodeMaxRepoBytes: numberFrom(env.OPENCODE_MAX_REPO_BYTES, 50_000_000, 200_000_000),
    enableModelTests: env.ENABLE_MODEL_TESTS === '1',
    providerKeyNames: PROVIDER_KEY_NAMES.filter((name) => Boolean(env[name])),
  };
}

export type ConfigStatus = {
  supabaseConfigured: boolean;
  githubAppConfigured: boolean;
  githubPatConfigured: boolean;
  githubMode: GitHubMode;
  openCodeConfigured: boolean;
  binaryPathProvided: boolean;
  model: string;
  freeModel: boolean;
  modelTestsEnabled: boolean;
  missing: string[];
  setupMessage: string;
};

/** Safe-to-send configuration status (booleans + variable names only). */
export function configStatus(env: Record<string, string | undefined> = process.env): ConfigStatus {
  const cfg = readServerEnv(env);
  const supabaseConfigured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
  const githubAppConfigured = cfg.githubMode === 'app';
  const githubPatConfigured = cfg.githubMode === 'pat';
  const freeModel = isFreeOpenCodeModel(cfg.openCodeModel);
  // A free OpenCode Zen model needs no provider key; all other models do.
  const openCodeConfigured = Boolean(cfg.openCodeModel) && (freeModel || cfg.providerKeyNames.length > 0);
  const missing: string[] = [];
  if (!supabaseConfigured) missing.push('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (cfg.githubMode === 'none') missing.push('GITHUB_APP_* (preferred) or GITHUB_TOKEN');
  if (!openCodeConfigured) missing.push('OPENCODE_MODEL and one model-provider key (or use a free OpenCode model)');
  const setupMessage = missing.length
    ? `Setup incomplete. Configure: ${missing.join(', ')}. The agent will not run and no reply will be fabricated.`
    : `Configuration present. Using ${cfg.openCodeModel}${freeModel ? ' (official free OpenCode Zen model, no API key needed)' : ''}. The real OpenCode runtime is attempted on the server only.`;
  return {
    supabaseConfigured,
    githubAppConfigured,
    githubPatConfigured,
    githubMode: cfg.githubMode,
    openCodeConfigured,
    binaryPathProvided: Boolean(cfg.openCodeBinaryPath),
    model: cfg.openCodeModel,
    freeModel,
    modelTestsEnabled: cfg.enableModelTests,
    missing,
    setupMessage,
  };
}
