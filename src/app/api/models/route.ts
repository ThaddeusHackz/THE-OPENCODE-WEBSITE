import { configStatus } from '@/lib/env';
import { jsonOk } from '@/lib/http';
import { DEFAULT_FREE_MODEL, FREE_MODELS } from '@/lib/models';

export const runtime = 'nodejs';

/** Public catalog of official OpenCode Zen free models (no credentials needed). */
export async function GET() {
  const status = configStatus();
  return jsonOk({
    models: FREE_MODELS,
    count: FREE_MODELS.length,
    defaultModel: DEFAULT_FREE_MODEL,
    configuredModel: status.model,
    freeModel: status.freeModel,
    modelTestsEnabled: status.modelTestsEnabled,
    source: 'https://opencode.ai/zen/v1/models',
  });
}
