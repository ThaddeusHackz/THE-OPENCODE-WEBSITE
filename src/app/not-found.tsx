import Link from 'next/link';
import './site.css';
import { APPS } from '@/lib/apps';
import { SITE } from '@/lib/site';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { AppTile } from '@/components/site/AppTile';
import { UiIcon } from '@/components/site/AppIcon';

export const metadata = {
  title: { absolute: `Page not found — ${SITE.name}` },
};

export default function NotFound() {
  return (
    <div className="site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <div className="container">
          <div className="notfound">
            <p className="code">404</p>
            <h1>This page is not on the desktop</h1>
            <p>
              The link you followed does not exist here. Every app in the workspace is one tile away, or you can start
              the desktop directly.
            </p>
            <div className="hero-actions">
              <Link href="/" className="btn btn-primary btn-lg">
                Back to home
              </Link>
              <Link href={SITE.launchPath} className="btn btn-outline btn-lg">
                Launch the desktop
                <UiIcon name="arrow" size={17} />
              </Link>
            </div>
            <div className="notfound-grid">
              {APPS.slice(0, 6).map((app) => (
                <AppTile key={app.slug} app={app} size={72} showBadge={false} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
