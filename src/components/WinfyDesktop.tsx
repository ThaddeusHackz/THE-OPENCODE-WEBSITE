'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DesktopWindowId, WinfyOsProfile } from '@/lib/winfy/catalog';
import type {
  ConfigStatus,
  FreeModel,
  MeResponse,
  Message,
  ModelTestResult,
  ProbeResult,
  Repo,
  Session,
} from '@/lib/types';
import { WindowAppIcon } from './WinfyIcons';
import { OpenCodeWindow } from './windows/OpenCodeWindow';
import { WineGuiWindow } from './windows/WineGuiWindow';
import { TerminalWindow } from './windows/TerminalWindow';
import { ExplorerWindow } from './windows/ExplorerWindow';
import { NotepadWindow, type NotepadTab } from './windows/NotepadWindow';
import { BrowserWindow } from './windows/BrowserWindow';
import {
  FormatFactoryWindow,
  PongWindow,
  SnakeWindow,
  TetrisWindow,
  VlcPlayerWindow,
} from './windows/AppsWindow';

type WindowState = {
  id: DesktopWindowId;
  title: string;
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  z: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

type WinfyDesktopProps = {
  profile: WinfyOsProfile;
  initialWindow?: DesktopWindowId | null;
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
  onCheckRuntime: () => Promise<ProbeResult | null>;
  modelTests: ModelTestResult[];
  testing: boolean;
  testingAll: boolean;
  onTestModel: (model: string) => Promise<void>;
  onTestPreferredModels: () => Promise<void>;
  onSwitchOs: (osId: string) => void;
  onExitDesktop: () => void;
  onOpenPortal: () => void;
  returnPath: string;
};

const INITIAL_WINDOWS: Record<DesktopWindowId, Omit<WindowState, 'open' | 'z'>> = {
  opencode: { id: 'opencode', title: 'OpenCode CLI v2.2.5 (Vercel + Supabase)', minimized: false, maximized: false, x: 96, y: 24, w: 920, h: 580 },
  winegui: { id: 'winegui', title: 'WineGUI · winegui_2_ubuntu-22-amd64', minimized: false, maximized: false, x: 130, y: 52, w: 760, h: 520 },
  terminal: { id: 'terminal', title: 'user@winegui-ubuntu22: ~ (CMD / Shell)', minimized: false, maximized: false, x: 165, y: 84, w: 720, h: 460 },
  explorer: { id: 'explorer', title: 'Windows Explorer / Ubuntu Files', minimized: false, maximized: false, x: 195, y: 74, w: 700, h: 460 },
  notepad: { id: 'notepad', title: 'Notepad++ Online', minimized: false, maximized: false, x: 225, y: 94, w: 680, h: 470 },
  browser: { id: 'browser', title: 'Winfy Web Browser', minimized: false, maximized: false, x: 140, y: 40, w: 840, h: 540 },
  vlc: { id: 'vlc', title: 'VLC Media Player Online', minimized: false, maximized: false, x: 210, y: 90, w: 620, h: 420 },
  'format-factory': { id: 'format-factory', title: 'Format Factory Online', minimized: false, maximized: false, x: 240, y: 70, w: 640, h: 490 },
  tetris: { id: 'tetris', title: 'Tetris Cube', minimized: false, maximized: false, x: 310, y: 58, w: 340, h: 490 },
  snake: { id: 'snake', title: 'Snake Candy', minimized: false, maximized: false, x: 340, y: 68, w: 360, h: 420 },
  pong: { id: 'pong', title: 'Pong Candy', minimized: false, maximized: false, x: 290, y: 88, w: 420, h: 370 },
};

const DOCK_ITEMS: Array<{ id: DesktopWindowId; label: string }> = [
  { id: 'opencode', label: 'OpenCode' },
  { id: 'winegui', label: 'WineGUI' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'explorer', label: 'Explorer' },
  { id: 'notepad', label: 'Notepad++' },
  { id: 'browser', label: 'Browser' },
  { id: 'vlc', label: 'VLC' },
  { id: 'format-factory', label: 'Converter' },
  { id: 'tetris', label: 'Tetris' },
  { id: 'snake', label: 'Snake' },
];

const DESKTOP_SHORTCUTS: Array<{ id: DesktopWindowId; label: string }> = [
  { id: 'opencode', label: 'OpenCode CLI' },
  { id: 'winegui', label: 'WineGUI Ubuntu 22' },
  { id: 'explorer', label: 'Windows Explorer' },
  { id: 'terminal', label: 'CMD / Bash' },
  { id: 'notepad', label: 'Notepad++' },
  { id: 'browser', label: 'Web Browser' },
  { id: 'tetris', label: 'Tetris Cube' },
];

const IDLE_LIMIT_SECONDS = 300;

export function WinfyDesktop({
  profile,
  initialWindow,
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
  onSwitchOs,
  onExitDesktop,
  onOpenPortal,
  returnPath,
}: WinfyDesktopProps) {
  const defaultFocus = initialWindow ?? profile.defaultWindow;
  const topZRef = useRef(12);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [idleSeconds, setIdleSeconds] = useState(IDLE_LIMIT_SECONDS);
  const [clockText, setClockText] = useState('');
  const [showAppMenu, setShowAppMenu] = useState(false);

  const [notepadTabs, setNotepadTabs] = useState<NotepadTab[]>([
    {
      id: 'welcome',
      title: 'welcome.txt',
      content: [
        `Winfy RunWine Desktop (${profile.id})`,
        '---------------------------------------------',
        'Preinstalled inside this website:',
        '  1. OpenCode CLI v2.2.5 (server-side Vercel Function)',
        '  2. Supabase Auth (GitHub) + Postgres RLS sessions',
        '  3. WineGUI Manager, Explorer, CMD Shell, Notepad++, Browser, VLC & Games',
        '',
        'Tip: Select a repository in OpenCode or Explorer and inspect diffs right here.',
      ].join('\n'),
    },
  ]);
  const [activeNotepadTab, setActiveNotepadTab] = useState('welcome');

  const [windows, setWindows] = useState<Record<DesktopWindowId, WindowState>>(() => {
    const base = {} as Record<DesktopWindowId, WindowState>;
    for (const key of Object.keys(INITIAL_WINDOWS) as DesktopWindowId[]) {
      const openByDefault = key === 'opencode' || key === defaultFocus;
      base[key] = {
        ...INITIAL_WINDOWS[key],
        open: openByDefault,
        z: key === defaultFocus ? 11 : key === 'opencode' ? 10 : 5,
      };
    }
    return base;
  });

  useEffect(() => {
    const updateClock = () => {
      setClockText(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 30_000);
    return () => clearInterval(timer);
  }, []);

  // Winfy 5-minute idle monitor (resets on any pointer or keyboard interaction)
  useEffect(() => {
    const resetIdle = () => setIdleSeconds(IDLE_LIMIT_SECONDS);
    window.addEventListener('pointerdown', resetIdle, { passive: true });
    window.addEventListener('keydown', resetIdle, { passive: true });
    const timer = setInterval(() => {
      setIdleSeconds((prev) => {
        if (prev <= 1) {
          onExitDesktop();
          return IDLE_LIMIT_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      window.removeEventListener('pointerdown', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      clearInterval(timer);
    };
  }, [onExitDesktop]);

  const focusWindow = useCallback((id: DesktopWindowId) => {
    topZRef.current += 1;
    const nextZ = topZRef.current;
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], open: true, minimized: false, z: nextZ },
    }));
  }, []);

  const openWindow = useCallback(
    (id: DesktopWindowId) => {
      setShowAppMenu(false);
      focusWindow(id);
    },
    [focusWindow],
  );

  const closeWindow = useCallback((id: DesktopWindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], open: false },
    }));
  }, []);

  const minimizeWindow = useCallback((id: DesktopWindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], minimized: true },
    }));
  }, []);

  const toggleMaximize = useCallback((id: DesktopWindowId) => {
    topZRef.current += 1;
    const nextZ = topZRef.current;
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], maximized: !prev[id].maximized, z: nextZ },
    }));
  }, []);

  const startDrag = useCallback(
    (id: DesktopWindowId, event: React.PointerEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).closest('button')) return;
      if (window.innerWidth < 880) return;
      focusWindow(id);
      const startX = event.clientX;
      const startY = event.clientY;
      const win = windows[id];
      if (!win || win.maximized) return;
      const origX = win.x;
      const origY = win.y;

      const onMove = (moveEvent: PointerEvent) => {
        const stageRect = stageRef.current?.getBoundingClientRect();
        const maxX = Math.max(120, (stageRect?.width ?? window.innerWidth) - 220);
        const maxY = Math.max(80, (stageRect?.height ?? window.innerHeight) - 100);
        const nextX = Math.max(8, Math.min(maxX, origX + (moveEvent.clientX - startX)));
        const nextY = Math.max(6, Math.min(maxY, origY + (moveEvent.clientY - startY)));
        setWindows((prev) => ({
          ...prev,
          [id]: { ...prev[id], x: nextX, y: nextY },
        }));
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [focusWindow, windows],
  );

  const openNoteInNotepad = useCallback(
    (title: string, content: string) => {
      const id = `tab-${Date.now()}`;
      setNotepadTabs((prev) => [...prev, { id, title, content }]);
      setActiveNotepadTab(id);
      openWindow('notepad');
    },
    [openWindow],
  );

  const updateNotepadTab = useCallback((id: string, content: string) => {
    setNotepadTabs((prev) => prev.map((tab) => (tab.id === id ? { ...tab, content } : tab)));
  }, []);

  const addNotepadTab = useCallback((title = 'untitled.txt', content = '') => {
    const id = `tab-${Date.now()}`;
    setNotepadTabs((prev) => [...prev, { id, title, content }]);
    setActiveNotepadTab(id);
  }, []);

  const openWindowsList = useMemo(
    () => (Object.values(windows) as WindowState[]).filter((w) => w.open),
    [windows],
  );

  const idleFormatted = `${Math.floor(idleSeconds / 60)}:${String(idleSeconds % 60).padStart(2, '0')}`;

  return (
    <div className={`desktop-shell theme-${profile.theme}`}>
      <header className="os-panel">
        <div className="os-panel-left">
          <button
            type="button"
            className="os-activities-btn"
            onClick={() => setShowAppMenu((prev) => !prev)}
          >
            Activities
          </button>
          <span className="os-badge">{profile.id}</span>
          <button type="button" className="os-top-link" onClick={onOpenPortal}>
            Winfy Portal
          </button>
        </div>

        <div className="os-panel-center">
          <span>{clockText || 'UTC'}</span>
          <span className="idle-chip" title="Winfy idle timer resets on activity; Supabase sessions remain saved">
            Session active · idle reset {idleFormatted}
          </span>
        </div>

        <div className="os-panel-right">
          {me?.user ? (
            <div className="os-user">
              {me.user.avatarUrl && <img src={me.user.avatarUrl} alt="" className="os-avatar" />}
              <span>@{me.user.githubLogin ?? me.user.name ?? 'user'}</span>
              <form method="post" action="/api/auth/signout" className="inline">
                <button type="submit" className="os-panel-btn">Sign out</button>
              </form>
            </div>
          ) : (
            <form method="post" action="/api/auth/signin" className="inline">
              <input type="hidden" name="next" value={returnPath} />
              <button
                type="submit"
                className="os-panel-btn accent"
                disabled={config?.githubOauthEnabled === false}
              >
                {config?.githubOauthEnabled === false ? 'GitHub OAuth Off' : 'Sign in with GitHub'}
              </button>
            </form>
          )}
          <button type="button" className="os-panel-btn danger" onClick={onExitDesktop}>
            Exit
          </button>
        </div>
      </header>

      <div className="os-body">
        <aside className="os-dock" aria-label="Application dock">
          {DOCK_ITEMS.map((item) => {
            const win = windows[item.id];
            return (
              <button
                key={item.id}
                type="button"
                className={`dock-item ${win.open && !win.minimized ? 'active' : ''} ${win.open ? 'running' : ''}`}
                onClick={() => openWindow(item.id)}
                title={item.label}
              >
                <WindowAppIcon id={item.id} size={24} />
                <span className="dock-label">{item.label}</span>
              </button>
            );
          })}
        </aside>

        <div ref={stageRef} className="os-stage">
          <div className="desktop-shortcuts">
            {DESKTOP_SHORTCUTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="desktop-icon"
                onClick={() => openWindow(item.id)}
              >
                <WindowAppIcon id={item.id} size={34} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {showAppMenu && (
            <div className="activities-drawer" role="dialog" aria-label="All Applications">
              <div className="activities-head">
                <strong>Applications · {profile.label}</strong>
                <button type="button" className="win-btn small" onClick={() => setShowAppMenu(false)}>
                  Close
                </button>
              </div>
              <div className="activities-grid">
                {(Object.values(windows) as WindowState[]).map((win) => (
                  <button
                    key={win.id}
                    type="button"
                    className="activities-tile"
                    onClick={() => openWindow(win.id)}
                  >
                    <WindowAppIcon id={win.id} size={28} />
                    <span>{win.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {openWindowsList.map((win) => (
            <section
              key={win.id}
              className={`os-window ${win.maximized ? 'maximized' : ''} ${win.minimized ? 'minimized' : ''}`}
              style={
                win.maximized
                  ? { zIndex: win.z }
                  : { zIndex: win.z, left: win.x, top: win.y, width: win.w, height: win.h }
              }
              onMouseDown={() => focusWindow(win.id)}
              aria-label={win.title}
            >
              <div className="os-window-bar" onPointerDown={(event) => startDrag(win.id, event)}>
                <div className="os-window-title">
                  <WindowAppIcon id={win.id} size={16} />
                  <span>{win.title}</span>
                </div>
                <div className="os-window-controls">
                  <button type="button" title="Minimize" onClick={() => minimizeWindow(win.id)} aria-label="Minimize">
                    _
                  </button>
                  <button type="button" title="Maximize" onClick={() => toggleMaximize(win.id)} aria-label="Maximize">
                    □
                  </button>
                  <button type="button" className="close" title="Close" onClick={() => closeWindow(win.id)} aria-label="Close">
                    ×
                  </button>
                </div>
              </div>

              <div className="os-window-content">
                {win.id === 'opencode' && (
                  <OpenCodeWindow
                    me={me}
                    config={config}
                    models={models}
                    catalogSource={catalogSource}
                    catalogNote={catalogNote}
                    selectedModel={selectedModel}
                    onSelectModel={onSelectModel}
                    repos={repos}
                    repoError={repoError}
                    selectedRepo={selectedRepo}
                    onSelectRepo={onSelectRepo}
                    repoRef={repoRef}
                    onChangeRepoRef={onChangeRepoRef}
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSelectSession={onSelectSession}
                    onCreateSession={onCreateSession}
                    messages={messages}
                    prompt={prompt}
                    onChangePrompt={onChangePrompt}
                    onSendPrompt={onSendPrompt}
                    busy={busy}
                    error={error}
                    notice={notice}
                    authError={authError}
                    probe={probe}
                    probing={probing}
                    onCheckRuntime={() => onCheckRuntime().then(() => undefined)}
                    modelTests={modelTests}
                    testing={testing}
                    testingAll={testingAll}
                    onTestModel={onTestModel}
                    onTestPreferredModels={onTestPreferredModels}
                    onOpenDiffInNotepad={openNoteInNotepad}
                    returnPath={returnPath}
                  />
                )}
                {win.id === 'winegui' && (
                  <WineGuiWindow profile={profile} onOpenWindow={openWindow} onSwitchOs={onSwitchOs} />
                )}
                {win.id === 'terminal' && (
                  <TerminalWindow
                    osId={profile.id}
                    me={me}
                    config={config}
                    models={models}
                    repos={repos}
                    probe={probe}
                    onRefreshProbe={onCheckRuntime}
                    onTestModel={onTestModel}
                    onOpenOpenCode={() => openWindow('opencode')}
                  />
                )}
                {win.id === 'explorer' && (
                  <ExplorerWindow
                    profile={profile}
                    repos={repos}
                    sessions={sessions}
                    onPickRepo={(fullName, defaultBranch) => {
                      onSelectRepo(fullName);
                      onChangeRepoRef(defaultBranch);
                    }}
                    onSelectSession={onSelectSession}
                    onOpenWindow={openWindow}
                    onOpenNote={openNoteInNotepad}
                  />
                )}
                {win.id === 'notepad' && (
                  <NotepadWindow
                    tabs={notepadTabs}
                    activeTabId={activeNotepadTab}
                    onSelectTab={setActiveNotepadTab}
                    onUpdateTab={updateNotepadTab}
                    onAddTab={addNotepadTab}
                    onSendToOpenCode={(text) => {
                      onChangePrompt(text);
                      openWindow('opencode');
                    }}
                  />
                )}
                {win.id === 'browser' && (
                  <BrowserWindow profile={profile} config={config} probe={probe} onOpenWindow={openWindow} />
                )}
                {win.id === 'vlc' && <VlcPlayerWindow />}
                {win.id === 'format-factory' && <FormatFactoryWindow />}
                {win.id === 'tetris' && <TetrisWindow />}
                {win.id === 'snake' && <SnakeWindow />}
                {win.id === 'pong' && <PongWindow />}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
