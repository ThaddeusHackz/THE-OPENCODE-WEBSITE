import { NextRequest } from 'next/server';
import { createRouteSupabase } from '@/lib/supabase/server';
import { githubLoginFromUser, requireUser, type AuthClient } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { supabase, applyCookies } = createRouteSupabase(request);
    try {
      const user = await requireUser(supabase as unknown as AuthClient);
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      return applyCookies(
        jsonOk({
          user: {
            id: user.id,
            email: user.email ?? null,
            name: typeof meta.name === 'string' ? meta.name : null,
            avatarUrl: typeof meta.avatar_url === 'string' ? meta.avatar_url : null,
            githubLogin: githubLoginFromUser(user),
          },
        }),
      );
    } catch {
      return applyCookies(jsonOk({ user: null }));
    }
  } catch (error) {
    return jsonError(error);
  }
}
