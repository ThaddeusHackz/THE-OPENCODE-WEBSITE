import type { User } from '@supabase/supabase-js';
import { AppError } from './errors';

export type AuthClient = {
  auth: {
    getUser(): Promise<{ data: { user: User | null }; error: unknown }>;
  };
};

/**
 * Resolve the signed-in user from the verified Supabase session. A user id from
 * a request body is never accepted; every caller must use this value.
 */
export async function requireUser(supabase: AuthClient): Promise<User> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Sign in with GitHub to continue.');
  }
  return data.user;
}

/** Reject any attempt to supply a different user id. */
export function assertOwnership(userId: string, claimedUserId?: string | null): void {
  if (claimedUserId && claimedUserId !== userId) {
    throw new AppError(403, 'OWNERSHIP_VIOLATION', 'You may only access your own data.');
  }
}

export function githubLoginFromUser(user: User): string | null {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const candidates = [meta.user_name, meta.preferred_username, meta.login];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && /^[A-Za-z0-9-]{1,39}$/.test(candidate)) return candidate;
  }
  return null;
}
