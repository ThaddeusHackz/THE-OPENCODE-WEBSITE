import { describe, expect, it } from 'vitest';
import { configStatus, readServerEnv } from '../src/lib/env';
import { DEFAULT_FREE_MODEL, FREE_MODELS, FREE_MODEL_IDS, isFreeOpenCodeModel, validateModel } from '../src/lib/models';

describe('official free OpenCode Zen model catalog', () => {
  it('contains all zero-cost models from the official catalog', () => {
    expect(FREE_MODELS.length).toBeGreaterThan(20);
    expect(FREE_MODELS.every((model) => model.fullId.startsWith('opencode/'))).toBe(true);
    expect(FREE_MODELS.every((model) => model.requiresKey === false)).toBe(true);
    expect(FREE_MODEL_IDS.size).toBe(FREE_MODELS.length);
  });

  it('includes the requested DeepSeek V4.1 Flash and other preferred free models', () => {
    for (const id of [
      'deepseek-v4.1-flash-free',
      'deepseek-v4-flash-free',
      'big-pickle',
      'glm-5.3-flash-free',
      'muse-spark-1.3-contributor-free',
      'nemotron-3-ultra-free',
      'mimo-v2.5-free',
      'grok-code',
    ]) {
      expect(isFreeOpenCodeModel(`opencode/${id}`)).toBe(true);
    }
    expect(DEFAULT_FREE_MODEL).toBe('opencode/deepseek-v4.1-flash-free');
  });

  it('defaults to a free model with no provider key', () => {
    const cfg = readServerEnv({});
    expect(cfg.openCodeModel).toBe(DEFAULT_FREE_MODEL);
    expect(cfg.providerKeyNames).toEqual([]);
    const status = configStatus({});
    expect(status.openCodeConfigured).toBe(true);
    expect(status.freeModel).toBe(true);
    expect(status.model).toBe(DEFAULT_FREE_MODEL);
    expect(status.missing.some((item) => item.includes('model-provider key'))).toBe(false);
  });

  it('requires a key for non-free models', () => {
    const status = configStatus({ OPENCODE_MODEL: 'anthropic/claude-sonnet-4-5' });
    expect(status.openCodeConfigured).toBe(false);
    expect(status.missing.some((item) => item.includes('model-provider key'))).toBe(true);
  });

  it('treats a server-side PAT as a valid GitHub mode', () => {
    const status = configStatus({ GITHUB_TOKEN: 'github_pat_dummy' });
    expect(status.githubMode).toBe('pat');
    expect(status.githubPatConfigured).toBe(true);
    expect(status.missing.some((item) => item.includes('GITHUB'))).toBe(false);
    expect(JSON.stringify(status)).not.toContain('github_pat_dummy');
  });

  it('prefers the GitHub App when both are configured', () => {
    const status = configStatus({
      GITHUB_APP_ID: '1',
      GITHUB_APP_PRIVATE_KEY: 'pem',
      GITHUB_APP_INSTALLATION_ID: '2',
      GITHUB_TOKEN: 'github_pat_dummy',
    });
    expect(status.githubMode).toBe('app');
  });
});

describe('model validation', () => {
  it('accepts official free models and the configured model', () => {
    expect(validateModel('opencode/deepseek-v4.1-flash-free', DEFAULT_FREE_MODEL)).toBe('opencode/deepseek-v4.1-flash-free');
    expect(validateModel(undefined, 'anthropic/claude-sonnet-4-5')).toBe('anthropic/claude-sonnet-4-5');
  });

  it('rejects arbitrary or oversized browser-supplied models', () => {
    expect(() => validateModel('evil/model --help', DEFAULT_FREE_MODEL)).toThrow();
    expect(() => validateModel('x'.repeat(200), DEFAULT_FREE_MODEL)).toThrow();
    expect(() => validateModel('opencode/not-a-real-model', DEFAULT_FREE_MODEL)).toThrow();
  });
});
