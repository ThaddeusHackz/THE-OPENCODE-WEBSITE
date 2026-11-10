import type { Metadata } from 'next';
import Link from 'next/link';
import { APPS, GAMES } from '@/lib/apps';
import { FEATURES, SITE, SYSTEMS } from '@/lib/site';
import { AppTile } from '@/components/site/AppTile';
import { AppIcon, UiIcon } from '@/components/site/AppIcon';

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.longDescription,
  alternates: { canonical: '/' },
};

const RECOMMENDED = ['opencode-studio', 'wine-online', 'tetris-cube'];

export default function HomePage() {
  const recommended = RECOMMENDED.map((slug) => APPS.find((app) => app.slug === slug)).filter(
    (app): app is (typeof APPS)[number] => Boolean(app),
  );

  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="eyebrow">
            <span className="dot" aria-hidden="true" />
            Browser workspace · no install, no plugin
          </p>
          <h1>
            Our secure services &amp; <em>win systems:</em>
          </h1>
          <p className="hero-lead">
            Open one link and you are on a desktop: media tools, image conversion, classic arcade games, a terminal
            and the real OpenCode coding agent, all running inside this tab.
          </p>
          <div className="hero-actions">
            <Link href={SITE.launchPath} className="btn btn-primary btn-lg">
              Launch the desktop
              <UiIcon name="arrow" size={17} />
            </Link>
            <Link href={SITE.openCodePath} className="btn btn-outline btn-lg">
              <UiIcon name="terminal" size={17} />
              Open OpenCode Studio
            </Link>
          </div>
          <ul className="hero-facts">
            <li>
              <UiIcon name="check" size={14} /> Free to explore, no account wall
            </li>
            <li>
              <UiIcon name="check" size={14} /> Real OpenCode 2.2.5 binary
            </li>
            <li>
              <UiIcon name="check" size={14} /> Files stay on your device
            </li>
            <li>
              <UiIcon name="check" size={14} /> Sessions saved in Postgres with RLS
            </li>
          </ul>
        </div>
      </section>

      <section id="apps" className="section-tiles" aria-label="Apps and systems">
        <div className="container">
          <div className="tile-grid">
            {APPS.map((app) => (
              <AppTile key={app.slug} app={app} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-banner">
        <div className="container">
          <Link href={SITE.launchPath} className="banner-link" aria-label="Launch the browser workspace">
            <img src="/brand/banner.jpg" alt="Winfy browser workspace illustration" width={1536} height={462} />
            <span className="banner-hint">
              Start the workspace
              <UiIcon name="arrow" size={15} />
            </span>
          </Link>
        </div>
      </section>

      <section id="systems" className="section section-cream">
        <div className="container">
          <div className="section-head">
            <span className="section-kicker">Win systems</span>
            <h2>Four desktops, one link</h2>
            <p>
              Pick the shell you like best. Switching a profile never reloads the page and never closes a window, so
              your work stays exactly where you left it.
            </p>
          </div>
          <div className="system-grid">
            {SYSTEMS.map((system) => (
              <article key={system.id} className={`system-card accent-${system.accent}`}>
                <div className="system-preview" aria-hidden="true">
                  <i className="sp-win" />
                  <i className="sp-win-2" />
                  <i className="sp-bar" />
                </div>
                <div className="system-body">
                  <span className="system-label">{system.label}</span>
                  <h3>{system.name}</h3>
                  <p>{system.summary}</p>
                  <Link href={`/runwine?os=${encodeURIComponent(system.id)}&desktop=1`} className="btn-ghost-link">
                    Open this desktop
                    <UiIcon name="arrow" size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="games" className="section">
        <div className="container">
          <div className="section-head">
            <span className="section-kicker">Games</span>
            <h2>Three classics, zero downloads</h2>
            <p>
              Short breaks between builds. Every game is written on a canvas in this page, so it starts instantly and
              runs at your screen&apos;s refresh rate.
            </p>
          </div>
          <div className="game-grid">
            {GAMES.map((game) => (
              <Link key={game.slug} href={game.path} className="game-card">
                <span className="app-tile-icon">
                  <AppIcon icon={game.icon} size={64} />
                </span>
                <span className="game-card-body">
                  <h3>{game.name}</h3>
                  <p>{game.short}</p>
                  <span>Play now →</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="section section-cream">
        <div className="container">
          <div className="section-head center">
            <span className="section-kicker">Features</span>
            <h2>Built to be used, not demoed</h2>
            <p>
              Every claim on this page is something the deployment actually does. If a part of the stack is not
              configured, the interface says so instead of pretending.
            </p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="feature-card">
                <span className="feature-icon">
                  <UiIcon name={feature.icon} size={22} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="section-kicker">Recommended</span>
            <h2>Winfy apps recommended</h2>
            <p>Start with the three that show what the workspace can do.</p>
          </div>
          <div className="rec-grid">
            {recommended.map((app) => (
              <article key={app.slug} className="rec-card">
                <div className="rec-shot">
                  <img src={app.preview} alt={app.previewAlt} loading="lazy" width={1280} height={800} />
                </div>
                <div className="rec-body">
                  <h3>{app.name}</h3>
                  <p>{app.short}</p>
                  <Link href={app.path} className="btn-ghost-link">
                    Open {app.name}
                    <UiIcon name="arrow" size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <section className="cta-band">
          <h2>Your workspace is one click away</h2>
          <p>
            No installation, no sign-up to look around. Sign in with GitHub only when you want OpenCode to work on one
            of your own repositories.
          </p>
          <div className="hero-actions">
            <Link href={SITE.launchPath} className="btn btn-primary btn-lg">
              Launch the desktop
              <UiIcon name="arrow" size={17} />
            </Link>
            <Link href="/wine-online" className="btn btn-on-dark btn-lg">
              About Wine Basic
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
