'use client';

import type { DesktopWindowId, WinfyOsProfile } from '@/lib/winfy/catalog';

type WineGuiWindowProps = {
  profile: WinfyOsProfile;
  onOpenWindow: (id: DesktopWindowId) => void;
  onSwitchOs: (osId: string) => void;
};

const WINE_BOTTLES = [
  {
    name: 'Default WineGUI Bottle (Win64)',
    prefix: '/home/user/.wine',
    arch: 'win64 · Windows 10',
    apps: ['winefile.exe', 'cmd.exe', 'notepad.exe', 'iexplore.exe'],
  },
  {
    name: 'Winfy Apps Bottle',
    prefix: '/home/user/.local/share/wineprefixes/winfy-apps',
    arch: 'win64 · Direct3D',
    apps: ['notepad++.exe', 'vlc.exe', 'FormatFactory.exe'],
  },
  {
    name: 'OpenCode Linux Bridge',
    prefix: '/var/task/node_modules/@opencode/cli-linux-x64',
    arch: 'linux/amd64 · glibc',
    apps: ['opencode v2.2.5 (--standalone)'],
  },
];

export function WineGuiWindow({ profile, onOpenWindow, onSwitchOs }: WineGuiWindowProps) {
  return (
    <div className="winegui-win">
      <div className="winegui-banner">
        <div>
          <span className="badge-os">{profile.id}</span>
          <h3>WineGUI · {profile.label}</h3>
          <p>{profile.description}</p>
        </div>
        <div className="winegui-actions">
          <button className="win-btn primary" type="button" onClick={() => onOpenWindow('opencode')}>
            Open OpenCode CLI
          </button>
          <a
            className="win-btn"
            href={profile.upstreamUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Upstream OffiDocs Session
          </a>
        </div>
      </div>

      <div className="winegui-section">
        <h4>Installed Classic Tools (Launch inside Website)</h4>
        <div className="winegui-tool-grid">
          <button type="button" className="winegui-tool-card" onClick={() => onOpenWindow('explorer')}>
            <strong>Windows Explorer</strong>
            <span>Browse C:\ Wine drive, /home/user &amp; GitHub Repos</span>
          </button>
          <button type="button" className="winegui-tool-card" onClick={() => onOpenWindow('terminal')}>
            <strong>CMD / Ubuntu Shell</strong>
            <span>Run real opencode status, models &amp; runtime probes</span>
          </button>
          <button type="button" className="winegui-tool-card" onClick={() => onOpenWindow('notepad')}>
            <strong>Notepad++ Online</strong>
            <span>Multi-tab code editor &amp; OpenCode patch viewer</span>
          </button>
          <button type="button" className="winegui-tool-card" onClick={() => onOpenWindow('browser')}>
            <strong>Web Browser</strong>
            <span>In-desktop browser &amp; live Winfy bridge</span>
          </button>
          <button type="button" className="winegui-tool-card" onClick={() => onOpenWindow('vlc')}>
            <strong>VLC Online</strong>
            <span>Play local audio &amp; video files in-browser</span>
          </button>
          <button type="button" className="winegui-tool-card" onClick={() => onOpenWindow('format-factory')}>
            <strong>Format Factory</strong>
            <span>Convert PNG/JPEG/WebP &amp; format JSON/Base64</span>
          </button>
        </div>
      </div>

      <div className="winegui-section">
        <h4>Configured Prefixes &amp; Runtime Bottles</h4>
        <div className="bottle-list">
          {WINE_BOTTLES.map((bottle) => (
            <div key={bottle.name} className="bottle-card">
              <div className="bottle-head">
                <strong>{bottle.name}</strong>
                <span>{bottle.arch}</span>
              </div>
              <code>{bottle.prefix}</code>
              <div className="bottle-tags">
                {bottle.apps.map((app) => (
                  <span key={app}>{app}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="winegui-section">
        <h4>Switch Winfy Desktop Profile</h4>
        <div className="btn-row">
          <button
            type="button"
            className={`win-btn small ${profile.id === 'winegui_2_ubuntu-22-amd64' ? 'primary' : ''}`}
            onClick={() => onSwitchOs('winegui_2_ubuntu-22-amd64')}
          >
            Ubuntu 22 WineGUI
          </button>
          <button
            type="button"
            className={`win-btn small ${profile.id === 'winfy-windows11-basic-22.04.3-desktop-amd64' ? 'primary' : ''}`}
            onClick={() => onSwitchOs('winfy-windows11-basic-22.04.3-desktop-amd64')}
          >
            Windows 11 Basic
          </button>
          <button
            type="button"
            className={`win-btn small ${profile.id === 'win-10-theme' ? 'primary' : ''}`}
            onClick={() => onSwitchOs('win-10-theme')}
          >
            Win 10 Theme
          </button>
          <button
            type="button"
            className={`win-btn small ${profile.id === 'reactos-online' ? 'primary' : ''}`}
            onClick={() => onSwitchOs('reactos-online')}
          >
            ReactOS
          </button>
        </div>
      </div>

      <div className="win-alert info">
        <strong>Architecture note:</strong> All OpenCode CLI runs, GitHub repository reads, and Supabase sessions
        inside this website execute natively on Vercel Functions. Upstream <code>winfy.net</code> (OffiDocs) Wine
        containers are external 5-minute idle-timeout VNC sessions; use the button above if you specifically need to
        launch a raw Windows <code>.exe</code> on OffiDocs.
      </div>
    </div>
  );
}
