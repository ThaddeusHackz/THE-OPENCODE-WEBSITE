import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  authorizeErrorMessage,
  classifyAuthorizeResponse,
  getGithubOauthStatus,
  githubEnabledFromSettings,
  resetOauthStatusCache,
} from '../src/lib/supabase/oauth';

const REAL_400 =
  '{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}';

const saved = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  service: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

afterEach(() => {
  vi.unstubAllGlobals();
  resetOauthStatusCache();
  for (const [key, value] of Object.entries({
    NEXT_PUBLIC_SUPABASE_URL: saved.url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: saved.anon,
    SUPABASE_SERVICE_ROLE_KEY: saved.service,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('Supabase Auth provider detection (pure)', () => {
  it('reads the GitHub flag from every known /settings shape', () => {
    expect(githubEnabledFromSettings({ external: { github: false, google: false } })).toBe(false);
    expect(githubEnabledFromSettings({ external: { github: true } })).toBe(true);
    expect(githubEnabledFromSettings({ external_github_enabled: false })).toBe(false);
    expect(githubEnabledFromSettings({ providers: { github: true } })).toBe(true);
    expect(githubEnabledFromSettings({})).toBeNull();
    expect(githubEnabledFromSettings(null)).toBeNull();
  });

  it('extracts only the short, public authorize error message', () => {
    expect(authorizeErrorMessage(REAL_400)).toBe('Unsupported provider: provider is not enabled');
    expect(authorizeErrorMessage('{"msg":"some secret value should not be echoed back"}')).toBeNull();
    expect(authorizeErrorMessage('not json')).toBeNull();
  });

  it('classifies a real disabled provider, an enabled redirect and inconclusive replies', () => {
    expect(classifyAuthorizeResponse(400, REAL_400)).toBe('disabled');
    expect(classifyAuthorizeResponse(302, '')).toBe('enabled');
    expect(classifyAuthorizeResponse(307, '')).toBe('enabled');
    expect(classifyAuthorizeResponse(401, '{"message":"No API key found in request"}')).toBe('unknown');
    expect(classifyAuthorizeResponse(500, '')).toBe('unknown');
  });
});

describe('getGithubOauthStatus (with mocked fetch)', () => {
  it('uses /auth/v1/settings when readable and reports a disabled provider', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const fetchMock = vi.fn(async (_url: string) =>
      new Response(JSON.stringify({ external: { github: false, google: false } }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const status = await getGithubOauthStatus();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://example.supabase.co/auth/v1/settings');
    expect(status.oauthStatusSource).toBe('settings');
    expect(status.githubOauthEnabled).toBe(false);
    expect(status.githubOauthReason).toContain('external.github = false');
    expect(status.githubOauthFix).toContain('/auth/v1/callback');
    expect(JSON.stringify(status)).not.toContain('public-anon-key');
  });

  it('falls back to the authorize probe when settings is unreadable', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const fetchMock = vi.fn(async (url: string) =>
      url.includes('/settings')
        ? new Response('{"message":"No API key found in request"}', { status: 401 })
        : new Response(REAL_400, { status: 400 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const status = await getGithubOauthStatus();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(status.oauthStatusSource).toBe('authorize-probe');
    expect(status.githubOauthEnabled).toBe(false);
    expect(status.githubOauthReason).toContain('Unsupported provider: provider is not enabled');
    expect(status.githubOauthReason).toContain('dashboard configuration gap');
    expect(JSON.stringify(status)).not.toContain('public-anon-key');
  });

  it('never implies sign-in works when both checks are inconclusive', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    const fetchMock = vi.fn(async () => new Response('upstream error', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);
    const status = await getGithubOauthStatus();
    expect(status.githubOauthEnabled).toBe(false);
    expect(status.oauthStatusSource).toBe('unavailable');
    expect(status.githubOauthReason).toContain('inconclusive');
    expect(status.githubOauthFix).toContain('Dashboard only');
  });

  it('does not re-fetch within the short cache window', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ external: { github: true } }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const first = await getGithubOauthStatus();
    const second = await getGithubOauthStatus();
    expect(first.githubOauthEnabled).toBe(true);
    expect(second.githubOauthEnabled).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
