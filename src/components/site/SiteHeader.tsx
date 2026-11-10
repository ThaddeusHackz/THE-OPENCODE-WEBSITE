'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SITE } from '@/lib/site';
import { BrandLink } from './BrandMark';
import { UiIcon } from './AppIcon';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-head">
      <div className="site-head-inner">
        <BrandLink />

        <nav className="site-nav" aria-label="Primary">
          {SITE.nav.map((item) => (
            <Link key={item.href} href={item.href} className="site-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-head-actions">
          <Link href="/opencode-studio" className="btn btn-quiet hide-sm">
            <UiIcon name="terminal" size={16} />
            OpenCode Studio
          </Link>
          <Link href={SITE.launchPath} className="btn btn-primary">
            Launch desktop
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className={`nav-toggle-bars ${open ? 'is-open' : ''}`} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div id="site-mobile-nav" className={`site-mobile-nav ${open ? 'is-open' : ''}`}>
        <nav aria-label="Mobile">
          {SITE.nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/opencode-studio">OpenCode Studio</Link>
          {SITE.legalNav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href={SITE.launchPath} className="btn btn-primary btn-block">
          Launch desktop
        </Link>
      </div>
    </header>
  );
}
