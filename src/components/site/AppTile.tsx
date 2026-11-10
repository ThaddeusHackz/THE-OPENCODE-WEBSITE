import Link from 'next/link';
import type { SiteApp } from '@/lib/apps';
import { AppIcon } from './AppIcon';

export function AppTile({ app, size = 104, showBadge = true }: { app: SiteApp; size?: number; showBadge?: boolean }) {
  return (
    <Link href={app.path} className="app-tile" title={app.short}>
      <span className="app-tile-icon">
        <AppIcon icon={app.icon} size={size} />
      </span>
      <span className="app-tile-name">
        {app.name}
        {showBadge && app.badge ? <span className="app-tile-badge">{app.badge}</span> : null}
      </span>
    </Link>
  );
}
