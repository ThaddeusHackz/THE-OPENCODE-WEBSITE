'use client';

import { useState } from 'react';
import { WINFY_APPS, type DesktopWindowId, type WinfyOsProfile } from '@/lib/winfy/catalog';
import type { ConfigStatus, ProbeResult } from '@/lib/types';

type BrowserWindowProps = {
  profile: WinfyOsProfile;
  config: ConfigStatus | null;
  probe: ProbeResult | null;
  onOpenWindow: (id: DesktopWindowId) => void;
};

type BrowserTab = 'directory' | 'diagnostics' | 'upstream-frame';

export function BrowserWindow({ profile, config, probe, onOpenWindow }: BrowserWindowProps) {
  const [tab, setTab] = useState<BrowserTab>('directory');
  const [address, setAddress] = useState(`winfy://runwine/index.php?os=${profile.id}`);

  const switchTab = (next: BrowserTab, urlLabel: string) => {
    setTab(next);
    setAddress(urlLabel);
  };

  return (
    <div className="browser-win">
      <div className="browser-bar">
        <div className="browser-tabs-row">
          <button
            type="button"
            className={tab === 'directory' ? 'active' : ''}
            onClick={() => switchTab('directory', `winfy://runwine/index.php?os=${profile.id}`)}
          >
            Winfy App Directory
          </button>
          <button
            type="button"
            className={tab === 'diagnostics' ? 'active' : ''}
            onClick={() => switchTab('diagnostics', 'https://the-opencode-website-poc.vercel.app/api/config')}
          >
            Vercel + Supabase Status
          </button>
          <button
            type="button"
            className={tab === 'upstream-frame' ? 'active' : ''}
            onClick={() => switchTab('upstream-frame', profile.upstreamUrl)}
          >
            Upstream Winfy Frame
          </button>
        </div>
        <div className="browser-address">
          <input value={address} readOnly aria-label="Browser address bar" />
          <a className="win-btn small" href={profile.upstreamUrl} target="_blank" rel="noopener noreferrer">
            Open External
          </a>
        </div>
      </div>

      <div className="browser-viewport">
        {tab === 'directory' && (
          <div className="browser-page">
            <h3>Winfy Web Workspace Bookmarks</h3>
            <p className="muted-sm">
              Every app below opens directly inside this website without leaving your Vercel + Supabase session.
            </p>
            <div className="browser-app-grid">
              {WINFY_APPS.map((app) => (
                <button
                  key={app.slug}
                  type="button"
                  className="browser-app-card"
                  onClick={() => onOpenWindow(app.targetWindow)}
                >
                  <span className="badge-mini" style={{ borderColor: app.accent }}>{app.badge}</span>
                  <strong>{app.name}</strong>
                  <span>{app.summary}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'diagnostics' && (
          <div className="browser-page">
            <h3>Live Deployment &amp; Supabase Diagnostics</h3>
            <pre className="diag-pre">
              {JSON.stringify(
                {
                  osProfile: profile.id,
                  runtimeProbe: probe,
                  config: config
                    ? {
                        supabaseConfigured: config.supabaseConfigured,
                        githubOauthEnabled: config.githubOauthEnabled,
                        githubMode: config.githubMode,
                        model: config.model,
                        vercelOidcConfigured: config.vercelOidcConfigured,
                        modelKeyConfigured: config.modelKeyConfigured,
                        missing: config.missing,
                      }
                    : null,
                },
                null,
                2,
              )}
            </pre>
          </div>
        )}

        {tab === 'upstream-frame' && (
          <div className="browser-frame-wrap">
            <div className="win-alert info">
              Note: Upstream <code>winfy.net</code> may block third-party iframe embedding via{' '}
              <code>X-Frame-Options</code> / CSP and terminates inactive sessions after 5 minutes. If the frame
              below stays blank, click <strong>Open External</strong> above.
            </div>
            <iframe
              src={profile.upstreamUrl}
              title="Upstream Winfy RunWine Session"
              className="browser-iframe"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        )}
      </div>
    </div>
  );
}
