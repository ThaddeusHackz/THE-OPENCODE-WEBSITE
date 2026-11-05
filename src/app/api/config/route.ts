import { NextRequest } from 'next/server';
import { configStatus } from '@/lib/env';
import { jsonOk } from '@/lib/http';
import { serverEnvWithOidc } from '@/lib/runtime/credentials';
import { getGithubOauthStatus } from '@/lib/supabase/oauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public, non-secret configuration status. Used to show setup messages.
 * Vercel's OIDC token arrives per request as a header, so status is computed
 * against the request-scoped env rather than process.env alone.
 *
 * The GitHub OAuth part is a real server-side check of the Supabase project:
 * if no provider is enabled the UI must not present a working sign-in button.
 */
export async function GET(request: NextRequest) {
  const oauth = await getGithubOauthStatus();
  return jsonOk({ ...configStatus(serverEnvWithOidc(request)), ...oauth });
}
