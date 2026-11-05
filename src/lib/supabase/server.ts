import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import { readServerEnv } from '../env';
import { AppError } from '../errors';

type PendingCookie = { name: string; value: string; options: Record<string, unknown> };

/** Cookie-based Supabase client for Route Handlers. Session stays server-verified. */
export function createRouteSupabase(request: NextRequest) {
  const cfg = readServerEnv();
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    throw new AppError(
      503,
      'SUPABASE_NOT_CONFIGURED',
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  const pending: PendingCookie[] = [];
  const supabase = createServerClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          pending.push({
            name: cookie.name,
            value: cookie.value,
            options: cookie.options as Record<string, unknown>,
          });
        }
      },
    },
  });
  return {
    supabase,
    applyCookies<T extends NextResponse>(response: T): T {
      for (const cookie of pending) {
        response.cookies.set(cookie.name, cookie.value, cookie.options as any);
      }
      return response;
    },
  };
}
