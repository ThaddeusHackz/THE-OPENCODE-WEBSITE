/**
 * Server-side check of whether Supabase Auth actually has a GitHub OAuth
 * provider enabled. Never trust a client-supplied flag, never expose key values.
 *
 * Reproduced failure (2026-11-05): the app's POST /api/auth/signin correctly
 * redirects to `${SUPABASE_URL}/auth/v1/authorize?provider=github&...`, but that
 * endpoint returns HTTP 400
 * `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`.
 * Google / Discord / Azure controls return the same 400, and the project's auth
 * config reports every `external_*_enabled: false`. This is a dashboard
 * configuration gap, not an app bug — so the UI must not ship a dead-end button.
 *
 * Strategy:
 *   1. GET /auth/v1/settings with SUPABASE_SERVICE_ROLE_KEY (if configured) or
 *      the publishable anon key, and read the real provider flags.
 *   2. If settings is not readable, probe /auth/v1/authorize?provider=github
 *      and interpret the real status/body.
 *   3. If both are inconclusive, report DISABLED with an explicit "unverified"
 *      reason — never imply sign-in works.
 *
 * Values are only ever held in server memory. Responses contain booleans, a
 * short reason and a short fix string; no apikey, no raw settings blob.
 */

import { readServerEnv } from '../env';

export type OAuthStatusSource = 'settings' | 'authorize-probe' | 'unavailable';

export type GithubOauthStatus = {
  githubOauthEnabled: boolean;
  githubOauthReason: string;
  githubOauthFix: string | null;
  oauthStatusSource: OAuthStatusSource;
  oauthCheckedAt: string | null;
};

export const GITHUB_OAUTH_FIX =
  'Dashboard only (cannot be done by this app): create a GitHub OAuth App with Authorization callback URL https://xmbkmdqaczlxkdarayyy.supabase.co/auth/v1/callback, then Supabase Dashboard → Authentication → Providers (Third-party) → GitHub → enable it and paste Client ID + Client Secret. Confirm Site URL and the Redirect URL allowlist include https://the-opencode-website-poc.vercel.app/auth/callback. See docs/SUPABASE.md.';

export const DISABLED_REASON =
  'Supabase Auth has no third-party OAuth provider enabled. Its authorize endpoint returns HTTP 400 "Unsupported provider: provider is not enabled" for GitHub (Google, Discord and Azure controls fail the same way), so POST /api/auth/signin cannot complete. This is a Supabase dashboard configuration gap, not an application error.';

const TIMEOUT_MS = 3_500;
const CACHE_TTL_MS = 60_000;
let cached: { value: GithubOauthStatus; at: number } | null = null;

/** Pure: read the GitHub flag from GoTrue's /settings payload, or null if unknown. */
export function githubEnabledFromSettings(data: unknown): boolean | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const external = record.external;
  if (external && typeof external === 'object' && Object.prototype.hasOwnProperty.call(external, 'github')) {
    return (external as Record<string, unknown>).github === true;
  }
  if (typeof record.external_github_enabled === 'boolean') return record.external_github_enabled;
  const providers = record.providers;
  if (providers && typeof providers === 'object' && Object.prototype.hasOwnProperty.call(providers, 'github')) {
    return (providers as Record<string, unknown>).github === true;
  }
  return null;
}

/** Pure, bounded extraction of the public GoTrue error message (no secrets). */
export function authorizeErrorMessage(body: string): string | null {
  try {
    const parsed = JSON.parse(body) as { msg?: unknown };
    if (
      typeof parsed.msg === 'string' &&
      parsed.msg.length < 200 &&
      /provider|unsupported|enabled/i.test(parsed.msg)
    ) {
      return parsed.msg;
    }
  } catch {
    // not JSON — fall through to a generic reason
  }
  return null;
}

export type AuthorizeVerdict = 'enabled' | 'disabled' | 'unknown';

/** Pure: classify a real /authorize response without following the redirect. */
export function classifyAuthorizeResponse(status: number, body: string): AuthorizeVerdict {
  if (status >= 300 && status < 400) return 'enabled';
  const message = authorizeErrorMessage(body);
  if (message && /not enabled|unsupported provider/i.test(message)) return 'disabled';
  if (status === 400 && /not enabled|unsupported provider/i.test(body)) return 'disabled';
  return 'unknown';
}

function credentialHeaders(): Record<string, string> {
  // Prefer a server-side service-role key when one is configured; otherwise the
  // publishable anon key is sufficient for GoTrue's public /settings endpoint.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || readServerEnv().supabaseAnonKey;
  return key ? { apikey: key, Authorization: `Bearer ${key}` } : {};
}

async function fromSettings(): Promise<GithubOauthStatus | null> {
  const { supabaseUrl } = readServerEnv();
  if (!supabaseUrl) return null;
  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/settings`, {
      headers: credentialHeaders(),
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const enabled = githubEnabledFromSettings(await response.json());
    if (enabled === null) return null;
    return {
      githubOauthEnabled: enabled,
      githubOauthReason: enabled
        ? 'Supabase Auth /auth/v1/settings reports the GitHub OAuth provider is enabled.'
        : 'Supabase Auth /auth/v1/settings reports external.github = false: no GitHub OAuth provider is enabled. Sign-in cannot start until it is enabled in the Supabase dashboard.',
      githubOauthFix: enabled ? null : GITHUB_OAUTH_FIX,
      oauthStatusSource: 'settings',
      oauthCheckedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

async function fromAuthorizeProbe(): Promise<GithubOauthStatus> {
  const { supabaseUrl } = readServerEnv();
  const fallback: GithubOauthStatus = {
    githubOauthEnabled: false,
    githubOauthReason:
      'Could not verify Supabase Auth provider settings (/auth/v1/settings unreadable and the authorize probe was inconclusive). Sign-in is treated as unavailable; check the Supabase dashboard.',
    githubOauthFix: GITHUB_OAUTH_FIX,
    oauthStatusSource: 'unavailable',
    oauthCheckedAt: new Date().toISOString(),
  };
  if (!supabaseUrl) return fallback;
  const probeUrl = new URL('/auth/v1/authorize', supabaseUrl);
  probeUrl.searchParams.set('provider', 'github');
  probeUrl.searchParams.set('redirect_to', 'https://the-opencode-website-poc.vercel.app/auth/callback');
  let status = 0;
  let body = '';
  try {
    const response = await fetch(probeUrl.toString(), {
      headers: credentialHeaders(),
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    status = response.status;
    body = (await response.text()).slice(0, 300);
  } catch {
    return fallback;
  }
  const verdict = classifyAuthorizeResponse(status, body);
  if (verdict === 'enabled') {
    return {
      githubOauthEnabled: true,
      githubOauthReason: `Supabase Auth /auth/v1/authorize redirects for provider=github (HTTP ${status}), so the provider is enabled.`,
      githubOauthFix: null,
      oauthStatusSource: 'authorize-probe',
      oauthCheckedAt: new Date().toISOString(),
    };
  }
  if (verdict === 'disabled') {
    const message = authorizeErrorMessage(body);
    return {
      githubOauthEnabled: false,
      githubOauthReason: `Supabase Auth /auth/v1/authorize?provider=github returned HTTP ${status}${message ? `: "${message}"` : ''}. ${DISABLED_REASON}`,
      githubOauthFix: GITHUB_OAUTH_FIX,
      oauthStatusSource: 'authorize-probe',
      oauthCheckedAt: new Date().toISOString(),
    };
  }
  return {
    ...fallback,
    githubOauthReason: `Supabase Auth /auth/v1/settings was unreadable and the authorize probe returned HTTP ${status}, which is inconclusive. Sign-in is treated as unavailable; check the Supabase dashboard.`,
    oauthStatusSource: 'unavailable',
  };
}

/** Cached for 60 s so /api/config does not hit Supabase on every page load. */
export async function getGithubOauthStatus(): Promise<GithubOauthStatus> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.value;
  const value = (await fromSettings()) ?? (await fromAuthorizeProbe());
  cached = { value, at: now };
  return value;
}

/** Test helper: clear the short-lived cache. */
export function resetOauthStatusCache(): void {
  cached = null;
}
