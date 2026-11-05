import { NextRequest } from 'next/server';
import { requireRouteUser } from '@/lib/route-context';
import { assertOwnership } from '@/lib/auth';
import { createSession, listSessions } from '@/lib/data';
import { AppError } from '@/lib/errors';
import { jsonError, jsonOk } from '@/lib/http';
import { validateRef, validateRepoFullName } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { supabase, user, applyCookies } = await requireRouteUser(request);
    const sessions = await listSessions(supabase as any, user.id);
    return applyCookies(jsonOk({ sessions }));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user, applyCookies } = await requireRouteUser(request);
    const body = (await request.json()) as Record<string, unknown>;
    assertOwnership(user.id, typeof body.userId === 'string' ? body.userId : null);
    const repoFullName = validateRepoFullName(body.repoFullName);
    const ref = validateRef(body.ref);
    const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 120) : repoFullName;
    const session = await createSession(supabase as any, user.id, { title, repoFullName, ref });
    return applyCookies(jsonOk({ session }, 201));
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError(new AppError(400, 'INVALID_JSON', 'Request body must be JSON.'));
    return jsonError(error);
  }
}
