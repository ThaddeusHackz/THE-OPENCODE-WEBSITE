import { NextRequest } from 'next/server';
import { configStatus } from '@/lib/env';
import { AppError } from '@/lib/errors';
import { jsonError, jsonOk } from '@/lib/http';
import { validateModel } from '@/lib/models';
import { runOpenCodeSmokeTest } from '@/lib/runtime';
import { serverEnvWithOidc } from '@/lib/runtime/credentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Real verification of one NORMAL free model: spawns the actual OpenCode CLI
 * with `--standalone run` in a fresh /tmp workspace and a fixed tiny prompt.
 * Returns the real assistant text or the real error. Never a fake reply.
 * Gated by ENABLE_MODEL_TESTS=1 so it is not an open-ended anonymous endpoint.
 */
async function handle(request: NextRequest) {
  try {
    const runtimeEnv = serverEnvWithOidc(request);
    const status = configStatus(runtimeEnv);
    if (!status.modelTestsEnabled) {
      throw new AppError(403, 'MODEL_TESTS_DISABLED', 'Set ENABLE_MODEL_TESTS=1 to enable the free-model verification route.');
    }
    if (!status.openCodeConfigured) {
      throw new AppError(503, 'OPENCODE_NOT_CONFIGURED', status.setupMessage);
    }
    const requested =
      request.method === 'GET'
        ? new URL(request.url).searchParams.get('model')
        : ((await request.json()) as { model?: unknown }).model;
    let model: string;
    try {
      model = validateModel(requested, status.model);
    } catch (error) {
      throw new AppError(400, 'INVALID_MODEL', error instanceof Error ? error.message : 'Invalid model.');
    }
    const result = await runOpenCodeSmokeTest(model, { serverEnv: runtimeEnv });
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
