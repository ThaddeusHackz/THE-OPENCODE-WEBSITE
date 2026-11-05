'use client';

import { useCallback, useEffect, useState } from 'react';

type MeResponse = {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
    githubLogin: string | null;
  } | null;
};

type ConfigStatus = {
  supabaseConfigured: boolean;
  githubAppConfigured: boolean;
  githubPatConfigured: boolean;
  githubMode: 'app' | 'pat' | 'none';
  openCodeConfigured: boolean;
  binaryPathProvided: boolean;
  model: string;
  freeModel: boolean;
  modelTestsEnabled: boolean;
  missing: string[];
  setupMessage: string;
};

type FreeModel = {
  id: string;
  fullId: string;
  name: string;
  context: number;
  output: number;
  requiresKey: false;
  preferred: boolean;
};

type ModelTestResult = {
  ok: boolean;
  model: string;
  text: string | null;
  error: string | null;
  exitCode: number | null;
  durationMs: number;
  timedOut: boolean;
};

type Repo = {
  full_name: string;
  name: string;
  owner: string;
  private: boolean;
  default_branch: string;
  description: string | null;
};

type Session = {
  id: string;
  title: string;
  repo_full_name: string;
  repo_ref: string;
  updated_at: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata: {
    patch?: string;
    changes?: Array<{ path: string; status: string }>;
    runtime?: string;
    durationMs?: number;
    workspace?: string;
    [key: string]: unknown;
  };
};

type ProbeResult = {
  available: boolean;
  runtimeId: string;
  binaryPath: string | null;
  versionOutput: string | null;
  error: string | null;
};

type RunResult = {
  ok: boolean;
  sessionId: string;
  result: {
    text: string | null;
    error: string | null;
    exitCode: number | null;
    durationMs: number;
    timedOut: boolean;
    patch: string;
    changes: Array<{ path: string; status: string }>;
    runtime: string;
    workspace: string;
  };
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(init?.headers as Record<string, string> | undefined) },
  });
  const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message ?? `Request failed (HTTP ${response.status})`);
  return data as T;
}

function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function App() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [ref, setRef] = useState('main');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);
  const [models, setModels] = useState<FreeModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('opencode/deepseek-v4.1-flash-free');
  const [modelTests, setModelTests] = useState<ModelTestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [testingAll, setTestingAll] = useState(false);

  const loadMessages = useCallback(async (id: string) => {
    const response = await api<{ messages: Message[] }>(`/api/sessions/${id}/messages`);
    setMessages(response.messages);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, configRes, modelsRes] = await Promise.all([
        api<MeResponse>('/api/me'),
        api<ConfigStatus>('/api/config'),
        api<{ models: FreeModel[]; configuredModel: string }>('/api/models'),
      ]);
      setMe(meRes);
      setConfig(configRes);
      setModels(modelsRes.models);
      setSelectedModel((current) => current || modelsRes.configuredModel || 'opencode/deepseek-v4.1-flash-free');
      if (!meRes.user) {
        setSessions([]);
        setRepos([]);
        return;
      }
      const sessionRes = await api<{ sessions: Session[] }>('/api/sessions').catch(() => ({ sessions: [] }));
      setSessions(sessionRes.sessions);
      const repoRes = await api<{ repos: Repo[] }>('/api/repos').catch((err: Error) => {
        setRepoError(err.message);
        return { repos: [] as Repo[] };
      });
      setRepos(repoRes.repos);
      if (repoRes.repos.length && !selectedRepo) {
        setSelectedRepo(repoRes.repos[0].full_name);
        setRef(repoRes.repos[0].default_branch || 'main');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the application.');
    } finally {
      setLoading(false);
    }
  }, [selectedRepo]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    void loadMessages(activeId).catch((err: Error) => setError(err.message));
  }, [activeId, loadMessages]);

  const selectRepo = (fullName: string) => {
    setSelectedRepo(fullName);
    const found = repos.find((item) => item.full_name === fullName);
    if (found) setRef(found.default_branch || 'main');
  };

  const newSession = async () => {
    setError(null);
    if (!selectedRepo) {
      setError('Select a repository first.');
      return;
    }
    try {
      const response = await api<{ session: Session }>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ repoFullName: selectedRepo, ref }),
      });
      setSessions((previous) => [response.session, ...previous]);
      setActiveId(response.session.id);
      setMessages([]);
      setNotice('New session created. A fresh temporary workspace will be made for your first request.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create session.');
    }
  };

  const send = async () => {
    setError(null);
    setNotice(null);
    if (!selectedRepo) {
      setError('Select a repository first.');
      return;
    }
    if (!prompt.trim()) {
      setError('Write a request first.');
      return;
    }
    setBusy(true);
    try {
      const response = await api<RunResult>('/api/agent/run', {
        method: 'POST',
        body: JSON.stringify({ sessionId: activeId, repoFullName: selectedRepo, ref, prompt, model: selectedModel }),
      });
      setActiveId(response.sessionId);
      await Promise.all([
        loadMessages(response.sessionId),
        api<{ sessions: Session[] }>('/api/sessions')
          .then((result) => setSessions(result.sessions))
          .catch(() => undefined),
      ]);
      setPrompt('');
      if (response.ok) {
        setNotice('Real OpenCode output saved. The temporary workspace was discarded — it is not a persistent cloud dev environment.');
      } else {
        setNotice(response.result.error ?? 'The real OpenCode runtime did not produce a reply.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Agent request failed.');
    } finally {
      setBusy(false);
    }
  };

  const checkRuntime = async () => {
    setProbing(true);
    setError(null);
    try {
      setProbe(await api<ProbeResult>('/api/runtime/probe', { method: 'POST' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Runtime probe failed.');
    } finally {
      setProbing(false);
    }
  };

  const testModel = async (model: string) => {
    setTesting(true);
    setError(null);
    try {
      const result = await api<ModelTestResult>(`/api/models/test?model=${encodeURIComponent(model)}`);
      setModelTests((previous) => [result, ...previous.filter((item) => item.model !== result.model)].slice(0, 47));
    } catch (err) {
      setModelTests((previous) => [
        {
          model,
          ok: false,
          text: null,
          error: err instanceof Error ? err.message : 'Model test failed',
          exitCode: null,
          durationMs: 0,
          timedOut: false,
        },
        ...previous,
      ].slice(0, 47));
    } finally {
      setTesting(false);
    }
  };

  const testAllModels = async () => {
    setTestingAll(true);
    setModelTests([]);
    for (const model of models) {
      await testModel(model.fullId);
    }
    setTestingAll(false);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="signin card">
          <span className="spinner" /> Loading…
        </div>
      </div>
    );
  }

  if (!me?.user) {
    return (
      <div className="app">
        <div className="topbar">
          <div className="brand">
            <h1>OpenCode Web</h1>
            <span className="tag">Vercel-first · ephemeral workspace prototype</span>
          </div>
        </div>
        <div className="signin card">
          <h2>Sign in with GitHub</h2>
          <p>
            Authentication is handled by Supabase Auth (GitHub provider). Repository access uses a least-privilege GitHub
            App with read-only permissions. Each agent request runs the real OpenCode CLI in a fresh temporary workspace.
          </p>
          {config && !config.supabaseConfigured && (
            <div className="notice warn">Supabase is not configured yet. See the setup instructions before signing in.</div>
          )}
          <form className="inline" method="post" action="/api/auth/signin">
            <button className="btn primary" type="submit">Continue with GitHub</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <h1>OpenCode Web</h1>
          <span className="tag">not affiliated with the OpenCode team</span>
        </div>
        <div className="userbox">
          {me.user.avatarUrl && <img className="avatar" src={me.user.avatarUrl} alt="" />}
          <span>{me.user.githubLogin ?? me.user.name ?? me.user.email}</span>
          <form className="inline" method="post" action="/api/auth/signout">
            <button className="btn ghost small" type="submit">Sign out</button>
          </form>
        </div>
      </div>

      <div className="banners">
        <div className="notice">
          <strong>Ephemeral workspace.</strong> Each request creates a fresh temporary workspace inside the serverless
          function, fetches the selected repository, runs the real OpenCode CLI, saves the response and a bounded diff
          summary to Supabase, then deletes the workspace. It is <strong>not</strong> a persistent cloud development
          environment. Saved conversations are metadata and messages only — no full repository copies.
        </div>
        {config && config.missing.length > 0 && (
          <div className="notice warn">
            <strong>Setup incomplete.</strong> {config.setupMessage} No agent reply is simulated.
          </div>
        )}
        {config && (
          <div className="notice">
            <strong>Model:</strong> <code>{config.model}</code> —{' '}
            {config.freeModel ? 'official free OpenCode Zen model, no API key needed' : 'requires a provider key'}.
            GitHub access: <code>{config.githubMode}</code>. {models.length} free models available.
          </div>
        )}
        {repoError && <div className="notice warn">Repository list unavailable: {repoError}</div>}
        {error && <div className="notice error">{error}</div>}
        {notice && <div className="notice">{notice}</div>}
      </div>

      <div className="layout">
        <aside className="sidebar">
          <div className="card">
            <h2>Repository</h2>
            {repos.length === 0 ? (
              <div className="empty">No repositories available. Install the read-only GitHub App on a repository you can access.</div>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="repo">Authorized repository</label>
                  <select id="repo" value={selectedRepo} onChange={(event) => selectRepo(event.target.value)}>
                    {repos.map((item) => (
                      <option key={item.full_name} value={item.full_name}>
                        {item.full_name}{item.private ? ' (private)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="ref">Branch / tag / SHA</label>
                  <input id="ref" value={ref} onChange={(event) => setRef(event.target.value)} />
                </div>
              </>
            )}
          </div>

          <div className="card">
            <h2>Model (official free OpenCode Zen)</h2>
            {models.length === 0 ? (
              <div className="empty">Model catalog unavailable.</div>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="model">Free model — no API key required</label>
                  <select id="model" value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}>
                    {models.map((model) => (
                      <option key={model.fullId} value={model.fullId}>
                        {model.name}{model.preferred ? ' ★' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="hint">{models.length} free models from the official OpenCode catalog.</div>
                {config?.modelTestsEnabled ? (
                  <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    <button className="btn small" type="button" onClick={() => void testModel(selectedModel)} disabled={testing || testingAll}>
                      {testing ? <><span className="spinner" /> Testing…</> : 'Test this model'}
                    </button>
                    <button className="btn small ghost" type="button" onClick={() => void testAllModels()} disabled={testing || testingAll}>
                      {testingAll ? <><span className="spinner" /> Testing all…</> : 'Test all free models'}
                    </button>
                  </div>
                ) : (
                  <div className="hint" style={{ marginTop: 8 }}>Model verification off (set ENABLE_MODEL_TESTS=1).</div>
                )}
                {modelTests.length > 0 && (
                  <div className="session-list" style={{ marginTop: 10, maxHeight: 220 }}>
                    {modelTests.map((result) => (
                      <div key={result.model} className={`msg ${result.ok ? 'assistant' : 'system'}`} style={{ padding: '7px 9px' }}>
                        <div className="who">{result.ok ? 'PASS' : 'FAIL'} · {result.model.replace('opencode/', '')}</div>
                        <pre>{result.ok ? (result.text ?? '').slice(0, 160) : (result.error ?? 'unknown error')}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="card">
            <h2>Saved conversations</h2>
            <button className="btn small" type="button" onClick={() => void newSession()}>+ New session</button>
            <div className="session-list" style={{ marginTop: 10 }}>
              {sessions.length === 0 ? (
                <div className="empty">No saved sessions yet.</div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    className={`session-item ${session.id === activeId ? 'active' : ''}`}
                    onClick={() => setActiveId(session.id)}
                  >
                    {session.title}
                    <small>{session.repo_full_name} · {session.repo_ref} · {formatTime(session.updated_at)}</small>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="conversation">
            {messages.length === 0 ? (
              <div className="empty">
                {activeId
                  ? 'No messages in this session yet. Send a request below.'
                  : 'Select or create a session, then send a request to the real OpenCode agent.'}
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`msg ${message.role}`}>
                  <div className="who">
                    {message.role === 'assistant' ? `OpenCode · ${message.metadata.runtime ?? 'runtime'}` : message.role}
                    {' · '}{formatTime(message.created_at)}
                  </div>
                  <pre>{message.content}</pre>
                  {Array.isArray(message.metadata.changes) && message.metadata.changes.length > 0 && (
                    <p className="changes">
                      {message.metadata.changes.length} file change(s) in the temporary workspace. No branch, commit or PR was created.
                    </p>
                  )}
                  {typeof message.metadata.patch === 'string' && message.metadata.patch.length > 0 && (
                    <details>
                      <summary>Review proposed diff (read-only, ephemeral)</summary>
                      <pre>{message.metadata.patch}</pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="composer">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask OpenCode about the selected repository, e.g. 'Explain the auth flow and suggest a test.'"
              disabled={busy}
            />
            <div className="composer-row">
              <span className="hint">
                Only real OpenCode output is shown. If the runtime is missing you get a setup error, never a fake reply.
                Changes are never written back to GitHub automatically.
              </span>
              <button className="btn primary" type="button" onClick={() => void send()} disabled={busy || !selectedRepo}>
                {busy ? <><span className="spinner" /> Running OpenCode…</> : 'Send request'}
              </button>
            </div>
          </div>
        </main>
      </div>

      <div className="footer">
        <div>
          <button className="btn small" type="button" onClick={() => void checkRuntime()} disabled={probing}>
            {probing ? <><span className="spinner" /> Probing…</> : 'Check real OpenCode runtime'}
          </button>
          {probe && (
            <span className="status" style={{ marginLeft: 12 }}>
              {probe.available
                ? <>Available: <code>{probe.versionOutput ?? probe.runtimeId}</code></>
                : <>Unavailable: {probe.error}</>}
            </span>
          )}
        </div>
        <span className="hint">Runtime adapter: <code>opencode-cli</code> · server-side only · /tmp only</span>
      </div>
    </div>
  );
}
