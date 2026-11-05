-- OpenCode website: user-owned session metadata and messages.
-- RLS + server-side .eq('user_id', auth user id) both enforce ownership.

create extension if not exists pgcrypto;

create table if not exists public.agent_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'New session',
  repo_full_name text not null,
  repo_ref text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.agent_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agent_sessions_user_updated_idx
  on public.agent_sessions (user_id, updated_at desc);
create index if not exists agent_messages_session_created_idx
  on public.agent_messages (session_id, created_at);
create index if not exists agent_messages_user_idx
  on public.agent_messages (user_id);

alter table public.agent_sessions enable row level security;
alter table public.agent_messages enable row level security;

create policy "agent_sessions_select_own"
  on public.agent_sessions for select
  using (auth.uid() = user_id);
create policy "agent_sessions_insert_own"
  on public.agent_sessions for insert
  with check (auth.uid() = user_id);
create policy "agent_sessions_update_own"
  on public.agent_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "agent_sessions_delete_own"
  on public.agent_sessions for delete
  using (auth.uid() = user_id);

create policy "agent_messages_select_own"
  on public.agent_messages for select
  using (auth.uid() = user_id);
create policy "agent_messages_insert_own"
  on public.agent_messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.agent_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
create policy "agent_messages_update_own"
  on public.agent_messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "agent_messages_delete_own"
  on public.agent_messages for delete
  using (auth.uid() = user_id);

create or replace function public.touch_agent_session()
returns trigger
language plpgsql
as $$
begin
  update public.agent_sessions
     set updated_at = now()
   where id = new.session_id;
  return new;
end;
$$;

drop trigger if exists agent_messages_touch_session on public.agent_messages;
create trigger agent_messages_touch_session
  after insert on public.agent_messages
  for each row execute function public.touch_agent_session();
