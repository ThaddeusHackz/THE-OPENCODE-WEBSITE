import { AppError } from './errors';
import { validateSessionId } from './validation';

/** Minimal structural type so data access stays unit-testable without a live DB. */
export type DataClient = { from(table: string): any };

export type AgentSession = {
  id: string;
  user_id: string;
  title: string;
  repo_full_name: string;
  repo_ref: string;
  created_at: string;
  updated_at: string;
};

export type AgentMessage = {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

function unwrap<T>(result: { data: T | null; error: unknown }, fallback: T): T {
  if (result.error) {
    throw new AppError(500, 'DATABASE_ERROR', 'Database request failed.');
  }
  return (result.data ?? fallback) as T;
}

export async function listSessions(db: DataClient, userId: string): Promise<AgentSession[]> {
  const result = await db
    .from('agent_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50);
  return unwrap(result, []);
}

export async function getSession(db: DataClient, userId: string, sessionId: string): Promise<AgentSession | null> {
  validateSessionId(sessionId);
  const result = await db
    .from('agent_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();
  return unwrap(result, null);
}

/** Ownership is enforced here as well as by RLS: user_id always comes from the server. */
export async function createSession(
  db: DataClient,
  userId: string,
  input: { title: string; repoFullName: string; ref: string },
): Promise<AgentSession> {
  const result = await db
    .from('agent_sessions')
    .insert({ user_id: userId, title: input.title, repo_full_name: input.repoFullName, repo_ref: input.ref })
    .select()
    .single();
  const row = unwrap<AgentSession | null>(result, null);
  if (!row) throw new AppError(500, 'DATABASE_ERROR', 'Could not create session.');
  return row;
}

export async function listMessages(db: DataClient, userId: string, sessionId: string): Promise<AgentMessage[]> {
  validateSessionId(sessionId);
  const result = await db
    .from('agent_messages')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(200);
  return unwrap(result, []);
}

export async function insertMessage(
  db: DataClient,
  userId: string,
  input: { sessionId: string; role: AgentMessage['role']; content: string; metadata?: Record<string, unknown> },
): Promise<AgentMessage> {
  const result = await db
    .from('agent_messages')
    .insert({
      session_id: input.sessionId,
      user_id: userId,
      role: input.role,
      content: input.content,
      metadata: input.metadata ?? {},
    })
    .select()
    .single();
  const row = unwrap<AgentMessage | null>(result, null);
  if (!row) throw new AppError(500, 'DATABASE_ERROR', 'Could not save message.');
  return row;
}
