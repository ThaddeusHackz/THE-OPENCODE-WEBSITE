import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors';
import { jsonError } from '@/lib/http';
import { sanitizeNextPath } from '@/lib/winfy/catalog';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { supabase, applyCookies } = createRouteSupabase(request);
    const url = new URL(request.url);
    const origin = url.origin;
    let nextPath = '/';
    try {
      const contentType = request.headers.get('content-type') ?? '';
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const form = await request.formData();
        const rawNext = form.get('next');
        if (typeof rawNext === 'string') nextPath = sanitizeNextPath(rawNext);
      }
    } catch {
      nextPath = '/';
    }
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
    const response = NextResponse.redirect(data.url);
    if (nextPath !== '/') {
      response.cookies.set('oc_auth_next', nextPath, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 600,
        secure: url.protocol === 'https:',
      });
    }
    return applyCookies(response);
  } catch (error) {
    return jsonError(error);
  }
}
