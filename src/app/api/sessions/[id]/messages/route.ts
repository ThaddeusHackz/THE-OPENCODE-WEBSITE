import { NextRequest } from 'next/server';
import { requireRouteUser } from '@/lib/route-context';
import { getSession, listMessages } from '@/lib/data';
import { AppError } from '@/lib/errors';
import { jsonError, jsonOk } from '@/lib/http';
import { validateSessionId } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user, applyCookies } = await requireRouteUser(request);
    const { id } = await context.params;
    const sessionId = validateSessionId(id);
    const session = await getSession(supabase as any, user.id, sessionId);
    if (!session) throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found.');
    const messages = await listMessages(supabase as any, user.id, sessionId);
    return applyCookies(jsonOk({ messages }));
  } catch (error) {
    return jsonError(error);
  }
}
