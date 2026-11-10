'use client';

import { useMemo, useState } from 'react';
import type {
  ConfigStatus,
  FreeModel,
  MeResponse,
  ModelTestResult,
  ProbeResult,
  Repo,
  Session,
  Message,
} from '@/lib/types';

type OpenCodeWindowProps = {
  me: MeResponse | null;
  config: ConfigStatus | null;
  models: FreeModel[];
  catalogSource: string;
  catalogNote: string | null;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  repos: Repo[];
  repoError: string | null;
  selectedRepo: string;
  onSelectRepo: (repoFullName: string) => void;
  repoRef: string;
  onChangeRepoRef: (ref: string) => void;
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => Promise<void>;
  messages: Message[];
  prompt: string;
  onChangePrompt: (value: string) => void;
  onSendPrompt: () => Promise<void>;
  busy: boolean;
  error: string | null;
  notice: string | null;
  authError: string | null;
  probe: ProbeResult | null;
  probing: boolean;
  onCheckRuntime: () => Promise<void>;
  modelTests: ModelTestResult[];
  testing: boolean;
  testingAll: boolean;
  onTestModel: (model: string) => Promise<void>;
  onTestPreferredModels: () => Promise<void>;
  onOpenDiffInNotepad: (title: string, patch: string) => void;
  returnPath: string;
};

function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function OpenCodeWindow({
  me,
  config,
  models,
  catalogSource,
  catalogNote,
  selectedModel,
  onSelectModel,
  repos,
  repoError,
  selectedRepo,
  onSelectRepo,
  repoRef,
  onChangeRepoRef,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  messages,
  prompt,
  onChangePrompt,
  onSendPrompt,
  busy,
  error,
  notice,
  authError,
  probe,
  probing,
  onCheckRuntime,
  modelTests,
  testing,
  testingAll,
  onTestModel,
  onTestPreferredModels,
  onOpenDiffInNotepad,
  returnPath,
}: OpenCodeWindowProps) {
  const [modelSearch, setModelSearch] = useState('');

  const filteredModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();
    if (!query) return models;
    return models.filter(
      (model) =>
        model.fullId.toLowerCase().includes(query) ||
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.envKeys.some((key) => key.toLowerCase().includes(query)),
    );
  }, [models, modelSearch]);

  const activeModelMeta = useMemo(
    () => models.find((item) => item.fullId === selectedModel) ?? null,
    [models, selectedModel],
  );

  return (
    <div className="oc-win">
      <div className="oc-win-strip">
        <div className="oc-strip-pills">
          <span className={`pill ${probe?.available ? 'ok' : 'neutral'}`}>
            {probe?.available ? `CLI: ${probe.versionOutput ?? 'opencode'}` : 'CLI: Probe on Vercel'}
          </span>
          <span className={`pill ${config?.supabaseConfigured ? 'ok' : 'warn'}`}>
            Supabase: {config?.supabaseConfigured ? 'Connected' : 'Missing env'}
          </span>
          <span className={`pill ${config?.githubMode && config.githubMode !== 'none' ? 'ok' : 'warn'}`}>
            GitHub: {config?.githubMode ?? 'none'}
          </span>
          <span className={`pill ${config?.modelKeyConfigured ? 'ok' : 'warn'}`}>
            Model key: {config?.modelKeyConfigured ? 'Present' : 'Missing'}
          </span>
        </div>
        <button className="win-btn small" type="button" onClick={() => void onCheckRuntime()} disabled={probing}>
          {probing ? 'Probing binary…' : 'Probe Real OpenCode CLI'}
        </button>
      </div>

      {probe && (
        <div className={`win-alert ${probe.available ? 'ok' : 'error'}`}>
          {probe.available ? (
            <>
              <strong>Real OpenCode binary verified on server:</strong> <code>{probe.versionOutput}</code> at{' '}
              <code>{probe.binaryPath}</code>
            </>
          ) : (
            <>
              <strong>Runtime unavailable:</strong> {probe.error}
            </>
          )}
        </div>
      )}

      {config && config.missing.length > 0 && (
        <div className="win-alert warn">
          <strong>Setup incomplete:</strong> {config.setupMessage} No reply is ever simulated.
        </div>
      )}
      {repoError && <div className="win-alert warn">Repository list unavailable: {repoError}</div>}
      {error && <div className="win-alert error">{error}</div>}
      {notice && <div className="win-alert info">{notice}</div>}

      {!me?.user ? (
        <div className="oc-auth-box">
          <div className="oc-auth-card">
            <h3>Sign in to OpenCode inside WineGUI Ubuntu 22</h3>
            <p>
              Sign in with GitHub via Supabase Auth to connect your authorized repositories, save conversations under
              Postgres RLS, and execute the real <code>opencode v2.2.5</code> CLI inside ephemeral Vercel workspaces.
            </p>
            {config?.githubOauthEnabled === false && (
              <div className="win-alert warn">
                <strong>GitHub OAuth unavailable:</strong> {config.githubOauthReason}
                {config.githubOauthFix ? <div className="muted-sm">{config.githubOauthFix}</div> : null}
              </div>
            )}
            {authError && <div className="win-alert error">{authError}</div>}
            <form method="post" action="/api/auth/signin">
              <input type="hidden" name="next" value={returnPath} />
              <button
                className="win-btn primary"
                type="submit"
                disabled={config?.githubOauthEnabled === false}
              >
                {config?.githubOauthEnabled === false ? 'GitHub sign-in unavailable' : 'Continue with GitHub'}
              </button>
            </form>
          </div>

          <div className="oc-auth-card">
            <h3>Verify Models &amp; Runtime (Public Checks)</h3>
            <p className="muted-sm">
              {models.length} normal free models loaded from {catalogSource}.{' '}
              {catalogNote ?? 'Select a model to check its credential requirements or run a real smoke test.'}
            </p>
            <div className="field-row">
              <input
                type="text"
                value={modelSearch}
                onChange={(event) => setModelSearch(event.target.value)}
                placeholder="Filter 214 models (provider, name, key)…"
                aria-label="Filter models"
              />
            </div>
            <div className="field-row">
              <select
                value={selectedModel}
                onChange={(event) => onSelectModel(event.target.value)}
                aria-label="Select model"
              >
                {filteredModels.map((model) => (
                  <option key={model.fullId} value={model.fullId}>
                    {model.provider} · {model.name}
                    {model.keylessOnVercel ? ' (keyless on Vercel)' : ` (${model.envKeys.join(' / ')})`}
                    {model.preferred ? ' ★' : ''}
                  </option>
                ))}
              </select>
            </div>
            {activeModelMeta && (
              <p className="muted-sm">
                Selected: <code>{activeModelMeta.fullId}</code> ·{' '}
                {activeModelMeta.keylessOnVercel
                  ? 'Keyless on Vercel via OIDC token'
                  : `Requires ${activeModelMeta.envKeys.join(' or ')} on server`}
              </p>
            )}
            {config?.modelTestsEnabled ? (
              <div className="btn-row">
                <button
                  className="win-btn"
                  type="button"
                  onClick={() => void onTestModel(selectedModel)}
                  disabled={testing || testingAll}
                >
                  {testing ? 'Testing…' : 'Test this model'}
                </button>
                <button
                  className="win-btn ghost"
                  type="button"
                  onClick={() => void onTestPreferredModels()}
                  disabled={testing || testingAll}
                >
                  {testingAll ? 'Testing suite…' : 'Test preferred models'}
                </button>
              </div>
            ) : (
              <p className="muted-sm">Enable <code>ENABLE_MODEL_TESTS=1</code> on Vercel to run smoke tests.</p>
            )}
            {modelTests.length > 0 && (
              <div className="test-results">
                {modelTests.map((result) => (
                  <div key={result.model} className={`test-item ${result.ok ? 'pass' : 'fail'}`}>
                    <div className="test-head">
                      <span>{result.ok ? 'PASS' : 'FAIL'} · {result.model}</span>
                      <span>{result.durationMs} ms</span>
                    </div>
                    <pre>{result.ok ? (result.text ?? '') : (result.error ?? 'Unknown error')}</pre>
                    {result.hint && <div className="muted-sm">{result.hint}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="oc-workspace-grid">
          <aside className="oc-side">
            <div className="oc-panel">
              <h4>Repository</h4>
              {repos.length === 0 ? (
                <p className="muted-sm">No authorized repositories found for this GitHub account.</p>
              ) : (
                <>
                  <select
                    value={selectedRepo}
                    onChange={(event) => onSelectRepo(event.target.value)}
                    aria-label="Authorized repository"
                  >
                    {repos.map((repo) => (
                      <option key={repo.full_name} value={repo.full_name}>
                        {repo.full_name}{repo.private ? ' (private)' : ''}
                      </option>
                    ))}
                  </select>
                  <input
                    value={repoRef}
                    onChange={(event) => onChangeRepoRef(event.target.value)}
                    placeholder="Branch / tag / SHA"
                    aria-label="Branch or git ref"
                  />
                </>
              )}
            </div>

            <div className="oc-panel">
              <h4>Model ({filteredModels.length})</h4>
              <input
                type="text"
                value={modelSearch}
                onChange={(event) => setModelSearch(event.target.value)}
                placeholder="Search models…"
                aria-label="Search models"
              />
              <select
                value={selectedModel}
                onChange={(event) => onSelectModel(event.target.value)}
                aria-label="OpenCode model"
              >
                {filteredModels.map((model) => (
                  <option key={model.fullId} value={model.fullId}>
                    {model.provider} · {model.name}
                    {model.keylessOnVercel ? ' (OIDC)' : ` (${model.envKeys.join('/')})`}
                    {model.preferred ? ' ★' : ''}
                  </option>
                ))}
              </select>
              {config?.modelTestsEnabled && (
                <div className="btn-row">
                  <button
                    className="win-btn small"
                    type="button"
                    onClick={() => void onTestModel(selectedModel)}
                    disabled={testing || testingAll}
                  >
                    {testing ? 'Testing…' : 'Test model'}
                  </button>
                  <button
                    className="win-btn small ghost"
                    type="button"
                    onClick={() => void onTestPreferredModels()}
                    disabled={testing || testingAll}
                  >
                    {testingAll ? 'Running…' : 'Test preferred'}
                  </button>
                </div>
              )}
              {modelTests.length > 0 && (
                <div className="test-results compact">
                  {modelTests.map((result) => (
                    <div key={result.model} className={`test-item ${result.ok ? 'pass' : 'fail'}`}>
                      <div className="test-head">{result.ok ? 'PASS' : 'FAIL'} · {result.model}</div>
                      <pre>{result.ok ? (result.text ?? '').slice(0, 140) : (result.error ?? 'Error')}</pre>
                      {result.hint && <div className="muted-sm">{result.hint}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="oc-panel sessions-panel">
              <div className="panel-head-row">
                <h4>Supabase Sessions</h4>
                <button className="win-btn small" type="button" onClick={() => void onCreateSession()}>
                  + New
                </button>
              </div>
              <div className="oc-session-list">
                {sessions.length === 0 ? (
                  <p className="muted-sm">No sessions saved yet.</p>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      className={`oc-session-item ${session.id === activeSessionId ? 'active' : ''}`}
                      onClick={() => onSelectSession(session.id)}
                    >
                      <span>{session.title}</span>
                      <small>{session.repo_ref} · {formatTime(session.updated_at)}</small>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          <section className="oc-chat">
            <div className="oc-messages">
              {messages.length === 0 ? (
                <div className="oc-empty">
                  <p>
                    <strong>OpenCode CLI v2.2.5</strong> ready inside <code>winegui_2_ubuntu-22-amd64</code>.
                  </p>
                  <p className="muted-sm">
                    Every prompt spawns the real binary in a fresh serverless <code>/tmp</code> workspace on Vercel,
                    reads your authorized GitHub repository, and persists messages &amp; diffs to Supabase RLS.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`oc-msg ${message.role}`}>
                    <div className="oc-msg-meta">
                      <span>
                        {message.role === 'assistant'
                          ? `OpenCode (${message.metadata.runtime ?? 'opencode-cli'})`
                          : message.role}
                      </span>
                      <span>{formatTime(message.created_at)}</span>
                    </div>
                    <pre>{message.content}</pre>
                    {Array.isArray(message.metadata.changes) && message.metadata.changes.length > 0 && (
                      <p className="muted-sm">
                        {message.metadata.changes.length} ephemeral file change(s) in temporary workspace (not pushed to GitHub).
                      </p>
                    )}
                    {typeof message.metadata.patch === 'string' && message.metadata.patch.length > 0 && (
                      <div className="diff-block">
                        <div className="btn-row">
                          <button
                            type="button"
                            className="win-btn small"
                            onClick={() =>
                              onOpenDiffInNotepad(`${selectedRepo || 'workspace'}.patch`, message.metadata.patch ?? '')
                            }
                          >
                            Open diff in Notepad++
                          </button>
                        </div>
                        <details>
                          <summary>View unified diff</summary>
                          <pre className="patch-pre">{message.metadata.patch}</pre>
                        </details>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="oc-composer">
              <textarea
                value={prompt}
                onChange={(event) => onChangePrompt(event.target.value)}
                placeholder="Ask OpenCode about the selected repository (e.g. 'Audit auth routes and summarize improvements.')"
                disabled={busy}
              />
              <div className="composer-foot">
                <span className="muted-sm">
                  Real server CLI only · no synthetic replies · changes stay read-only unless exported
                </span>
                <button
                  className="win-btn primary"
                  type="button"
                  onClick={() => void onSendPrompt()}
                  disabled={busy || !selectedRepo}
                >
                  {busy ? 'Running OpenCode…' : 'Run OpenCode'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
