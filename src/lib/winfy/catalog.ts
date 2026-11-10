import { APP_PATHS } from '../apps';

export type WinfyTheme = 'ubuntu-winegui' | 'win11' | 'win10' | 'reactos';

export type DesktopWindowId =
  | 'opencode'
  | 'winegui'
  | 'terminal'
  | 'explorer'
  | 'notepad'
  | 'browser'
  | 'vlc'
  | 'format-factory'
  | 'tetris'
  | 'snake'
  | 'pong';

export type WinfyOsProfile = {
  id: string;
  label: string;
  shortName: string;
  subtitle: string;
  architecture: string;
  theme: WinfyTheme;
  defaultWindow: DesktopWindowId;
  description: string;
  upstreamUrl: string;
};

export type WinfyAppItem = {
  slug: string;
  name: string;
  category: 'os' | 'productivity' | 'media' | 'games' | 'social' | 'opencode';
  summary: string;
  osParam: string;
  targetWindow: DesktopWindowId;
  badge: string;
  accent: string;
  upstreamUrl: string;
  inBrowserPlayable: boolean;
};

export const DEFAULT_WINFY_OS = 'winegui_2_ubuntu-22-amd64';

export const WINFY_OS_PROFILES: WinfyOsProfile[] = [
  {
    id: 'winegui_2_ubuntu-22-amd64',
    label: 'WineGUI · Ubuntu 22.04 amd64',
    shortName: 'WineGUI Ubuntu 22',
    subtitle: 'Ubuntu 22.04 LTS + WineGUI + OpenCode CLI v2.2.5',
    architecture: 'linux/amd64 · Wine 9 + OpenCode',
    theme: 'ubuntu-winegui',
    defaultWindow: 'opencode',
    description:
      'Graphical Wine bottle workstation on Ubuntu 22.04 amd64 paired inside this website with the real server-side OpenCode CLI v2.2.5 on Vercel and Supabase Auth/Postgres.',
    upstreamUrl: 'https://www.winfy.net/runwine/index.php?os=winegui_2_ubuntu-22-amd64',
  },
  {
    id: 'winfy-windows11-basic-22.04.3-desktop-amd64',
    label: 'Wine Basic · Windows 11 Desktop Theme',
    shortName: 'Wine Basic (Win 11)',
    subtitle: '22.04.3 Desktop amd64 · Classic Wine Prefix',
    architecture: 'linux/amd64 · Fluent Theme',
    theme: 'win11',
    defaultWindow: 'winegui',
    description:
      'Run classic Wine tools (Explorer, CMD, Notepad, Web Browser) alongside OpenCode inside a Windows 11 styled web desktop.',
    upstreamUrl: 'https://www.winfy.net/runwine/start.php?os=winfy-windows11-basic-22.04.3-desktop-amd64&home=init',
  },
  {
    id: 'win-10-theme',
    label: 'Win 10 Theme · Ubuntu Fluent Desktop',
    shortName: 'Win 10 Theme',
    subtitle: 'GTK Windows 10 Makeover on Linux',
    architecture: 'linux/amd64 · GTK Fluent',
    theme: 'win10',
    defaultWindow: 'explorer',
    description:
      'Linux desktop workstation styled with the classic Windows 10 taskbar and file explorer layout.',
    upstreamUrl: 'https://www.winfy.net/win-10-theme/',
  },
  {
    id: 'reactos-online',
    label: 'ReactOS Online',
    shortName: 'ReactOS',
    subtitle: 'Open-source Windows NT architecture desktop',
    architecture: 'x86_64 · Classic NT shell',
    theme: 'reactos',
    defaultWindow: 'winegui',
    description:
      'Classic NT-inspired workspace theme with Explorer, CMD, Notepad, and OpenCode CLI access.',
    upstreamUrl: 'https://www.winfy.net/reactos-online/',
  },
];

export const WINFY_APPS: WinfyAppItem[] = [
  {
    slug: 'winegui-ubuntu-22',
    name: 'WineGUI Ubuntu 22',
    category: 'os',
    summary: 'Primary winegui_2_ubuntu-22-amd64 desktop workstation with Wine bottles, Explorer, CMD, Notepad, Browser & OpenCode.',
    osParam: 'winegui_2_ubuntu-22-amd64',
    targetWindow: 'winegui',
    badge: 'DEFAULT OS',
    accent: '#e95420',
    upstreamUrl: 'https://www.winfy.net/runwine/index.php?os=winegui_2_ubuntu-22-amd64',
    inBrowserPlayable: true,
  },
  {
    slug: 'opencode-agent',
    name: 'OpenCode CLI v2.2.5',
    category: 'opencode',
    summary: 'Real OpenCode v2.2.5 binary running on Vercel Functions with GitHub OAuth & RLS sessions stored in Supabase.',
    osParam: 'winegui_2_ubuntu-22-amd64',
    targetWindow: 'opencode',
    badge: 'REAL SERVER CLI',
    accent: '#22c55e',
    upstreamUrl: 'https://opencode.ai',
    inBrowserPlayable: true,
  },
  {
    slug: 'wine-basic',
    name: 'Wine Basic',
    category: 'os',
    summary: 'Windows compatibility layer online for classic apps and games with Windows 11 desktop skin.',
    osParam: 'winfy-windows11-basic-22.04.3-desktop-amd64',
    targetWindow: 'winegui',
    badge: 'WINE',
    accent: '#3b82f6',
    upstreamUrl: 'https://www.winfy.net/wine-online/',
    inBrowserPlayable: true,
  },
  {
    slug: 'notepad-online',
    name: 'Notepad++ Online',
    category: 'productivity',
    summary: 'Multi-tab code & text editor inside the desktop with unified OpenCode diff inspection and export.',
    osParam: 'winegui_2_ubuntu-22-amd64',
    targetWindow: 'notepad',
    badge: 'EDITOR',
    accent: '#84cc16',
    upstreamUrl: 'https://www.winfy.net/notepad-online/',
    inBrowserPlayable: true,
  },
  {
    slug: 'vlc-online',
    name: 'VLC Online',
    category: 'media',
    summary: 'Open and play local audio/video files right inside the Ubuntu/WineGUI desktop window.',
    osParam: 'winegui_2_ubuntu-22-amd64',
    targetWindow: 'vlc',
    badge: 'MEDIA',
    accent: '#f97316',
    upstreamUrl: 'https://www.winfy.net/vlc-online/',
    inBrowserPlayable: true,
  },
  {
    slug: 'format-factory',
    name: 'Format Factory Online',
    category: 'productivity',
    summary: 'In-browser image resize/convert (PNG, JPEG, WebP) and JSON/CSV/Base64 data utility.',
    osParam: 'winegui_2_ubuntu-22-amd64',
    targetWindow: 'format-factory',
    badge: 'CONVERTER',
    accent: '#06b6d4',
    upstreamUrl: 'https://www.winfy.net/format-factory-online/',
    inBrowserPlayable: true,
  },
  {
    slug: 'reactos',
    name: 'ReactOS',
    category: 'os',
    summary: 'Classic Windows NT-inspired desktop environment with CMD, Explorer, and WineGUI tools.',
    osParam: 'reactos-online',
    targetWindow: 'explorer',
    badge: 'NT SHELL',
    accent: '#0ea5e9',
    upstreamUrl: 'https://www.winfy.net/reactos-online/',
    inBrowserPlayable: true,
  },
  {
    slug: 'win-10-theme',
    name: 'Win Theme',
    category: 'os',
    summary: 'Linux workstation styled with the Windows 10 fluent taskbar and desktop launcher.',
    osParam: 'win-10-theme',
    targetWindow: 'explorer',
    badge: 'FLUENT UI',
    accent: '#2563eb',
    upstreamUrl: 'https://www.winfy.net/win-10-theme/',
    inBrowserPlayable: true,
  },
  {
    slug: 'tetris-cube',
    name: 'Tetris Cube',
    category: 'games',
    summary: 'Classic falling-block puzzle game playable directly inside a desktop window.',
    osParam: 'winegui_2_ubuntu-22-amd64',
    targetWindow: 'tetris',
    badge: 'PLAYABLE',
    accent: '#a855f7',
    upstreamUrl: 'https://www.winfy.net/tetris-cube/',
    inBrowserPlayable: true,
  },
  {
    slug: 'snake-candy',
    name: 'Snake Candy',
    category: 'games',
    summary: 'Retro arcade snake game inside the Ubuntu/WineGUI desktop with keyboard controls.',
    osParam: 'winegui_2_ubuntu-22-amd64',
    targetWindow: 'snake',
    badge: 'PLAYABLE',
    accent: '#ec4899',
    upstreamUrl: 'https://www.winfy.net/snake-candy-game/',
    inBrowserPlayable: true,
  },
  {
    slug: 'pong-candy',
    name: 'Pong Candy',
    category: 'games',
    summary: 'Classic two-paddle arcade Pong playable right in the desktop window.',
    osParam: 'winegui_2_ubuntu-22-amd64',
    targetWindow: 'pong',
    badge: 'PLAYABLE',
    accent: '#14b8a6',
    upstreamUrl: 'https://www.winfy.net/pong-candy-game/',
    inBrowserPlayable: true,
  },
  {
    slug: 'secure-browser',
    name: 'Winfy Web Browser',
    category: 'social',
    summary: 'Built-in web workspace browser for Twitfy, Cordfy, Instafy links, docs, and upstream Winfy session access.',
    osParam: 'winegui_2_ubuntu-22-amd64',
    targetWindow: 'browser',
    badge: 'BROWSER',
    accent: '#6366f1',
    upstreamUrl: 'https://www.winfy.net/',
    inBrowserPlayable: true,
  },
];

const OS_ALIASES: Record<string, string> = {
  winegui_2_ubuntu_22_amd64: 'winegui_2_ubuntu-22-amd64',
  ubuntu: 'winegui_2_ubuntu-22-amd64',
  winegui: 'winegui_2_ubuntu-22-amd64',
  'wine-basic': 'winfy-windows11-basic-22.04.3-desktop-amd64',
  windows11: 'winfy-windows11-basic-22.04.3-desktop-amd64',
  reactos: 'reactos-online',
  win10: 'win-10-theme',
};

export function resolveWinfyOs(raw?: string | null): WinfyOsProfile {
  const normalized = (raw ?? '').trim().slice(0, 120);
  const mapped = OS_ALIASES[normalized] ?? normalized;
  return WINFY_OS_PROFILES.find((item) => item.id === mapped) ?? WINFY_OS_PROFILES[0];
}

export function resolveWinfyWindow(raw?: string | null): DesktopWindowId | null {
  const normalized = (raw ?? '').trim().toLowerCase();
  const valid: DesktopWindowId[] = [
    'opencode',
    'winegui',
    'terminal',
    'explorer',
    'notepad',
    'browser',
    'vlc',
    'format-factory',
    'tetris',
    'snake',
    'pong',
  ];
  return (valid as string[]).includes(normalized) ? (normalized as DesktopWindowId) : null;
}

/**
 * Only permit relative in-site return paths for post-OAuth redirects.
 * Rejects protocol-relative URLs (`//evil.com`), schemes (`https:`), and CRLF.
 */
export function sanitizeNextPath(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '/';
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) return '/';
  if (/[\r\n\0]/.test(trimmed)) return '/';
  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') return '/';
    const allowedPaths = new Set([
      '/',
      '/runwine',
      '/runwine/index.php',
      '/runwine/start.php',
      '/terms-of-service',
      '/privacy-policy',
      ...APP_PATHS,
    ]);
    if (!allowedPaths.has(parsed.pathname)) return '/';
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return '/';
  }
}
