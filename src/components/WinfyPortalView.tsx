'use client';

import { useState } from 'react';
import { WINFY_APPS, WINFY_OS_PROFILES, type DesktopWindowId } from '@/lib/winfy/catalog';
import type { ConfigStatus, ProbeResult } from '@/lib/types';
import { WindowAppIcon, WinfyBrandLogo } from './WinfyIcons';

type WinfyPortalViewProps = {
  config: ConfigStatus | null;
  probe: ProbeResult | null;
  onLaunchRunWine: (osId: string, windowId?: DesktopWindowId) => void;
  onOpenDesktopDirect: (osId: string, windowId?: DesktopWindowId) => void;
};

const CATEGORIES: Array<{ id: 'all' | 'os' | 'opencode' | 'productivity' | 'media' | 'games' | 'social'; label: string }> = [
  { id: 'all', label: 'All Apps & Systems' },
  { id: 'os', label: 'Wine & OS' },
  { id: 'opencode', label: 'OpenCode + Vercel' },
  { id: 'productivity', label: 'Editors & Tools' },
  { id: 'media', label: 'Media' },
  { id: 'games', label: 'Games' },
  { id: 'social', label: 'Web Browser' },
];

export function WinfyPortalView({
  config,
  probe,
  onLaunchRunWine,
  onOpenDesktopDirect,
}: WinfyPortalViewProps) {
  const [category, setCategory] = useState<'all' | 'os' | 'opencode' | 'productivity' | 'media' | 'games' | 'social'>('all');

  const visibleApps =
    category === 'all' ? WINFY_APPS : WINFY_APPS.filter((item) => item.category === category);

  return (
    <div className="winfy-portal">
      <section className="portal-hero">
        <div className="portal-hero-copy">
          <div className="portal-kicker">
            <WinfyBrandLogo size={24} />
            <span>Winfy RunWine + OpenCode v2.2.5 · Vercel &amp; Supabase</span>
          </div>
          <h2>Our secure services &amp; win systems — all inside this website</h2>
          <p>
            Launch <code>winegui_2_ubuntu-22-amd64</code>, Wine Basic, ReactOS, Notepad++, VLC, Format Factory,
            classic arcade games, and the real <strong>OpenCode v2.2.5 CLI</strong> backed by Vercel Functions and
            Supabase Auth/Postgres RLS.
          </p>
          <div className="portal-cta-row">
            <button
              type="button"
              className="win-btn primary large"
              onClick={() => onLaunchRunWine('winegui_2_ubuntu-22-amd64', 'opencode')}
            >
              Launch RunWine (winegui_2_ubuntu-22-amd64)
            </button>
            <button
              type="button"
              className="win-btn large"
              onClick={() => onOpenDesktopDirect('winegui_2_ubuntu-22-amd64', 'opencode')}
            >
              Enter Ubuntu 22 + WineGUI Desktop Immediately
            </button>
          </div>
        </div>

        <div className="portal-status-card">
          <h3>Live Stack Status</h3>
          <ul>
            <li>
              <span>OpenCode Binary</span>
              <strong>{probe?.available ? probe.versionOutput : 'Check via RunWine'}</strong>
            </li>
            <li>
              <span>Supabase Auth / RLS</span>
              <strong>{config?.supabaseConfigured ? 'Configured' : 'Needs env'}</strong>
            </li>
            <li>
              <span>GitHub OAuth</span>
              <strong>{config?.githubOauthEnabled ? 'Enabled' : 'Checking / Off'}</strong>
            </li>
            <li>
              <span>Default Model</span>
              <code>{config?.model ?? 'vercel/reflection/beam-free'}</code>
            </li>
          </ul>
        </div>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <h3>RunWine OS Environments</h3>
          <span className="muted-sm">Exact ?os= profiles supported directly inside /runwine/index.php</span>
        </div>
        <div className="os-cards-grid">
          {WINFY_OS_PROFILES.map((os) => (
            <div key={os.id} className="os-card">
              <div className="os-card-top">
                <span className="badge-os">{os.architecture}</span>
                <code>?os={os.id}</code>
              </div>
              <h4>{os.label}</h4>
              <p>{os.description}</p>
              <div className="btn-row">
                <button
                  type="button"
                  className="win-btn primary small"
                  onClick={() => onLaunchRunWine(os.id, os.defaultWindow)}
                >
                  Start RunWine
                </button>
                <button
                  type="button"
                  className="win-btn small"
                  onClick={() => onOpenDesktopDirect(os.id, os.defaultWindow)}
                >
                  Open Desktop
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <h3>Winfy Online Apps &amp; OpenCode Tools</h3>
          <div className="cat-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cat-pill ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="apps-grid">
          {visibleApps.map((app) => (
            <div key={app.slug} className="app-card">
              <div className="app-card-head">
                <WindowAppIcon id={app.targetWindow} size={34} />
                <div>
                  <span className="badge-mini" style={{ borderColor: app.accent }}>{app.badge}</span>
                  <h4>{app.name}</h4>
                </div>
              </div>
              <p>{app.summary}</p>
              <div className="btn-row">
                <button
                  type="button"
                  className="win-btn primary small"
                  onClick={() => onOpenDesktopDirect(app.osParam, app.targetWindow)}
                >
                  Run in Website
                </button>
                <button
                  type="button"
                  className="win-btn small"
                  onClick={() => onLaunchRunWine(app.osParam, app.targetWindow)}
                >
                  RunWine Boot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="portal-section">
        <h3>Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>WineGUI on Ubuntu 22.04</h4>
            <p>
              Full WineGUI graphical desktop launcher built natively into Next.js, preserving Winfy&apos;s classic
              Windows Explorer, CMD Shell, Notepad++, and Browser workflow.
            </p>
          </div>
          <div className="feature-card">
            <h4>Real OpenCode CLI v2.2.5</h4>
            <p>
              Executes the real <code>@opencode/cli-linux-x64</code> binary in ephemeral Vercel Functions against
              your authorized GitHub repositories — never a simulated reply.
            </p>
          </div>
          <div className="feature-card">
            <h4>Supabase Auth &amp; Postgres RLS</h4>
            <p>
              Sign in with GitHub via Supabase Auth and persist coding sessions, prompts, and unified diffs securely
              under row-level security policies.
            </p>
          </div>
          <div className="feature-card">
            <h4>Extra Desktop Themes</h4>
            <p>
              Switch instantaneously between Ubuntu 22 WineGUI, Windows 11 Basic, Win 10 Fluent Theme, and ReactOS
              shell chrome right inside the browser.
            </p>
          </div>
          <div className="feature-card">
            <h4>214 Normal Free Models</h4>
            <p>
              Choose from 214 zero-cost chat models across 45 providers validated against OpenCode v2.2.5, with
              keyless Vercel AI Gateway OIDC support.
            </p>
          </div>
          <div className="feature-card">
            <h4>Browser Tools &amp; Arcade</h4>
            <p>
              Includes client-side VLC media playback, Format Factory image/JSON conversion, Notepad++ diff review,
              and playable Tetris Cube, Snake Candy, and Pong Candy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
