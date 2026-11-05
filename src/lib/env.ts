/**
 * Server-side configuration reader. It returns NAMES and non-secret values only.
 * Secret values are read directly from process.env at the point of use and are
 * never returned by this module, never logged and never sent to the browser.
 */

import {
  DEFAULT_FREE_MODEL,
  NORMAL_PROVIDER_KEY_NAMES,
  isFreeModel,
  isKeylessOnVercel,
  missingEnvKeysFor,
  modelEnvKeys,
} from './models';

/**
 * Names only. These are the only credential variables passed to the OpenCode
 * child process. GitHub / Supabase / Vercel project secrets are never included.
 */
export const PROVIDER_KEY_NAMES: string[] = Array.from(new Set<string>(NORMAL_PROVIDER_KEY_NAMES));

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
  /** Credential env var names needed by the selected normal free model. */
  modelEnvKeys: string[];
  /** Credential env var names still missing for the selected model. */
  missingModelEnvKeys: string[];
  modelKeyConfigured: boolean;
  keylessOnVercel: boolean;
  vercelOidcConfigured: boolean;
  /** Disables OpenCode's Zen promotional free models in the child process. */
  disableZenFreeModels: boolean;
};

function numberFrom(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), max) : fallback;
}

export function readServerEnv(env: Record<string, string | undefined> = process.env): ServerEnv {
  const appReady = Boolean(env.GITHUB_APP_ID && env.GITHUB_APP_PRIVATE_KEY && env.GITHUB_APP_INSTALLATION_ID);
  const providerKeyNames = PROVIDER_KEY_NAMES.filter((name) => Boolean(env[name]));
  // An old OPENCODE_MODEL pointing at OpenCode Zen is ignored: Zen is disabled.
  const requested = env.OPENCODE_MODEL || DEFAULT_FREE_MODEL;
  const zenModel = requested.startsWith('opencode/') || requested.startsWith('opencode-go/');
  const openCodeModel = zenModel ? DEFAULT_FREE_MODEL : requested;
  const freeModel = isFreeModel(openCodeModel);
  const keys = modelEnvKeys(openCodeModel);
  const missing = freeModel
    ? missingEnvKeysFor(openCodeModel, env)
    : providerKeyNames.length > 0
      ? []
      : ['one model-provider key'];
  return {
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    githubAppId: env.GITHUB_APP_ID ?? '',
    githubAppPrivateKey: env.GITHUB_APP_PRIVATE_KEY ?? '',
    githubInstallationId: env.GITHUB_APP_INSTALLATION_ID ?? '',
    githubToken: env.GITHUB_TOKEN ?? '',
    githubMode: appReady ? 'app' : env.GITHUB_TOKEN ? 'pat' : 'none',
    openCodeBinaryPath: env.OPENCODE_BINARY_PATH ?? '',
    openCodeModel,
    openCodeTimeoutMs: numberFrom(env.OPENCODE_TIMEOUT_MS, 240_000, 780_000),
    openCodeMaxOutputBytes: numberFrom(env.OPENCODE_MAX_OUTPUT_BYTES, 200_000, 1_000_000),
    openCodeMaxRepoBytes: numberFrom(env.OPENCODE_MAX_REPO_BYTES, 50_000_000, 200_000_000),
    enableModelTests: env.ENABLE_MODEL_TESTS === '1',
    providerKeyNames,
    modelEnvKeys: keys,
    missingModelEnvKeys: missing,
    modelKeyConfigured: missing.length === 0,
    keylessOnVercel: isKeylessOnVercel(openCodeModel),
    vercelOidcConfigured: Boolean(env.VERCEL_OIDC_TOKEN || env.AI_GATEWAY_API_KEY),
    disableZenFreeModels: env.OPENCODE_DISABLE_FREE_MODELS !== '0',
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
  /** "normal" = ordinary providers from OpenCode's models.dev catalog, not Zen. */
  catalog: 'normal';
  modelEnvKeys: string[];
  missingModelEnvKeys: string[];
  modelKeyConfigured: boolean;
  keylessOnVercel: boolean;
  vercelOidcConfigured: boolean;
  disableZenFreeModels: boolean;
  missing: string[];
  setupMessage: string;
};

/** Safe-to-send configuration status (booleans + variable names only). */
export function configStatus(env: Record<string, string | undefined> = process.env): ConfigStatus {
  const cfg = readServerEnv(env);
  const supabaseConfigured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
  const githubAppConfigured = cfg.githubMode === 'app';
  const githubPatConfigured = cfg.githubMode === 'pat';
  const freeModel = isFreeModel(cfg.openCodeModel);
  const openCodeConfigured = Boolean(cfg.openCodeModel) && cfg.modelKeyConfigured;
  const missing: string[] = [];
  if (!supabaseConfigured) missing.push('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (cfg.githubMode === 'none') missing.push('GITHUB_APP_* (preferred) or GITHUB_TOKEN');
  if (!openCodeConfigured) {
    missing.push(
      cfg.missingModelEnvKeys.length
        ? `credential for ${cfg.openCodeModel}: ${cfg.missingModelEnvKeys.join(' or ')}`
        : 'one model-provider key',
    );
  }
  const modelNote = cfg.keylessOnVercel
    ? cfg.vercelOidcConfigured
      ? ' (normal Vercel AI Gateway free model; keyless via the automatic OIDC token)'
      : ' (normal Vercel AI Gateway free model; needs VERCEL_OIDC_TOKEN, automatic on Vercel)'
    : freeModel
      ? ` (normal free model; set ${cfg.modelEnvKeys.join(' or ')} as a server-side env var)`
      : '';
  const setupMessage = missing.length
    ? `Setup incomplete. Configure: ${missing.join(', ')}. The agent will not run and no reply will be fabricated.`
    : `Configuration present. Using ${cfg.openCodeModel}${modelNote}. OpenCode Zen free models are disabled. The real OpenCode runtime is attempted on the server only.`;
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
    catalog: 'normal',
    modelEnvKeys: cfg.modelEnvKeys,
    missingModelEnvKeys: cfg.missingModelEnvKeys,
    modelKeyConfigured: cfg.modelKeyConfigured,
    keylessOnVercel: cfg.keylessOnVercel,
    vercelOidcConfigured: cfg.vercelOidcConfigured,
    disableZenFreeModels: cfg.disableZenFreeModels,
    missing,
    setupMessage,
  };
}
