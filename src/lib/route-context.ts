import type { NextRequest } from 'next/server';
import { requireUser, type AuthClient } from './auth';
import { createRouteSupabase } from './supabase/server';

/** Verified user for a Route Handler. The user id never comes from the request body. */
export async function requireRouteUser(request: NextRequest) {
  const context = createRouteSupabase(request);
  const user = await requireUser(context.supabase as unknown as AuthClient);
  return { ...context, user };
}
