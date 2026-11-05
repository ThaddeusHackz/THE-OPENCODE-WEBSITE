import { describe, expect, it } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { assertOwnership, githubLoginFromUser, requireUser, type AuthClient } from '../src/lib/auth';
import { AppError } from '../src/lib/errors';

function fakeUser(metadata: Record<string, unknown> = {}): User {
  return { id: 'user-1', user_metadata: metadata } as unknown as User;
}

function client(user: User | null, error: unknown = null): AuthClient {
  return { auth: { getUser: async () => ({ data: { user }, error }) } };
}

describe('authentication', () => {
  it('returns the verified user', async () => {
    const user = fakeUser({ user_name: 'octocat' });
    await expect(requireUser(client(user))).resolves.toBe(user);
  });

  it('rejects an anonymous session with 401', async () => {
    await expect(requireUser(client(null))).rejects.toMatchObject({ status: 401, code: 'AUTH_REQUIRED' });
  });

  it('rejects a session lookup error with 401', async () => {
    await expect(requireUser(client(null, new Error('bad token')))).rejects.toBeInstanceOf(AppError);
  });

  it('derives a GitHub login from Supabase metadata only', () => {
    expect(githubLoginFromUser(fakeUser({ user_name: 'octocat' }))).toBe('octocat');
    expect(githubLoginFromUser(fakeUser({ preferred_username: 'hubot' }))).toBe('hubot');
    expect(githubLoginFromUser(fakeUser({ user_name: 'not a login!' }))).toBeNull();
  });
});

describe('ownership', () => {
  it('accepts no claimed user id or a matching id', () => {
    expect(() => assertOwnership('user-1')).not.toThrow();
    expect(() => assertOwnership('user-1', 'user-1')).not.toThrow();
  });

  it('rejects a user id supplied by the browser that differs from the session', () => {
    expect(() => assertOwnership('user-1', 'user-2')).toThrowError(
      expect.objectContaining({ status: 403, code: 'OWNERSHIP_VIOLATION' }),
    );
  });
});
