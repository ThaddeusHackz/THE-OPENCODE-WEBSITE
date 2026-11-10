'use client';

import { useState } from 'react';
import type { DesktopWindowId, WinfyOsProfile } from '@/lib/winfy/catalog';
import type { Repo, Session } from '@/lib/types';

type ExplorerWindowProps = {
  profile: WinfyOsProfile;
  repos: Repo[];
  sessions: Session[];
  onPickRepo: (repoFullName: string, ref: string) => void;
  onSelectSession: (id: string) => void;
  onOpenWindow: (id: DesktopWindowId) => void;
  onOpenNote: (title: string, content: string) => void;
};

type LocationKey = 'home' | 'wine-c' | 'repos' | 'sessions';

export function ExplorerWindow({
  profile,
  repos,
  sessions,
  onPickRepo,
  onSelectSession,
  onOpenWindow,
  onOpenNote,
}: ExplorerWindowProps) {
  const [location, setLocation] = useState<LocationKey>('home');

  return (
    <div className="explorer-win">
      <aside className="explorer-nav">
        <div className="explorer-nav-title">Places</div>
        <button
          type="button"
          className={location === 'home' ? 'active' : ''}
          onClick={() => setLocation('home')}
        >
          /home/user
        </button>
        <button
          type="button"
          className={location === 'wine-c' ? 'active' : ''}
          onClick={() => setLocation('wine-c')}
        >
          C:\ (Wine Prefix)
        </button>
        <button
          type="button"
          className={location === 'repos' ? 'active' : ''}
          onClick={() => setLocation('repos')}
        >
          GitHub Repos ({repos.length})
        </button>
        <button
          type="button"
          className={location === 'sessions' ? 'active' : ''}
          onClick={() => setLocation('sessions')}
        >
          Supabase Sessions ({sessions.length})
        </button>
      </aside>

      <div className="explorer-main">
        <div className="explorer-pathbar">
          <span>
            Path:{' '}
            <code>
              {location === 'home'
                ? '/home/user'
                : location === 'wine-c'
                  ? '/home/user/.wine/drive_c'
                  : location === 'repos'
                    ? 'github://authorized-repos'
                    : 'supabase://public.agent_sessions'}
            </code>
          </span>
          <span className="muted-sm">{profile.id}</span>
        </div>

        {location === 'home' && (
          <div className="explorer-grid">
            <button type="button" className="file-tile" onClick={() => onOpenWindow('opencode')}>
              <strong>opencode-workspace</strong>
              <span>OpenCode v2.2.5 IDE</span>
            </button>
            <button type="button" className="file-tile" onClick={() => onOpenWindow('winegui')}>
              <strong>WineGUI.desktop</strong>
              <span>Manage Wine bottles</span>
            </button>
            <button type="button" className="file-tile" onClick={() => setLocation('wine-c')}>
              <strong>.wine/drive_c</strong>
              <span>Windows virtual drive</span>
            </button>
            <button
              type="button"
              className="file-tile"
              onClick={() =>
                onOpenNote(
                  'README.txt',
                  `Active Winfy OS: ${profile.id}\nOpenCode CLI: v2.2.5 (server-side Vercel Function)\nStorage: Supabase Postgres + RLS\n\nUse the OpenCode window to inspect GitHub repos and save diffs.`,
                )
              }
            >
              <strong>README.txt</strong>
              <span>Open in Notepad++</span>
            </button>
          </div>
        )}

        {location === 'wine-c' && (
          <div className="explorer-grid">
            <button type="button" className="file-tile" onClick={() => onOpenWindow('notepad')}>
              <strong>notepad++.exe</strong>
              <span>Launch Notepad++ Online</span>
            </button>
            <button type="button" className="file-tile" onClick={() => onOpenWindow('terminal')}>
              <strong>cmd.exe</strong>
              <span>Launch Ubuntu / CMD shell</span>
            </button>
            <button type="button" className="file-tile" onClick={() => onOpenWindow('vlc')}>
              <strong>vlc.exe</strong>
              <span>Launch VLC media player</span>
            </button>
            <button type="button" className="file-tile" onClick={() => onOpenWindow('format-factory')}>
              <strong>FormatFactory.exe</strong>
              <span>Launch Format Factory</span>
            </button>
            <button type="button" className="file-tile" onClick={() => onOpenWindow('browser')}>
              <strong>browser.exe</strong>
              <span>Launch Winfy Web Browser</span>
            </button>
          </div>
        )}

        {location === 'repos' && (
          <div className="explorer-list">
            {repos.length === 0 ? (
              <p className="muted-sm">
                Sign in with GitHub inside the OpenCode window to browse your authorized repositories here.
              </p>
            ) : (
              repos.map((repo) => (
                <button
                  key={repo.full_name}
                  type="button"
                  className="explorer-row"
                  onClick={() => {
                    onPickRepo(repo.full_name, repo.default_branch || 'main');
                    onOpenWindow('opencode');
                  }}
                >
                  <div>
                    <strong>{repo.full_name}</strong>
                    <span>{repo.description ?? 'Click to inspect with OpenCode'}</span>
                  </div>
                  <span className="pill neutral">{repo.private ? 'Private' : 'Public'} · {repo.default_branch}</span>
                </button>
              ))
            )}
          </div>
        )}

        {location === 'sessions' && (
          <div className="explorer-list">
            {sessions.length === 0 ? (
              <p className="muted-sm">No Supabase sessions saved yet for this user.</p>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  className="explorer-row"
                  onClick={() => {
                    onSelectSession(session.id);
                    onOpenWindow('opencode');
                  }}
                >
                  <div>
                    <strong>{session.title}</strong>
                    <span>{session.repo_full_name} @ {session.repo_ref}</span>
                  </div>
                  <span className="pill neutral">Open</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
