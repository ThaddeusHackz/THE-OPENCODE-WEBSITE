'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DEFAULT_WINFY_OS,
  resolveWinfyOs,
  resolveWinfyWindow,
  type DesktopWindowId,
} from '@/lib/winfy/catalog';
import type {
  ConfigStatus,
  FreeModel,
  MeResponse,
  Message,
  ModelTestResult,
  ProbeResult,
  Repo,
  RunResult,
  Session,
} from '@/lib/types';
import { WinfyBrandLogo } from './WinfyIcons';
import { WinfyDesktop } from './WinfyDesktop';
import { WinfyPortalView } from './WinfyPortalView';

export type WinfyViewMode = 'runwine' | 'desktop' | 'portal' | 'wine-online';

type WinfyAppProps = {
  initialOs?: string | null;
  initialView?: WinfyViewMode;
  initialWindow?: string | null;
  initialDesktop?: boolean;
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

const BOOT_WAIT_SECONDS = 9;

export default function WinfyApp({
  initialOs = DEFAULT_WINFY_OS,
  initialView = 'runwine',
  initialWindow = null,
  initialDesktop = false,
}: WinfyAppProps) {
  const [osProfile, setOsProfile] = useState(() => resolveWinfyOs(initialOs));
  const [view, setView] = useState<WinfyViewMode>(initialDesktop ? 'desktop' : initialView);
  const [targetWindow, setTargetWindow] = useState<DesktopWindowId | null>(() => resolveWinfyWindow(initialWindow));
  const [countdown, setCountdown] = useState<number>(BOOT_WAIT_SECONDS);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [models, setModels] = useState<FreeModel[]>([]);
  const [catalogSource, setCatalogSource] = useState('OpenCode models.dev');
  const [catalogNote, setCatalogNote] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('vercel/reflection/beam-free');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repoRef, setRepoRef] = useState('main');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);
  const [modelTests, setModelTests] = useState<ModelTestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [testingAll, setTestingAll] = useState(false);

  const returnPath = `/runwine/index.php?os=${encodeURIComponent(osProfile.id)}&desktop=1`;

  const loadMessages = useCallback(async (id: string) => {
    const response = await api<{ messages: Message[] }>(`/api/sessions/${id}/messages`);
    setMessages(response.messages);
  }, []);

  const checkRuntime = useCallback(async (): Promise<ProbeResult | null> => {
    setProbing(true);
    try {
      const result = await api<ProbeResult>('/api/runtime/poc');
      setProbe(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Runtime probe failed.');
      return null;
    } finally {
      setProbing(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, configRes, modelsRes, pocRes] = await Promise.all([
        api<MeResponse>('/api/me').catch(() => ({ user: null })),
        api<ConfigStatus>('/api/config'),
        api<{
          models: FreeModel[];
          configuredModel: string;
          source: string;
          note: string | null;
        }>('/api/models'),
        api<ProbeResult>('/api/runtime/poc').catch(() => null),
      ]);
      setMe(meRes);
      setConfig(configRes);
      setModels(modelsRes.models);
      setCatalogSource(modelsRes.source);
      setCatalogNote(modelsRes.note);
      if (pocRes) setProbe(pocRes);
      setSelectedModel((current) =>
        modelsRes.models.some((m) => m.fullId === current)
          ? current
          : modelsRes.models.some((m) => m.fullId === modelsRes.configuredModel)
            ? modelsRes.configuredModel
            : (modelsRes.models[0]?.fullId ?? 'vercel/reflection/beam-free'),
      );
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
        setRepoRef(repoRes.repos[0].default_branch || 'main');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load Winfy OpenCode workspace.');
    } finally {
      setLoading(false);
    }
  }, [selectedRepo]);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get('error');
    if (reason === 'auth-failed' || reason === 'missing-code') {
      setAuthError(
        reason === 'auth-failed'
          ? 'The OAuth callback could not be exchanged for a Supabase session.'
          : 'The OAuth callback arrived without an authorization code.',
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    void loadMessages(activeSessionId).catch((err: Error) => setError(err.message));
  }, [activeSessionId, loadMessages]);

  // Winfy 9-second startup countdown when on the RunWine screen
  useEffect(() => {
    if (view !== 'runwine') return;
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [view, countdown]);

  const selectRepo = (fullName: string) => {
    setSelectedRepo(fullName);
    const found = repos.find((item) => item.full_name === fullName);
    if (found) setRepoRef(found.default_branch || 'main');
  };

  const createSession = async () => {
    setError(null);
    if (!selectedRepo) {
      setError('Select a repository first.');
      return;
    }
    try {
      const response = await api<{ session: Session }>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ repoFullName: selectedRepo, ref: repoRef }),
      });
      setSessions((prev) => [response.session, ...prev]);
      setActiveSessionId(response.session.id);
      setMessages([]);
      setNotice('Created Supabase session. A fresh temporary workspace will run on Vercel for your prompt.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create session.');
    }
  };

  const sendPrompt = async () => {
    setError(null);
    setNotice(null);
    if (!selectedRepo) {
      setError('Select a repository first.');
      return;
    }
    if (!prompt.trim()) {
      setError('Write a prompt first.');
      return;
    }
    setBusy(true);
    try {
      const response = await api<RunResult>('/api/agent/run', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: activeSessionId,
          repoFullName: selectedRepo,
          ref: repoRef,
          prompt,
          model: selectedModel,
        }),
      });
      setActiveSessionId(response.sessionId);
      await Promise.all([
        loadMessages(response.sessionId),
        api<{ sessions: Session[] }>('/api/sessions')
          .then((res) => setSessions(res.sessions))
          .catch(() => undefined),
      ]);
      setPrompt('');
      if (response.ok) {
        setNotice('Real OpenCode v2.2.5 output saved to Supabase.');
      } else {
        setNotice(response.result.error ?? 'The real OpenCode runtime returned an error.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OpenCode execution failed.');
    } finally {
      setBusy(false);
    }
  };

  const testModel = async (model: string) => {
    setTesting(true);
    setError(null);
    try {
      const result = await api<ModelTestResult>(`/api/models/test?model=${encodeURIComponent(model)}`);
      setModelTests((prev) => [result, ...prev.filter((item) => item.model !== result.model)].slice(0, 47));
    } catch (err) {
      setModelTests((prev) => [
        {
          model,
          ok: false,
          text: null,
          error: err instanceof Error ? err.message : 'Model test failed',
          exitCode: null,
          durationMs: 0,
          timedOut: false,
          quota: null,
          hint: null,
        },
        ...prev,
      ].slice(0, 47));
    } finally {
      setTesting(false);
    }
  };

  const testPreferredModels = async () => {
    setTestingAll(true);
    setModelTests([]);
    const picks = models.filter((model) => model.preferred || model.keylessOnVercel).slice(0, 12);
    for (const model of picks) {
      await testModel(model.fullId);
    }
    setTestingAll(false);
  };

  const switchOs = (osId: string) => {
    setOsProfile(resolveWinfyOs(osId));
  };

  const launchRunWine = (osId: string, windowId?: DesktopWindowId) => {
    setOsProfile(resolveWinfyOs(osId));
    setTargetWindow(windowId ?? null);
    setCountdown(BOOT_WAIT_SECONDS);
    setView('runwine');
  };

  const openDesktopDirect = (osId: string, windowId?: DesktopWindowId) => {
    setOsProfile(resolveWinfyOs(osId));
    setTargetWindow(windowId ?? null);
    setView('desktop');
  };

  if (view === 'desktop') {
    return (
      <WinfyDesktop
        profile={osProfile}
        initialWindow={targetWindow}
        me={me}
        config={config}
        models={models}
        catalogSource={catalogSource}
        catalogNote={catalogNote}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        repos={repos}
        repoError={repoError}
        selectedRepo={selectedRepo}
        onSelectRepo={selectRepo}
        repoRef={repoRef}
        onChangeRepoRef={setRepoRef}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onCreateSession={createSession}
        messages={messages}
        prompt={prompt}
        onChangePrompt={setPrompt}
        onSendPrompt={sendPrompt}
        busy={busy}
        error={error}
        notice={notice}
        authError={authError}
        probe={probe}
        probing={probing}
        onCheckRuntime={checkRuntime}
        modelTests={modelTests}
        testing={testing}
        testingAll={testingAll}
        onTestModel={testModel}
        onTestPreferredModels={testPreferredModels}
        onSwitchOs={switchOs}
        onExitDesktop={() => {
          setCountdown(BOOT_WAIT_SECONDS);
          setView('runwine');
        }}
        onOpenPortal={() => setView('portal')}
        returnPath={returnPath}
      />
    );
  }

  const progressPct = Math.round(((BOOT_WAIT_SECONDS - countdown) / BOOT_WAIT_SECONDS) * 100);

  return (
    <div className="winfy-shell">
      <header className="winfy-header">
        <Link className="winfy-brand" href="/" title="Back to winfy.net home">
          <WinfyBrandLogo size={32} />
          <div>
            <strong>Winfy · RunWine</strong>
            <span>WineGUI Ubuntu 22 + OpenCode v2.2.5</span>
          </div>
        </Link>

        <nav className="winfy-nav" aria-label="Primary navigation">
          <button
            type="button"
            className={view === 'runwine' ? 'active' : ''}
            onClick={() => setView('runwine')}
          >
            RunWine ({osProfile.shortName})
          </button>
          <button
            type="button"
            className={view === 'portal' ? 'active' : ''}
            onClick={() => setView('portal')}
          >
            Winfy Apps &amp; OS
          </button>
          <button
            type="button"
            className={view === 'wine-online' ? 'active' : ''}
            onClick={() => setView('wine-online')}
          >
            Wine Online
          </button>
          <button
            type="button"
            className="desktop-cta"
            onClick={() => openDesktopDirect(osProfile.id, targetWindow ?? undefined)}
          >
            Open Desktop
          </button>
        </nav>

        <div className="winfy-header-right">
          {me?.user ? (
            <div className="winfy-user-chip">
              {me.user.avatarUrl && <img src={me.user.avatarUrl} alt="" />}
              <span>@{me.user.githubLogin ?? me.user.name ?? 'user'}</span>
              <form method="post" action="/api/auth/signout" className="inline">
                <button type="submit" className="win-btn small ghost">Sign out</button>
              </form>
            </div>
          ) : (
            <form method="post" action="/api/auth/signin" className="inline">
              <input type="hidden" name="next" value={returnPath} />
              <button
                type="submit"
                className="win-btn small primary"
                disabled={config?.githubOauthEnabled === false}
              >
                {config?.githubOauthEnabled === false ? 'GitHub OAuth Off' : 'Continue with GitHub'}
              </button>
            </form>
          )}
          <button
            type="button"
            className="win-btn small"
            onClick={() => setView('portal')}
          >
            Exit
          </button>
        </div>
      </header>

      <main className="winfy-main">
        {view === 'portal' ? (
          <WinfyPortalView
            config={config}
            probe={probe}
            onLaunchRunWine={launchRunWine}
            onOpenDesktopDirect={openDesktopDirect}
          />
        ) : view === 'wine-online' ? (
          <section className="wine-online-page">
            <div className="runwine-card">
              <span className="badge-os">Wine Online · Windows Compatibility Layer</span>
              <h1>Wine online for Windows apps &amp; OpenCode workspace</h1>
              <p>
                Wine (&ldquo;Wine Is Not an Emulator&rdquo;) translates Windows API calls into POSIX calls on Linux.
                Choose either the <strong>Ubuntu 22.04 WineGUI</strong> profile or the{' '}
                <strong>Windows 11 Basic Desktop</strong> theme below to enter the interactive desktop right inside
                this website.
              </p>
              <div className="btn-row">
                <button
                  type="button"
                  className="win-btn primary large"
                  onClick={() => launchRunWine('winegui_2_ubuntu-22-amd64', 'winegui')}
                >
                  Run WineGUI Ubuntu 22 (winegui_2_ubuntu-22-amd64)
                </button>
                <button
                  type="button"
                  className="win-btn large"
                  onClick={() => launchRunWine('winfy-windows11-basic-22.04.3-desktop-amd64', 'winegui')}
                >
                  Run Wine Basic (Windows 11 Desktop)
                </button>
              </div>
            </div>
            <div className="runwine-guide">
              <h2>Software Description &amp; Key Features</h2>
              <ul>
                <li><strong>Windows Application Compatibility:</strong> Manage Wine prefixes, Explorer, CMD, Notepad++, VLC, and Format Factory in one desktop.</li>
                <li><strong>Real OpenCode Integration:</strong> Run the official OpenCode v2.2.5 CLI on Vercel Functions against your GitHub repositories.</li>
                <li><strong>Supabase Persistence:</strong> Sign in with GitHub to save conversations and code diffs under Postgres RLS.</li>
              </ul>
            </div>
          </section>
        ) : (
          <section className="runwine-page">
            <div className="runwine-card">
              <div className="runwine-top-meta">
                <span className="badge-os">OS: {osProfile.id}</span>
                <span className="muted-sm">{osProfile.architecture}</span>
              </div>

              <h1>... We are now starting Winfy ...</h1>
              <p className="runwine-sub">Wine · {osProfile.label}</p>

              <div className="progress-track" aria-label="Initialization progress">
                <div className="progress-fill" style={{ width: `${Math.max(10, progressPct)}%` }} />
              </div>

              <div className="runwine-countdown-row">
                <span className="countdown-label">
                  {countdown > 0 ? `Please wait ${countdown} secs` : 'Workspace ready'}
                </span>
                <div className="btn-row">
                  <button
                    type="button"
                    className="win-btn primary large"
                    onClick={() => setView('desktop')}
                  >
                    {countdown > 0 ? 'Click to open now' : 'Click to open'}
                  </button>
                  <button
                    type="button"
                    className="win-btn"
                    onClick={() => {
                      setTargetWindow('opencode');
                      setView('desktop');
                    }}
                  >
                    Open OpenCode IDE directly
                  </button>
                </div>
              </div>

              <div className="runwine-resource-note">
                It is a pleasure for us that you run Winfy, the solution that allows you to run Windows &amp; Linux
                apps online with WineGUI and OpenCode. Note that if we detect no action during more than 5 minutes,
                the desktop view resets to save free resources — while any OpenCode conversations remain safely saved
                in your Supabase account.
              </div>

              <div className="runwine-stack-grid">
                <div className="stack-item">
                  <span>Server OpenCode CLI</span>
                  <strong>
                    {loading ? 'Checking…' : probe?.available ? (probe.versionOutput ?? 'Available') : 'Click Open to probe'}
                  </strong>
                </div>
                <div className="stack-item">
                  <span>Supabase Auth (GitHub)</span>
                  <strong>
                    {me?.user
                      ? `Signed in as @${me.user.githubLogin ?? me.user.name}`
                      : config?.githubOauthEnabled === false
                        ? 'Provider disabled'
                        : 'Ready to sign in'}
                  </strong>
                </div>
                <div className="stack-item">
                  <span>Vercel Model Runtime</span>
                  <strong>{config?.model ?? 'vercel/reflection/beam-free'}</strong>
                </div>
                <div className="stack-item">
                  <span>Upstream External Link</span>
                  <a href={osProfile.upstreamUrl} target="_blank" rel="noopener noreferrer">
                    Open OffiDocs winfy.net ↗
                  </a>
                </div>
              </div>
            </div>

            <article className="runwine-guide">
              <h2>How to use Winfy</h2>
              <p>
                Winfy operations for end users are straightforward. Choose your Wine / Ubuntu OS profile below or launch
                directly into <code>{osProfile.id}</code> to work inside the full web desktop.
              </p>
              <p>
                Classic applications are ready inside the desktop: <strong>Windows Explorer</strong>,{' '}
                <strong>CMD / Ubuntu Shell</strong>, <strong>Notepad++</strong>, <strong>Web Browser</strong>,{' '}
                <strong>VLC Online</strong>, <strong>Format Factory</strong>, classic arcade games, plus the real{' '}
                <strong>OpenCode CLI v2.2.5</strong> wired to Vercel and Supabase.
              </p>
              <div className="btn-row" style={{ marginTop: 12 }}>
                <button type="button" className="win-btn small" onClick={() => setView('portal')}>
                  Browse all Winfy apps &amp; OS profiles
                </button>
                <button type="button" className="win-btn small" onClick={() => void checkRuntime()} disabled={probing}>
                  {probing ? 'Probing Vercel binary…' : 'Probe OpenCode binary'}
                </button>
              </div>
              {probe && (
                <p className="muted-sm" style={{ marginTop: 10 }}>
                  Runtime probe: <code>{probe.available ? `${probe.versionOutput} (${probe.binaryPath})` : probe.error}</code>
                </p>
              )}
            </article>
          </section>
        )}
      </main>

      <footer className="winfy-footer">
        <div className="winfy-footer-left">
          <span>Winfy RunWine Web Workspace · Powered by Next.js, OpenCode CLI v2.2.5, Vercel &amp; Supabase</span>
        </div>
        <div className="winfy-footer-links">
          <Link href="/runwine/index.php?os=winegui_2_ubuntu-22-amd64">/runwine/index.php</Link>
          <Link href="/wine-online">Wine Online</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
