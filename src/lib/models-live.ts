/**
 * Live official free-model catalog.
 *
 * The bundled snapshot in `models.ts` can drift: OpenCode retires free model
 * ids and adds new ones. This module reads the official catalog at request
 * time so the UI only offers models that actually exist right now, and falls
 * back to the vetted snapshot if the official endpoint is unreachable.
 * No credentials are used or stored.
 */

import { DEFAULT_FREE_MODEL, FREE_MODELS, PREFERRED_FREE_IDS, type FreeModel } from './models';

export const LIVE_CATALOG_URL = 'https://opencode.ai/zen/v1/models';

export type LiveCatalog = {
  models: FreeModel[];
  source: 'live' | 'snapshot';
  fetchedAt: string;
  note: string | null;
};

type LiveModel = {
  id?: unknown;
  name?: unknown;
  type?: unknown;
  limit?: { context?: unknown; output?: unknown };
  cost?: { text?: { input?: { price?: unknown }; output?: { price?: unknown } } };
};

function asCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

function preferredRank(id: string): number {
  const index = PREFERRED_FREE_IDS.indexOf(id as (typeof PREFERRED_FREE_IDS)[number]);
  return index === -1 ? PREFERRED_FREE_IDS.length : index;
}

/** Fetch, filter and sort zero-cost chat models from the official catalog. */
export async function getFreeModels(): Promise<LiveCatalog> {
  const fetchedAt = new Date().toISOString();
  try {
    const response = await fetch(LIVE_CATALOG_URL, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(8_000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`official catalog returned HTTP ${response.status}`);
    const payload = (await response.json()) as { data?: unknown };
    if (!Array.isArray(payload.data)) throw new Error('official catalog has no model list');
    const models: FreeModel[] = [];
    for (const entry of payload.data as LiveModel[]) {
      if (!entry || typeof entry !== 'object' || entry.type !== 'chat') continue;
      const id = typeof entry.id === 'string' ? entry.id : '';
      if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(id)) continue;
      const inputPrice = entry.cost?.text?.input?.price;
      const outputPrice = entry.cost?.text?.output?.price;
      if (inputPrice !== 0 || outputPrice !== 0) continue;
      models.push({
        id,
        fullId: `opencode/${id}`,
        name: typeof entry.name === 'string' ? entry.name.slice(0, 120) : id,
        context: asCount(entry.limit?.context),
        output: asCount(entry.limit?.output),
        requiresKey: false,
        preferred: preferredRank(id) < PREFERRED_FREE_IDS.length,
      });
    }
    if (models.length === 0) throw new Error('official catalog listed no zero-cost chat models');
    models.sort((a, b) => preferredRank(a.id) - preferredRank(b.id) || a.name.localeCompare(b.name));
    return {
      models,
      source: 'live',
      fetchedAt,
      note: 'Zero-cost chat models from the live official OpenCode Zen catalog.',
    };
  } catch (error) {
    return {
      models: FREE_MODELS,
      source: 'snapshot',
      fetchedAt,
      note: `Live official catalog unavailable (${String(error).slice(0, 160)}); showing the vetted bundled snapshot, which may contain retired ids.`,
    };
  }
}

export const FALLBACK_DEFAULT = DEFAULT_FREE_MODEL;
