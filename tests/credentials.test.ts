import { afterEach, describe, expect, it } from 'vitest';
import { configStatus } from '../src/lib/env';
import { hasVercelOidc, serverEnvWithOidc, vercelOidcToken } from '../src/lib/runtime/credentials';

const originalVercel = process.env.VERCEL;
const fakeRequest = (token?: string) => ({
  headers: {
    get: (name: string) => (name === 'x-vercel-oidc-token' ? token ?? null : null),
  },
});

afterEach(() => {
  if (originalVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = originalVercel;
  delete process.env.VERCEL_OIDC_TOKEN;
  delete process.env.AI_GATEWAY_API_KEY;
});

describe('request-scoped Vercel OIDC credentials', () => {
  it('reads the per-request header on Vercel without mutating process.env', () => {
    process.env.VERCEL = '1';
    const env = serverEnvWithOidc(fakeRequest('oidc-header-secret'));
    expect(env.VERCEL_OIDC_TOKEN).toBe('oidc-header-secret');
    expect(env.AI_GATEWAY_API_KEY).toBe('oidc-header-secret');
    expect(env.GITHUB_TOKEN).toBe(process.env.GITHUB_TOKEN);
    expect(process.env.VERCEL_OIDC_TOKEN).toBeUndefined();
    expect(process.env.AI_GATEWAY_API_KEY).toBeUndefined();
    expect(hasVercelOidc(fakeRequest('oidc-header-secret'))).toBe(true);
  });

  it('does not trust a client-supplied header off Vercel', () => {
    delete process.env.VERCEL;
    expect(vercelOidcToken(fakeRequest('spoofed'))).toBeUndefined();
    expect(hasVercelOidc(fakeRequest('spoofed'))).toBe(false);
  });

  it('falls back to a local/build VERCEL_OIDC_TOKEN', () => {
    delete process.env.VERCEL;
    process.env.VERCEL_OIDC_TOKEN = 'local-token';
    expect(serverEnvWithOidc(fakeRequest()).VERCEL_OIDC_TOKEN).toBe('local-token');
  });

  it('makes config status keyless-ready while never exposing the token value', () => {
    process.env.VERCEL = '1';
    const env = serverEnvWithOidc(fakeRequest('oidc-header-secret'));
    const status = configStatus(env);
    expect(status.openCodeConfigured).toBe(true);
    expect(status.vercelOidcConfigured).toBe(true);
    expect(status.missingModelEnvKeys).toEqual([]);
    expect(JSON.stringify(status)).not.toContain('oidc-header-secret');
  });
});
