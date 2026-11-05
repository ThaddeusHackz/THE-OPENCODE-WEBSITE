import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabase/server';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { supabase, applyCookies } = createRouteSupabase(request);
    await supabase.auth.signOut();
    return applyCookies(NextResponse.redirect(new URL('/', new URL(request.url).origin)));
  } catch (error) {
    return jsonError(error);
  }
}
