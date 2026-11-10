import Link from 'next/link';
import { SITE } from '@/lib/site';
import { APPS } from '@/lib/apps';
import { BrandMark } from './BrandMark';
import { AppIcon, UiIcon } from './AppIcon';

const COLUMN_APPS = APPS.filter((app) => app.category !== 'games').slice(0, 6);
const COLUMN_GAMES = APPS.filter((app) => app.category === 'games');

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="site-foot-inner">
        <div className="site-foot-grid">
          <div className="site-foot-brand">
            <Link href="/" className="site-foot-logo">
              <BrandMark size={40} />
              <span>
                <strong>{SITE.name}</strong>
                <em>{SITE.tagline}</em>
              </span>
            </Link>
            <p>
              One link, a full workspace: a Windows-style desktop, media and image tools, classic games and the real
              OpenCode coding agent — all inside your browser.
            </p>
            <div className="site-foot-cta">
              <Link href={SITE.launchPath} className="btn btn-primary">
                Launch desktop
              </Link>
              <Link href={SITE.openCodePath} className="btn btn-outline btn-on-dark">
                Open OpenCode
              </Link>
            </div>
          </div>

          <nav className="site-foot-col" aria-label="Apps">
            <h2>Apps</h2>
            {COLUMN_APPS.map((app) => (
              <Link key={app.slug} href={app.path}>
                {app.name}
              </Link>
            ))}
          </nav>

          <nav className="site-foot-col" aria-label="Games">
            <h2>Games</h2>
            {COLUMN_GAMES.map((app) => (
              <Link key={app.slug} href={app.path}>
                {app.name}
              </Link>
            ))}
            <Link href="/#systems">Windows systems</Link>
            <Link href="/#features">Features</Link>
          </nav>

          <div className="site-foot-col">
            <h2>Platform</h2>
            {SITE.stack.map((item) => (
              <span key={item.label} className="site-foot-stack">
                <strong>{item.label}</strong>
                <em>{item.detail}</em>
              </span>
            ))}
          </div>
        </div>

        <div className="site-foot-strip">
          {APPS.slice(0, 6).map((app) => (
            <Link key={app.slug} href={app.path} className="site-foot-chip">
              <AppIcon icon={app.icon} size={26} />
              {app.name}
            </Link>
          ))}
        </div>

        <div className="site-foot-bottom">
          <p>
            © {SITE.copyrightYear} {SITE.name}. All rights reserved.
          </p>
          <div className="site-foot-legal">
            {SITE.legalNav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer">
              <UiIcon name="github" size={15} />
              Source
            </a>
          </div>
        </div>
        <p className="site-foot-disclaimer">{SITE.disclaimer}</p>
      </div>
    </footer>
  );
}
