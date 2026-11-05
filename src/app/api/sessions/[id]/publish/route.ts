import { NextRequest } from 'next/server';
import { requireRouteUser } from '@/lib/route-context';
import { getSession } from '@/lib/data';
import { AppError } from '@/lib/errors';
import { jsonError } from '@/lib/http';
import { PUBLISH_CONFIRM_PHRASE, validateSessionId } from '@/lib/validation';

export const runtime = 'nodejs';

/**
 * Explicit-confirmation gate. This prototype deliberately NEVER writes back to
 * GitHub: no branch, commit or PR is created. The gate exists so that any future
 * write-back must be preceded by an explicit user confirmation and a diff review.
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireRouteUser(request);
    const { id } = await context.params;
    const sessionId = validateSessionId(id);
    const session = await getSession(supabase as any, user.id, sessionId);
    if (!session) throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found.');
    const body = (await request.json()) as Record<string, unknown>;
    if (body.confirm !== PUBLISH_CONFIRM_PHRASE) {
      throw new AppError(400, 'CONFIRMATION_REQUIRED', 'Review the proposed diff and provide the explicit confirmation phrase first.');
    }
    throw new AppError(
      501,
      'WRITE_BACK_NOT_IMPLEMENTED',
      'Write-back is intentionally disabled in this prototype. No branch, commit or pull request was created.',
    );
  } catch (error) {
    return jsonError(error);
  }
}
