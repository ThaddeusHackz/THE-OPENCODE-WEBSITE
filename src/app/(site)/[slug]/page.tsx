import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { APPS, CATEGORY_LABELS, getApp, launchHref, relatedApps } from '@/lib/apps';
import { SITE, SYSTEMS } from '@/lib/site';
import { AppIcon, UiIcon } from '@/components/site/AppIcon';

type AppPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return APPS.map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }: AppPageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) return { title: 'App not found' };
  return {
    title: app.name,
    description: `${app.short}. ${app.lead} Runs in the browser with no installation.`,
    alternates: { canonical: app.path },
    openGraph: {
      title: app.name,
      description: app.short,
      url: app.path,
      type: 'website',
    },
  };
}

export default async function AppPage({ params }: AppPageProps) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();

  const system = SYSTEMS.find((item) => item.id === app.launch.os);
  const related = relatedApps(app);
  const href = launchHref(app);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/#apps">Apps</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{app.name}</span>
          </nav>

          <div className="app-hero">
            <div className="app-hero-copy">
              <div className="chip-row">
                <span className="chip chip-solid">{CATEGORY_LABELS[app.category]}</span>
                <span className="chip">Runs in the browser</span>
                <span className="chip">No install</span>
              </div>
              <h1>{app.name}</h1>
              <p className="app-lead">{app.lead}</p>
              <p className="app-sub">{app.short}.</p>
            </div>

            <div className="launch-card">
              <span className="app-tile-icon">
                <AppIcon icon={app.icon} size={96} />
              </span>
              <h2>Launch {app.name}</h2>
              <p>Opens inside the {system?.name ?? 'workspace'} desktop. Nothing to download.</p>
              <Link href={href} className="btn btn-primary btn-lg">
                Launch now
                <UiIcon name="arrow" size={17} />
              </Link>
              <div className="launch-card-links">
                <Link href={`/workspace?os=${encodeURIComponent(app.launch.os)}&desktop=1`}>Full desktop</Link>
                <Link href="/opencode-studio">OpenCode Studio</Link>
              </div>
            </div>
          </div>

          <figure className="shot-frame">
            <div className="shot-bar" aria-hidden="true">
              <span className="shot-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="shot-url">
                {SITE.domain}
                {app.path}
              </span>
            </div>
            <img src={app.preview} alt={app.previewAlt} width={1280} height={800} />
          </figure>

          <div className="app-body">
            <div className="prose">
              <h2>Software Description:</h2>
              {app.description.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}

              <h2>Key Features:</h2>
              <ol className="steps">
                {app.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ol>

              <h2>System Requirements:</h2>
              <ul className="checks">
                {app.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <aside className="aside">
              <section className="aside-card">
                <h2>Limitations</h2>
                <ul>
                  {app.limitations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              {system ? (
                <section className="aside-card aside-card-tint">
                  <h2>System profile</h2>
                  <ul>
                    <li>
                      <strong>{system.name}</strong>
                    </li>
                    <li>{system.label}</li>
                    <li>
                      <Link href={`/workspace?os=${encodeURIComponent(system.id)}&desktop=1`}>Switch to this desktop →</Link>
                    </li>
                  </ul>
                </section>
              ) : null}

              <nav className="aside-card" aria-label="More apps">
                <h2>More apps</h2>
                <div className="related-list">
                  {related.map((item) => (
                    <Link key={item.slug} href={item.path}>
                      <AppIcon icon={item.icon} size={30} />
                      <span>
                        <span>{item.name}</span>
                        <em>{CATEGORY_LABELS[item.category]}</em>
                      </span>
                    </Link>
                  ))}
                </div>
              </nav>
            </aside>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="cta-band">
          <h2>Launch {app.name} in one click</h2>
          <p>The workspace opens instantly in this tab. Sign in with GitHub only if you want the coding agent.</p>
          <div className="hero-actions">
            <Link href={href} className="btn btn-primary btn-lg">
              Launch {app.name}
              <UiIcon name="arrow" size={17} />
            </Link>
            <Link href="/#apps" className="btn btn-on-dark btn-lg">
              Browse all apps
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
