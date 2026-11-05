import { describe, expect, it } from 'vitest';
import { configStatus, readServerEnv } from '../src/lib/env';
import { buildChildEnv, extractAssistantText, redactSecrets, resolveOpenCodeBinary } from '../src/lib/runtime/opencode-cli';
import { diffSnapshots, unifiedDiff, type FileSnapshot } from '../src/lib/workspace';

const workspace = {
  root: '/tmp/ws',
  repo: '/tmp/ws/repo',
  home: '/tmp/ws/home',
  config: '/tmp/ws/xdg/config',
  data: '/tmp/ws/xdg/data',
  cache: '/tmp/ws/xdg/cache',
  state: '/tmp/ws/xdg/state',
  tmp: '/tmp/ws/tmp',
};

describe('runtime adapter boundary', () => {
  it('builds a stripped child environment (no host secrets)', () => {
    const env = buildChildEnv(workspace, {
      PATH: '/bin',
      ANTHROPIC_API_KEY: 'sk-test-value',
      GITHUB_APP_PRIVATE_KEY: 'PEM SECRET',
      SUPABASE_SERVICE_ROLE_KEY: 'service-secret',
      VERCEL_TOKEN: 'vercel-secret',
      GITHUB_APP_ID: '123',
    });
    expect(env.PATH).toBe('/bin');
    expect(env.ANTHROPIC_API_KEY).toBe('sk-test-value');
    expect(env.GITHUB_APP_PRIVATE_KEY).toBeUndefined();
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
    expect(env.VERCEL_TOKEN).toBeUndefined();
    expect(env.GITHUB_APP_ID).toBeUndefined();
    expect(env.HOME).toBe('/tmp/ws/home');
    expect(env.XDG_STATE_HOME).toBe('/tmp/ws/xdg/state');
  });

  it('parses real OpenCode JSON events and errors', () => {
    const stdout = [
      JSON.stringify({ type: 'text', part: { text: 'Hello' } }),
      JSON.stringify({ type: 'text', part: { text: ' world' } }),
      JSON.stringify({ type: 'error', error: { message: 'provider.no-route' } }),
      'not json',
    ].join('\n');
    const result = extractAssistantText(stdout);
    expect(result.text).toBe('Hello\n world');
    expect(result.errors).toEqual(['provider.no-route']);
  });

  it('redacts secret values before storage', () => {
    const source = { ANTHROPIC_API_KEY: 'sk-super-secret-123', OTHER: 'visible' };
    expect(redactSecrets('key=sk-super-secret-123 and visible', source)).toBe('key=[REDACTED] and visible');
  });

  it('resolves only absolute, existing binaries', () => {
    const exists = (file: string) => file === '/opt/opencode/bin/opencode';
    expect(resolveOpenCodeBinary({ OPENCODE_BINARY_PATH: '/opt/opencode/bin/opencode' }, exists)).toBe('/opt/opencode/bin/opencode');
    expect(resolveOpenCodeBinary({ OPENCODE_BINARY_PATH: 'relative/opencode' }, exists)).toBeNull();
    expect(resolveOpenCodeBinary({}, () => false)).toBeNull();
  });

  it('reports config status without exposing secret values', () => {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-anon',
      GITHUB_APP_ID: '1',
      GITHUB_APP_PRIVATE_KEY: 'PEM-SECRET-VALUE',
      GITHUB_APP_INSTALLATION_ID: '2',
      OPENCODE_MODEL: 'anthropic/claude-sonnet-4-5',
      ANTHROPIC_API_KEY: 'sk-secret-value',
    };
    const status = configStatus(env);
    expect(status.supabaseConfigured).toBe(true);
    expect(status.githubAppConfigured).toBe(true);
    expect(status.openCodeConfigured).toBe(true);
    expect(JSON.stringify(status)).not.toContain('PEM-SECRET-VALUE');
    expect(JSON.stringify(status)).not.toContain('sk-secret-value');
    expect(readServerEnv(env).providerKeyNames).toEqual(['ANTHROPIC_API_KEY']);
  });
});

describe('bounded diff summary', () => {
  it('produces a unified diff and file change list', () => {
    const before: FileSnapshot = new Map([
      ['a.txt', { size: 5, sha256: 'old', text: 'one\ntwo\n' }],
    ]);
    const after: FileSnapshot = new Map([
      ['a.txt', { size: 8, sha256: 'new', text: 'one\nTWO\n' }],
      ['b.txt', { size: 3, sha256: 'add', text: 'new\n' }],
    ]);
    const { changes, patch } = diffSnapshots(before, after);
    expect(changes.map((c) => c.status).sort()).toEqual(['added', 'modified']);
    expect(patch).toContain('-two');
    expect(patch).toContain('+TWO');
    expect(unifiedDiff('a\n', 'b\n')).toContain('+b');
  });
});
