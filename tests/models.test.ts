import { describe, expect, it } from 'vitest';
import { configStatus, readServerEnv } from '../src/lib/env';
import {
  DEFAULT_FREE_MODEL,
  FREE_MODELS,
  FREE_MODEL_IDS,
  isFreeModel,
  missingEnvKeysFor,
  validateModel,
} from '../src/lib/models';

describe('normal (non-Zen) free model catalog', () => {
  it('contains zero-cost, tool-capable chat models from ordinary providers', () => {
    expect(FREE_MODELS.length).toBeGreaterThan(100);
    expect(FREE_MODEL_IDS.size).toBe(FREE_MODELS.length);
    expect(FREE_MODELS.every((model) => model.cost === 0)).toBe(true);
    expect(FREE_MODELS.every((model) => model.envKeys.length > 0)).toBe(true);
    expect(FREE_MODELS.every((model) => model.fullId.startsWith(`${model.provider}/`))).toBe(true);
    // OpenCode Zen providers are deliberately excluded.
    expect(FREE_MODELS.some((model) => model.provider === 'opencode')).toBe(false);
    expect(FREE_MODELS.some((model) => model.provider === 'opencode-go')).toBe(false);
  });

  it('includes the normal DeepSeek V4.1 Flash free models and Vercel keyless free models', () => {
    for (const id of [
      DEFAULT_FREE_MODEL,
      'vercel/poolside/laguna-s-2.1-free',
      'vercel/nvidia/nemotron-3.5-lightning-free',
      'amd/DeepSeek-V4.1-Flash',
      'nvidia/deepseek-ai/deepseek-v4.1-flash',
      'openrouter/openrouter/free',
      'openrouter/google/gemma-4-31b-it:free',
    ]) {
      expect(isFreeModel(id)).toBe(true);
    }
    expect(DEFAULT_FREE_MODEL).toBe('vercel/reflection/beam-free');
    expect(FREE_MODELS.filter((model) => model.keylessOnVercel).length).toBeGreaterThan(0);
  });

  it('defaults to a keyless-on-Vercel normal free model', () => {
    const cfg = readServerEnv({ VERCEL_OIDC_TOKEN: 'oidc-token' });
    expect(cfg.openCodeModel).toBe(DEFAULT_FREE_MODEL);
    expect(cfg.keylessOnVercel).toBe(true);
    expect(cfg.modelKeyConfigured).toBe(true);
    expect(cfg.missingModelEnvKeys).toEqual([]);
    expect(cfg.disableZenFreeModels).toBe(true);
    const status = configStatus({ VERCEL_OIDC_TOKEN: 'oidc-token' });
    expect(status.openCodeConfigured).toBe(true);
    expect(status.catalog).toBe('normal');
    expect(status.vercelOidcConfigured).toBe(true);
    expect(JSON.stringify(status)).not.toContain('oidc-token');
  });

  it('reports the exact missing credential for a key-requiring free model', () => {
    const status = configStatus({ OPENCODE_MODEL: 'amd/DeepSeek-V4.1-Flash' });
    expect(status.openCodeConfigured).toBe(false);
    expect(status.missingModelEnvKeys).toEqual(['AMD_API_KEY']);
    expect(status.setupMessage).toContain('AMD_API_KEY');
    expect(missingEnvKeysFor('amd/DeepSeek-V4.1-Flash', { AMD_API_KEY: 'free-key' })).toEqual([]);
  });

  it('ignores an old Zen OPENCODE_MODEL instead of silently using Zen', () => {
    const cfg = readServerEnv({ OPENCODE_MODEL: 'opencode/deepseek-v4.1-flash-free' });
    expect(cfg.openCodeModel).toBe(DEFAULT_FREE_MODEL);
  });

  it('requires a key for non-catalog models', () => {
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
  it('accepts normal free models and the configured model', () => {
    expect(validateModel(DEFAULT_FREE_MODEL, DEFAULT_FREE_MODEL)).toBe(DEFAULT_FREE_MODEL);
    expect(validateModel('amd/DeepSeek-V4.1-Flash', DEFAULT_FREE_MODEL)).toBe('amd/DeepSeek-V4.1-Flash');
    expect(validateModel(undefined, 'anthropic/claude-sonnet-4-5')).toBe('anthropic/claude-sonnet-4-5');
  });

  it('rejects arbitrary, oversized or Zen browser-supplied models', () => {
    expect(() => validateModel('evil/model --help', DEFAULT_FREE_MODEL)).toThrow();
    expect(() => validateModel('anthropic/claude-sonnet-4-5', DEFAULT_FREE_MODEL)).toThrow();
    expect(() => validateModel('x'.repeat(200), DEFAULT_FREE_MODEL)).toThrow();
    expect(() => validateModel('opencode/deepseek-v4.1-flash-free', DEFAULT_FREE_MODEL)).toThrow(/Zen/);
    expect(() => validateModel('opencode-go/beam-free', DEFAULT_FREE_MODEL)).toThrow(/Zen/);
  });
});
