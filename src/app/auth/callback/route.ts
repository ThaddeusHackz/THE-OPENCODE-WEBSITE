import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabase/server';
import { jsonError } from '@/lib/http';
import { sanitizeNextPath } from '@/lib/winfy/catalog';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const nextPath = sanitizeNextPath(request.cookies.get('oc_auth_next')?.value);
  const clearNext = (response: NextResponse) => {
    response.cookies.set('oc_auth_next', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
    return response;
  };
  try {
    const { supabase, applyCookies } = createRouteSupabase(request);
    const code = url.searchParams.get('code');
    if (!code) {
      const target = new URL(nextPath, url.origin);
      target.searchParams.set('error', 'missing-code');
      return clearNext(applyCookies(NextResponse.redirect(target)));
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const target = new URL(nextPath, url.origin);
      target.searchParams.set('error', 'auth-failed');
      return clearNext(applyCookies(NextResponse.redirect(target)));
    }
    return clearNext(applyCookies(NextResponse.redirect(new URL(nextPath, url.origin))));
  } catch (error) {
    return jsonError(error);
  }
}
