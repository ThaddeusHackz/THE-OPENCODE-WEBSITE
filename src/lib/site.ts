/**
 * Single source of truth for the public marketing site (brand, navigation and
 * chrome copy). Keep every user-visible string that repeats across pages here so
 * the header, footer, metadata and structured data can never drift apart.
 */

export const SITE = {
  name: 'Winfy',
  domain: 'winfy.net',
  tagline: 'Run wine online for windows games and apps',
  shortDescription:
    'Secure Win apps and a full online workspace in your browser: a Windows-style desktop, media and image tools, classic games, and the real OpenCode coding agent.',
  longDescription:
    'Winfy is a browser workspace. Open one link and you get a Windows-style desktop with media tools, image conversion, classic arcade games, a terminal and the real OpenCode CLI — no install, no plugin, no download.',
  url: 'https://the-opencode-website-poc.vercel.app',
  repoUrl: 'https://github.com/ThaddeusHackz/THE-OPENCODE-WEBSITE',
  launchPath: '/workspace?desktop=1',
  launchLoginPath: '/workspace',
  /** Public app page. Its launch button opens the real window in /workspace. */
  openCodePath: '/opencode-studio',
  openCodeWindowPath: '/workspace?window=opencode&desktop=1',
  desktopPath: '/workspace',
  copyrightYear: 2026,
  disclaimer:
    'Independent technical project. Not affiliated with, endorsed by or operated by OpenCode, Anomaly, Winfy/ODGroup, OnWorks or OffiDocs.',
  supportEmail: 'support@winfy.net',
  nav: [
    { label: 'Apps', href: '/#apps' },
    { label: 'Windows systems', href: '/#systems' },
    { label: 'Games', href: '/#games' },
    { label: 'Features', href: '/#features' },
  ],
  legalNav: [
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
  ],
  // Honest description of the platform that serves every page. Rendered as the
  // small "powered by" strip in the footer that mirrors the store badges on the
  // reference portal without inventing browser-extension listings we do not ship.
  stack: [
    { label: 'Next.js 16', detail: 'app router' },
    { label: 'Vercel Functions', detail: 'server runtime' },
    { label: 'Supabase', detail: 'auth + Postgres' },
    { label: 'OpenCode', detail: 'CLI v2.2.5' },
  ],
} as const;

export const FEATURES = [
  {
    title: 'A real desktop in the browser',
    body: 'Windows-style windows, a dock, drag, resize, minimize and maximize. Everything is HTML and canvas inside one page — nothing to install, nothing to configure, and it opens on a phone as well as a desktop.',
    icon: 'desktop',
  },
  {
    title: 'Your own Windows and Linux profiles',
    body: 'Switch the workspace between WineGUI on Ubuntu 22.04, a Windows 11 basic desktop, a classic Windows 10 theme and a ReactOS-style shell. The profile decides the wallpaper, the taskbar and the window chrome.',
    icon: 'layers',
  },
  {
    title: 'The actual OpenCode agent',
    body: 'The coding window talks to a real opencode 2.2.5 binary running inside a Vercel Function on an ephemeral copy of your repository. Output, diffs and failures are returned as they happened; nothing is simulated.',
    icon: 'terminal',
  },
  {
    title: 'Files that never leave the tab',
    body: 'VLC-style playback, image conversion to PNG, JPEG and WebP, JSON formatting and Base64 both run on your device. Media and images are read locally with object URLs, so your files are not uploaded anywhere.',
    icon: 'shield',
  },
  {
    title: 'Sessions you can come back to',
    body: 'Sign in with GitHub through Supabase Auth and every prompt, reply and diff summary is stored in Postgres behind row-level security. Close the tab, return later, and the conversation is still there.',
    icon: 'history',
  },
  {
    title: 'Free, no account wall',
    body: 'Browsing, the games, the tools and the terminal need no sign-in at all. An account is only required when you want OpenCode to work on one of your own repositories.',
    icon: 'spark',
  },
] as const;

export const SYSTEMS = [
  {
    id: 'winegui_2_ubuntu-22-amd64',
    name: 'WineGUI · Ubuntu 22.04',
    label: 'linux/amd64 · default',
    summary:
      'The default workstation. A Wine-style launcher, application folder and a full Ubuntu-flavoured taskbar, with every tool in this site one click away.',
    accent: 'ubuntu',
  },
  {
    id: 'winfy-windows11-basic-22.04.3-desktop-amd64',
    name: 'Windows 11 basic',
    label: 'windows 11 · basic',
    summary:
      'The Windows 11 look: centred taskbar, rounded windows and the fluent colour accents, running on the same in-browser workspace.',
    accent: 'win11',
  },
  {
    id: 'win-10-theme',
    name: 'Windows 10 theme',
    label: 'windows 10 · theme',
    summary:
      'The familiar Windows 10 layout with a left-aligned taskbar, square-ish window controls and the classic blue selection colour.',
    accent: 'win10',
  },
  {
    id: 'reactos-online',
    name: 'ReactOS',
    label: 'reactos · classic',
    summary:
      'A classic NT-inspired shell with a compact start menu, Explorer and a grey taskbar for anyone who wants the 2000s back.',
    accent: 'reactos',
  },
] as const;
