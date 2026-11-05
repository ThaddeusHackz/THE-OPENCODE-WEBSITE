import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabase/server';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  try {
    const { supabase, applyCookies } = createRouteSupabase(request);
    const code = url.searchParams.get('code');
    if (!code) return applyCookies(NextResponse.redirect(new URL('/?error=missing-code', url.origin)));
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return applyCookies(NextResponse.redirect(new URL('/?error=auth-failed', url.origin)));
    return applyCookies(NextResponse.redirect(new URL('/', url.origin)));
  } catch (error) {
    return jsonError(error);
  }
}
