import { configStatus } from '@/lib/env';
import { jsonOk } from '@/lib/http';
import { getFreeModels, LIVE_CATALOG_URL } from '@/lib/models-live';
import { DEFAULT_FREE_MODEL } from '@/lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public catalog of official OpenCode Zen free models (no credentials needed).
 * Reads the live official catalog so retired model ids disappear; falls back to
 * the vetted snapshot when that endpoint is unreachable.
 */
export async function GET() {
  const status = configStatus();
  const catalog = await getFreeModels();
  return jsonOk({
    models: catalog.models,
    count: catalog.models.length,
    source: catalog.source,
    sourceUrl: LIVE_CATALOG_URL,
    fetchedAt: catalog.fetchedAt,
    note: catalog.note,
    defaultModel: DEFAULT_FREE_MODEL,
    configuredModel: status.model,
    freeModel: status.freeModel,
    modelTestsEnabled: status.modelTestsEnabled,
  });
}
