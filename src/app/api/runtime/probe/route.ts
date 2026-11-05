import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/http';
import { probeOpenCode } from '@/lib/runtime';
import { requireRouteUser } from '@/lib/route-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Real, minimal proof of concept: this Vercel Function spawns the actual
 * OpenCode binary inside a fresh /tmp workspace and reads `opencode --version`.
 * No mock, no echo, no model call. If Vercel cannot run the binary this returns
 * a clear error instead of pretending success.
 */
async function handle(request: NextRequest) {
  try {
    const { applyCookies } = await requireRouteUser(request);
    return applyCookies(jsonOk(await probeOpenCode()));
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
