/**
 * Official OpenCode Zen free-model catalog.
 * Derived from the official source of truth: https://opencode.ai/zen/v1/models and
 * anomalyco/opencode dev packages/core/src/models-dev/snapshot.txt (models.dev catalog).
 * Only zero-input/zero-output-cost models under the `opencode` provider are included.
 * Model IDs are used verbatim as `opencode/<id>` with the real CLI; no source code is copied.
 * Free models work signed-out (no API key) per packages/core/src/model.ts PREFERRED_FREE.
 * This file contains no credentials.
 */

export type FreeModel = {
  id: string;
  fullId: string;
  name: string;
  context: number;
  output: number;
  requiresKey: false;
  preferred: boolean;
};

export const DEFAULT_FREE_MODEL = 'opencode/deepseek-v4.1-flash-free';

export const FREE_MODELS: FreeModel[] = [
  {
    id: "big-pickle",
    fullId: "opencode/big-pickle",
    name: "Big Pickle",
    context: 200000,
    output: 32000,
    requiresKey: false,
    preferred: true,
  },
  {
    id: "deepseek-v4.1-flash-free",
    fullId: "opencode/deepseek-v4.1-flash-free",
    name: "DeepSeek V4.1 Flash Free",
    context: 200000,
    output: 32000,
    requiresKey: false,
    preferred: true,
  },
  {
    id: "glm-5.3-flash-free",
    fullId: "opencode/glm-5.3-flash-free",
    name: "GLM-5.3-Flash Free",
    context: 200000,
    output: 32000,
    requiresKey: false,
    preferred: true,
  },
  {
    id: "muse-spark-1.3-contributor-free",
    fullId: "opencode/muse-spark-1.3-contributor-free",
    name: "Muse Spark 1.3 Free",
    context: 1048576,
    output: 131072,
    requiresKey: false,
    preferred: true,
  },
  {
    id: "beam-free",
    fullId: "opencode/beam-free",
    name: "Beam Free",
    context: 1048576,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "cat-jam-free",
    fullId: "opencode/cat-jam-free",
    name: "Cat Jam Free",
    context: 1048576,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "deepseek-v4-flash-free",
    fullId: "opencode/deepseek-v4-flash-free",
    name: "DeepSeek V4 Flash Free",
    context: 200000,
    output: 128000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "exo-free",
    fullId: "opencode/exo-free",
    name: "Exo Free",
    context: 1048576,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "fledge-alpha-free",
    fullId: "opencode/fledge-alpha-free",
    name: "Fledge Alpha Free",
    context: 1048576,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "flint-40b-free",
    fullId: "opencode/flint-40b-free",
    name: "Flint 40B Free",
    context: 262144,
    output: 65536,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "glm-4.7-free",
    fullId: "opencode/glm-4.7-free",
    name: "GLM-4.7 Free",
    context: 204800,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "glm-5-free",
    fullId: "opencode/glm-5-free",
    name: "GLM-5 Free",
    context: 204800,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "grok-code",
    fullId: "opencode/grok-code",
    name: "Grok Code Fast 1",
    context: 256000,
    output: 256000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "hy3-free",
    fullId: "opencode/hy3-free",
    name: "Hy3 Free",
    context: 190000,
    output: 64000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "hy3-preview-free",
    fullId: "opencode/hy3-preview-free",
    name: "Hy3 preview Free",
    context: 256000,
    output: 64000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "jev-1.13-free",
    fullId: "opencode/jev-1.13-free",
    name: "Jev 1.13 Free",
    context: 64000,
    output: 0,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "kimi-k2.5-free",
    fullId: "opencode/kimi-k2.5-free",
    name: "Kimi K2.5 Free",
    context: 262144,
    output: 262144,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "laguna-s-2.1-free",
    fullId: "opencode/laguna-s-2.1-free",
    name: "Laguna S 2.1 Free",
    context: 256000,
    output: 32000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "ling-2.6-flash-free",
    fullId: "opencode/ling-2.6-flash-free",
    name: "Ling 2.6 Flash Free",
    context: 262100,
    output: 32800,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "ling-3.0-flash-fin-free",
    fullId: "opencode/ling-3.0-flash-fin-free",
    name: "Ling 3.0 Flash Fin Free",
    context: 262144,
    output: 32768,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "ling-3.1-flash-free",
    fullId: "opencode/ling-3.1-flash-free",
    name: "Ling 3.1 Flash Free",
    context: 262144,
    output: 32768,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "ling-3.0-flash-free",
    fullId: "opencode/ling-3.0-flash-free",
    name: "Ling-3.0-flash Free",
    context: 262144,
    output: 32768,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "ling-3.0-tiny-free",
    fullId: "opencode/ling-3.0-tiny-free",
    name: "Ling-3.0-tiny Free",
    context: 262144,
    output: 32768,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "ll-alpha-free",
    fullId: "opencode/ll-alpha-free",
    name: "LL Alpha Free",
    context: 262144,
    output: 65536,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "longcat-2.5-preview-free",
    fullId: "opencode/longcat-2.5-preview-free",
    name: "LongCat 2.5 Preview Free",
    context: 1000000,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "longcat-2.0-free",
    fullId: "opencode/longcat-2.0-free",
    name: "LongCat-2.0 Free",
    context: 1000000,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "mimo-v2-flash-free",
    fullId: "opencode/mimo-v2-flash-free",
    name: "MiMo V2 Flash Free",
    context: 262144,
    output: 65536,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "mimo-v2-omni-free",
    fullId: "opencode/mimo-v2-omni-free",
    name: "MiMo V2 Omni Free",
    context: 262144,
    output: 64000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "mimo-v2-pro-free",
    fullId: "opencode/mimo-v2-pro-free",
    name: "MiMo V2 Pro Free",
    context: 1048576,
    output: 64000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "mimo-v2.5-free",
    fullId: "opencode/mimo-v2.5-free",
    name: "MiMo V2.5 Free",
    context: 200000,
    output: 32000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "mimo-v2.6-flash-free",
    fullId: "opencode/mimo-v2.6-flash-free",
    name: "MiMo-V2.6-Flash Free",
    context: 200000,
    output: 32000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "minimax-m3.1-flash-free",
    fullId: "opencode/minimax-m3.1-flash-free",
    name: "MiniMax M3.1 Flash Free",
    context: 1000000,
    output: 512000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "minimax-m2.1-free",
    fullId: "opencode/minimax-m2.1-free",
    name: "MiniMax-M2.1 Free",
    context: 204800,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "minimax-m2.5-free",
    fullId: "opencode/minimax-m2.5-free",
    name: "MiniMax-M2.5 Free",
    context: 204800,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "minimax-m3-free",
    fullId: "opencode/minimax-m3-free",
    name: "MiniMax-M3 Free",
    context: 200000,
    output: 32000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "muse-spark-1.2-contributor-free",
    fullId: "opencode/muse-spark-1.2-contributor-free",
    name: "Muse Spark 1.2 Free",
    context: 1048576,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "nemotron-3-super-free",
    fullId: "opencode/nemotron-3-super-free",
    name: "Nemotron 3 Super Free",
    context: 204800,
    output: 128000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "nemotron-3-ultra-free",
    fullId: "opencode/nemotron-3-ultra-free",
    name: "Nemotron 3 Ultra Free",
    context: 1000000,
    output: 128000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "nemotron-3.5-lightning-free",
    fullId: "opencode/nemotron-3.5-lightning-free",
    name: "Nemotron 3.5 Lightning Free",
    context: 262144,
    output: 262144,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "nemotron-3.5-super-vl-free",
    fullId: "opencode/nemotron-3.5-super-vl-free",
    name: "Nemotron 3.5 Super VL Free",
    context: 1048576,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "north-mini-code-free",
    fullId: "opencode/north-mini-code-free",
    name: "North Mini Code Free",
    context: 256000,
    output: 64000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "x-preview-f-free",
    fullId: "opencode/x-preview-f-free",
    name: "Ox Alpha Free (Unlimited)",
    context: 1000000,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "qwen3.6-plus-free",
    fullId: "opencode/qwen3.6-plus-free",
    name: "Qwen3.6 Plus Free",
    context: 262144,
    output: 65536,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "ring-2.6-1t-free",
    fullId: "opencode/ring-2.6-1t-free",
    name: "Ring 2.6 1T Free",
    context: 262000,
    output: 66000,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "space-bunny-free",
    fullId: "opencode/space-bunny-free",
    name: "Space Bunny Free",
    context: 1048576,
    output: 524288,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "step-5-preview-free",
    fullId: "opencode/step-5-preview-free",
    name: "Step 5 Preview Free",
    context: 1000000,
    output: 65536,
    requiresKey: false,
    preferred: false,
  },
  {
    id: "trinity-large-preview-free",
    fullId: "opencode/trinity-large-preview-free",
    name: "Trinity Large Preview",
    context: 131072,
    output: 131072,
    requiresKey: false,
    preferred: false,
  },
];

export const FREE_MODEL_IDS = new Set(FREE_MODELS.map((model) => model.fullId));

/** From packages/core/src/model.ts (signed-out free tier). */
export const PREFERRED_FREE_IDS = [
  'big-pickle',
  'deepseek-v4.1-flash-free',
  'glm-5.3-flash-free',
  'muse-spark-1.3-contributor-free',
] as const;

export function isFreeOpenCodeModel(model: string): boolean {
  return FREE_MODEL_IDS.has(model);
}

/**
 * Reject arbitrary model strings so a browser value cannot steer the CLI to a
 * different provider. Official free `opencode/*` ids are accepted even when
 * they are newer than the bundled snapshot — the live official catalog is the
 * source of truth, and a retired id returns a real `provider.no-route` error
 * from the CLI rather than a silent switch to another model.
 */
export function validateModel(model: unknown, configured: string): string {
  if (typeof model !== 'string' || model.length === 0) return configured;
  if (model.length > 120) throw new Error('model id is too long');
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,119}$/.test(model)) throw new Error('model id contains unsafe characters');
  if (isFreeOpenCodeModel(model)) return model;
  if (model.startsWith('opencode/') && model.length > 'opencode/'.length) return model;
  if (model === configured) return model;
  throw new Error('model is not an official free OpenCode model or the configured model');
}

