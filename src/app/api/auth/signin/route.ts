import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { supabase, applyCookies } = createRouteSupabase(request);
    const origin = new URL(request.url).origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${origin}/auth/callback`,
        scopes: 'read:user user:email',
      },
    });
    if (error || !data?.url) {
      throw new AppError(502, 'GITHUB_SIGNIN_FAILED', 'Could not start GitHub sign-in. Check Supabase GitHub provider settings.');
    }
    return applyCookies(NextResponse.redirect(data.url));
  } catch (error) {
    return jsonError(error);
  }
}
