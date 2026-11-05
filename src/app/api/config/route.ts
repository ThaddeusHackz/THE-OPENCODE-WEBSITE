import { NextRequest } from 'next/server';
import { configStatus } from '@/lib/env';
import { jsonOk } from '@/lib/http';
import { serverEnvWithOidc } from '@/lib/runtime/credentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public, non-secret configuration status. Used to show setup messages.
 * Vercel's OIDC token arrives per request as a header, so status is computed
 * against the request-scoped env rather than process.env alone.
 */
export async function GET(request: NextRequest) {
  return jsonOk(configStatus(serverEnvWithOidc(request)));
}
