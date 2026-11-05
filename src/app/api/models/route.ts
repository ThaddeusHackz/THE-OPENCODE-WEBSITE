import { NextRequest } from 'next/server';
import { configStatus } from '@/lib/env';
import { jsonOk } from '@/lib/http';
import { DEFAULT_FREE_MODEL, FREE_MODELS } from '@/lib/models';
import { hasVercelOidc, serverEnvWithOidc } from '@/lib/runtime/credentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public catalog of NORMAL free models from OpenCode's own official model
 * catalog (models.dev), excluding the OpenCode Zen promotional free tier.
 * No credentials are returned — only env var NAMES per model.
 */
export async function GET(request: NextRequest) {
  const status = configStatus(serverEnvWithOidc(request));
  return jsonOk({
    models: FREE_MODELS,
    count: FREE_MODELS.length,
    providers: new Set(FREE_MODELS.map((model) => model.provider)).size,
    keylessOnVercel: FREE_MODELS.filter((model) => model.keylessOnVercel).length,
    catalog: 'normal',
    source: 'OpenCode dev packages/core/src/models-dev/snapshot.txt (models.dev)',
    sourceUrl: 'https://github.com/anomalyco/opencode/blob/dev/packages/core/src/models-dev/snapshot.txt',
    note: 'Zero-cost, tool-capable chat models from ordinary providers. Zen (opencode/*) models are excluded.',
    defaultModel: DEFAULT_FREE_MODEL,
    configuredModel: status.model,
    freeModel: status.freeModel,
    modelEnvKeys: status.modelEnvKeys,
    missingModelEnvKeys: status.missingModelEnvKeys,
    modelKeyConfigured: status.modelKeyConfigured,
    vercelOidcConfigured: status.vercelOidcConfigured,
    oidcTokenPresent: hasVercelOidc(request),
    disableZenFreeModels: status.disableZenFreeModels,
    modelTestsEnabled: status.modelTestsEnabled,
  });
}
