import { describe, expect, it } from 'vitest';
import { createSession, getSession, insertMessage, listMessages, listSessions, type DataClient } from '../src/lib/data';

type Call = { method: string; args: unknown[] };

function mockDb(result: unknown = { data: [], error: null }) {
  const calls: Call[] = [];
  const chain: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'order', 'limit', 'insert', 'single', 'maybeSingle', 'update']) {
    chain[method] = (...args: unknown[]) => {
      calls.push({ method, args });
      return chain;
    };
  }
  chain.then = (resolve: (value: unknown) => void, reject: (reason: unknown) => void) =>
    Promise.resolve(result).then(resolve, reject);
  const db: DataClient = {
    from: (table: string) => {
      calls.push({ method: 'from', args: [table] });
      return chain as any;
    },
  };
  return { db, calls };
}

describe('server-side ownership enforcement', () => {
  it('always scopes session listing to the verified user id', async () => {
    const { db, calls } = mockDb();
    await listSessions(db, 'user-1');
    expect(calls).toContainEqual({ method: 'eq', args: ['user_id', 'user-1'] });
  });

  it('scopes session reads by both id and owner', async () => {
    const { db, calls } = mockDb({ data: null, error: null });
    await getSession(db, 'user-1', '3f2504e0-4f89-11d3-9a0c-0305e82c3301');
    expect(calls).toContainEqual({ method: 'eq', args: ['id', '3f2504e0-4f89-11d3-9a0c-0305e82c3301'] });
    expect(calls).toContainEqual({ method: 'eq', args: ['user_id', 'user-1'] });
  });

  it('writes the server user id, never a browser-supplied one', async () => {
    const { db, calls } = mockDb({ data: { id: 'row-1' }, error: null });
    await createSession(db, 'user-1', { title: 't', repoFullName: 'o/r', ref: 'main' });
    const insert = calls.find((call) => call.method === 'insert');
    expect(insert?.args[0]).toMatchObject({ user_id: 'user-1' });

    await insertMessage(db, 'user-1', { sessionId: 's', role: 'user', content: 'hi' });
    const messageInsert = calls.filter((call) => call.method === 'insert').at(-1);
    expect((messageInsert?.args[0] as Record<string, unknown>).user_id).toBe('user-1');
  });

  it('scopes message reads to session and owner', async () => {
    const { db, calls } = mockDb();
    await listMessages(db, 'user-1', '3f2504e0-4f89-11d3-9a0c-0305e82c3301');
    expect(calls).toContainEqual({ method: 'eq', args: ['user_id', 'user-1'] });
    expect(calls).toContainEqual({ method: 'eq', args: ['session_id', '3f2504e0-4f89-11d3-9a0c-0305e82c3301'] });
  });
});
