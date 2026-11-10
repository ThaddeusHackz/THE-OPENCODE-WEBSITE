import type { DesktopWindowId } from './winfy/catalog';

/**
 * Public app catalog for the marketing site.
 *
 * Every entry maps to something that actually runs in the browser workspace
 * (`/workspace`), so the tile grid, the app pages and the launch buttons can never
 * point at software this project does not ship.
 */
export type AppCategory = 'systems' | 'media' | 'tools' | 'games' | 'agent';

export type SiteApp = {
  /** Public path of the app page, matching the reference portal's flat URLs. */
  slug: string;
  path: string;
  /** Card label. */
  name: string;
  category: AppCategory;
  icon: string;
  /** One line used under the tile label and in related-app lists. */
  short: string;
  /** Lead sentence at the top of the app page. */
  lead: string;
  description: string[];
  features: string[];
  requirements: string[];
  limitations: string[];
  /** What the launch button opens inside the workspace. */
  launch: { window: DesktopWindowId; os: string };
  /** Real screenshot of the running window, captured from this deployment. */
  preview: string;
  previewAlt: string;
  badge?: string;
};

const DEFAULT_OS = 'winegui_2_ubuntu-22-amd64';

export const APPS: SiteApp[] = [
  {
    slug: 'wine-online',
    path: '/wine-online',
    name: 'Wine Basic',
    category: 'systems',
    icon: 'wine',
    short: 'The full Windows-style workspace',
    lead: 'Enjoy our wine emulator for windows online apps and games:',
    description: [
      'Wine Basic is the entry point to the whole workspace. It opens a winegui_2_ubuntu-22-amd64 desktop in your browser: a Wine-style launcher, an application folder, a taskbar, a start menu and a dock, all drawn with HTML, CSS and canvas instead of a remote screen.',
      'Because nothing is streamed from a virtual machine, the workspace starts instantly and stays responsive on a slow connection. From the launcher you can open the media player, the image converter, the editor, the terminal, the arcade games and the OpenCode coding window, and every one of them is a real program running in this tab.',
    ],
    features: [
      'A complete desktop shell with drag, snap, minimize, maximize and window stacking.',
      'Four switchable system profiles: WineGUI on Ubuntu 22.04, Windows 11 basic, Windows 10 theme and ReactOS.',
      'A Wine-style application folder that launches every bundled program.',
      'An activity drawer, desktop shortcuts and a live clock, exactly like a real workstation.',
      'Works on desktop, tablet and phone without installing a client or a browser extension.',
    ],
    requirements: [
      'Any modern browser with JavaScript enabled (Chrome, Edge, Firefox or Safari).',
      'A screen at least 360 pixels wide; a keyboard is optional but recommended.',
      'No account, plugin or download is required to explore the desktop.',
    ],
    limitations: [
      'This is a Windows-style interface written for the web, not a virtual machine: it cannot execute arbitrary .exe installers.',
      'The desktop state is kept per tab and is intentionally reset on reload.',
    ],
    launch: { window: 'winegui', os: DEFAULT_OS },
    preview: '/previews/wine-online.jpg',
    previewAlt: 'The Winfy desktop with the Wine launcher, dock and taskbar',
    badge: 'Default system',
  },
  {
    slug: 'vlc-online',
    path: '/vlc-online',
    name: 'VLC online',
    category: 'media',
    icon: 'vlc',
    short: 'Play a local video or audio file',
    lead: 'Enjoy our VLC-style player over our platform:',
    description: [
      'VLC online is a media player that opens the video or audio file you pick from your own device. The file is read with a browser object URL, so it is never uploaded and never leaves your computer.',
      'The player keeps the familiar transport controls you expect: a play and pause toggle, a position slider, a volume slider and elapsed time. Combined with the rest of the workspace it turns the browser tab into a small media station.',
    ],
    features: [
      'Opens MP4, WebM, MP3, OGG, WAV and anything else your browser can decode.',
      'Play, pause, seek and volume controls with a live time read-out.',
      'Local playback through an object URL: no upload, no account, no tracking.',
      'Sits inside the desktop as a draggable, resizable window next to your other apps.',
    ],
    requirements: [
      'A browser with HTML5 media support for the codec you want to play.',
      'The file must be readable by your browser (local disk or a mounted drive).',
    ],
    limitations: [
      'Codec support comes from the browser itself; a format your browser cannot decode will not play.',
      'There is no network streaming, playlist or subtitle engine.',
    ],
    launch: { window: 'vlc', os: DEFAULT_OS },
    preview: '/previews/vlc-online.jpg',
    previewAlt: 'The VLC online media player window inside the Winfy desktop',
  },
  {
    slug: 'notepad-online',
    path: '/notepad-online',
    name: 'Notepad++ online',
    category: 'tools',
    icon: 'notepad',
    short: 'A tabbed editor that never autosaves to a server',
    lead: 'Enjoy our Notepad-style editor over our platform:',
    description: [
      'Notepad++ online is a focused, tabbed text editor for notes, snippets, configuration files and prompts you want to hand to the coding agent. Every tab is a scratch document that lives in this browser session only.',
      'There is no account, no cloud document and no autosave to a server. When you are done you can download the buffer as a real file, or send it straight into the OpenCode composer as context.',
    ],
    features: [
      'Unlimited tabs with instant switching and per-tab naming.',
      'Monospaced editing surface that is comfortable for code, YAML and markdown.',
      'Download any tab as a plain text file with one click.',
      'Send the current document to the OpenCode composer as prompt context.',
    ],
    requirements: ['Any modern browser.', 'No account or installation.'],
    limitations: [
      'Documents are session state in the tab; reloading the page discards them unless you download first.',
      'No syntax highlighting engine or plugin ecosystem — it is deliberately lightweight.',
    ],
    launch: { window: 'notepad', os: DEFAULT_OS },
    preview: '/previews/notepad-online.jpg',
    previewAlt: 'The tabbed Notepad++ online editor inside the Winfy desktop',
  },
  {
    slug: 'tetris-cube',
    path: '/tetris-cube',
    name: 'Tetris Cube',
    category: 'games',
    icon: 'tetris',
    short: 'The falling-block classic',
    lead: 'Enjoy our Tetris Cube over our platform:',
    description: [
      'Tetris Cube is the falling-block classic, rebuilt on a canvas inside the desktop. Seven tetrominoes, a ten by eighteen well, soft drop, hard drop, rotation and a score that rewards clearing four lines at once.',
      'It runs entirely in your tab, so there is no lag between a keypress and the block moving, and no advertisement between games. Open it next to the editor while a build runs.',
    ],
    features: [
      'Arrow keys to move and rotate, space or the up arrow to rotate, down to soft drop.',
      'Score, level indicator and next-piece preview.',
      'Clean ten by eighteen playfield with no ads and no sign-in.',
      'Pauses automatically when the window is minimized.',
    ],
    requirements: ['Any modern browser with keyboard access.', 'Best on a screen at least 720 pixels wide.'],
    limitations: [
      'Single-player only, with no high-score table and no sound effects.',
      'Touch controls are not implemented; a physical keyboard is required.',
    ],
    launch: { window: 'tetris', os: DEFAULT_OS },
    preview: '/previews/tetris-cube.jpg',
    previewAlt: 'The Tetris Cube game running inside the Winfy desktop',
  },
  {
    slug: 'snake-candy-game',
    path: '/snake-candy-game',
    name: 'Snake Candy game',
    category: 'games',
    icon: 'snake',
    short: 'Grow the snake, avoid the walls',
    lead: 'Enjoy our Snake Candy game over our platform:',
    description: [
      'Snake Candy is the arcade classic with a candy palette: steer a growing snake around an eighteen by eighteen grid, collect the food, and do not run into your own tail.',
      'It is a canvas game with a fixed tick, so the difficulty is predictable and the same on every machine. Restart instantly after a collision and the score resets with the board.',
    ],
    features: [
      'Arrow-key steering with instant restart after a collision.',
      'A growing tail, a live score and a clean grid with no clutter.',
      'Deterministic tick rate, so the game plays the same everywhere.',
      'No accounts, no ads and no downloads.',
    ],
    requirements: ['Any modern browser with keyboard access.', 'No installation of any kind.'],
    limitations: ['Keyboard only; no swipe controls on touch devices.', 'Local score only, not persisted between reloads.'],
    launch: { window: 'snake', os: DEFAULT_OS },
    preview: '/previews/snake-candy-game.jpg',
    previewAlt: 'The Snake Candy game running inside the Winfy desktop',
  },
  {
    slug: 'pong-candy-game',
    path: '/pong-candy-game',
    name: 'Pong Candy game',
    category: 'games',
    icon: 'pong',
    short: 'The original arcade duel',
    lead: 'Enjoy our Pong Candy game over our platform:',
    description: [
      'Pong Candy is the oldest video game there is, and it still works: move your paddle with the mouse, return the ball, and beat the computer paddle to the edge of the court.',
      'The whole match is a few hundred lines of canvas code, which makes it a good example of how small a real game can be when it does not need an engine or a download.',
    ],
    features: [
      'Mouse-controlled paddle with a lively computer opponent.',
      'A rally counter and an instant serve after each point.',
      'Runs at the browser refresh rate with no assets to download.',
      'Plays inside a normal desktop window like every other app.',
    ],
    requirements: ['Any modern browser with a pointer or a trackpad.', 'No account needed.'],
    limitations: ['Single player against the computer; there is no two-player mode over the network.', 'No sound.'],
    launch: { window: 'pong', os: DEFAULT_OS },
    preview: '/previews/pong-candy-game.jpg',
    previewAlt: 'The Pong Candy game running inside the Winfy desktop',
  },
  {
    slug: 'format-factory-online',
    path: '/format-factory-online',
    name: 'Format Factory online',
    category: 'tools',
    icon: 'format',
    short: 'Convert images, JSON and Base64',
    lead: 'Enjoy our Format Factory over our platform:',
    description: [
      'Format Factory online is a small conversion bench that handles the three jobs people actually need every day: turning an image into PNG, JPEG or WebP, pretty-printing a JSON document, and encoding or decoding Base64.',
      'Image conversion happens on a canvas in your own browser, so a private screenshot is never uploaded anywhere. The JSON and Base64 tools run entirely in memory as well.',
    ],
    features: [
      'Convert PNG, JPEG, WebP, GIF and BMP images to PNG, JPEG or WebP with a quality control.',
      'Pretty-print or minify JSON with clear validation errors instead of a silent failure.',
      'Encode text to Base64 and decode Base64 back to text.',
      'Download the result with the correct file extension and MIME type.',
    ],
    requirements: [
      'A browser with canvas and file API support — every current browser qualifies.',
      'For WebP output, a browser that can encode WebP (Chrome, Edge, Firefox and Safari 14+).',
    ],
    limitations: [
      'No video, audio or document conversion: images, JSON and Base64 only.',
      'Very large images are bounded by available browser memory.',
    ],
    launch: { window: 'format-factory', os: DEFAULT_OS },
    preview: '/previews/format-factory-online.jpg',
    previewAlt: 'The Format Factory online conversion tool inside the Winfy desktop',
  },
  {
    slug: 'reactos-online',
    path: '/reactos-online',
    name: 'ReactOS',
    category: 'systems',
    icon: 'reactos',
    short: 'A classic NT-style shell',
    lead: 'Enjoy our ReactOS-style workstation over our platform:',
    description: [
      'ReactOS is a separate system profile for the workspace: a compact start menu, a grey taskbar, square window controls and an Explorer-first workflow that will feel immediately familiar to anyone who used Windows in the 2000s.',
      'Switching to it never reloads the page or loses your work. The theme is a presentation layer on top of the same programs, so the editor, the terminal and the games stay exactly where you left them.',
    ],
    features: [
      'A grey, classic taskbar with a compact start menu and quick launch area.',
      'Square window chrome and the older 8-bit icon feel.',
      'Explorer opens by default so the desktop is useful immediately.',
      'Switch back to any other profile from the system menu at any time.',
    ],
    requirements: ['Any modern browser.', 'No account and no download.'],
    limitations: [
      'A themed shell only: this is not the ReactOS kernel and it cannot run native Win32 binaries.',
      'Some modern applications use rounded window chrome that this theme deliberately overrides.',
    ],
    launch: { window: 'explorer', os: 'reactos-online' },
    preview: '/previews/reactos-online.jpg',
    previewAlt: 'The ReactOS-style desktop with Explorer open',
  },
  {
    slug: 'win-10-theme',
    path: '/win-10-theme',
    name: 'Win 10 Theme',
    category: 'systems',
    icon: 'win10',
    short: 'The Windows 10 look, online',
    lead: 'Enjoy our Windows 10 theme over our platform:',
    description: [
      'The Windows 10 theme gives the workspace the layout most people still have in muscle memory: a left-aligned taskbar, a start button in the corner, the classic blue selection colour and a tiled start area.',
      'It is the profile to pick when you want the desktop to feel like a normal workstation rather than a demo. Every program, including the OpenCode window, picks up the theme automatically.',
    ],
    features: [
      'Left-aligned taskbar with a start button, pinned apps and a clock.',
      'Classic blue selection and accent colours throughout the shell.',
      'Works with every application in the workspace, including the games.',
      'Instant switching: the theme is applied without reloading your session.',
    ],
    requirements: ['Any modern browser with JavaScript enabled.'],
    limitations: ['A visual theme for the browser workspace, not a licensed copy of Windows 10.'],
    launch: { window: 'explorer', os: 'win-10-theme' },
    preview: '/previews/win-10-theme.jpg',
    previewAlt: 'The Windows 10 themed desktop inside Winfy',
  },
  {
    slug: 'windows-explorer',
    path: '/windows-explorer',
    name: 'Windows Explorer',
    category: 'tools',
    icon: 'explorer',
    short: 'Browse places, repos and sessions',
    lead: 'Enjoy our Explorer over our platform:',
    description: [
      'Explorer is the file browser of the workspace. It lists the places that actually exist here: the home folder of the working copy, the Wine prefix, your GitHub repositories and your saved OpenCode sessions.',
      'Selecting a repository fills the coding window with the right name and branch; selecting a session reopens its conversation. It is the fastest way to move around the workspace without remembering URLs.',
    ],
    features: [
      'A places sidebar with the home folder, the Wine prefix, repositories and sessions.',
      'Repository picker that pre-fills the OpenCode window.',
      'Session list that reopens a past conversation with one click.',
      'Double-click a text file to open it in the editor.',
    ],
    requirements: [
      'Any modern browser.',
      'Sign in with GitHub to see your repositories and saved sessions.',
    ],
    limitations: [
      'It shows the workspace’s own places, not the filesystem of a remote server.',
      'There is no upload, delete or rename operation.',
    ],
    launch: { window: 'explorer', os: DEFAULT_OS },
    preview: '/previews/windows-explorer.jpg',
    previewAlt: 'The Explorer window listing places, repositories and sessions',
  },
  {
    slug: 'terminal',
    path: '/terminal',
    name: 'Terminal',
    category: 'tools',
    icon: 'terminal',
    short: 'Inspect the real runtime',
    lead: 'Enjoy our online terminal over our platform:',
    description: [
      'The terminal is a shell for checking what the deployment is actually doing. `opencode --version` asks the server to spawn the real binary, `status` reports the live configuration, `models` lists the free model catalog, `test` runs a model smoke test and `whoami` shows who you are signed in as.',
      'It is deliberately honest: unknown commands are rejected instead of being answered with invented output, and every reply that looks like a shell result came from a real API call.',
    ],
    features: [
      'Live runtime probe of the OpenCode binary running on the server.',
      'Configuration, model catalog and model test commands.',
      'Identity and session commands tied to your Supabase login.',
      'Command history with arrow-key recall inside the window.',
    ],
    requirements: [
      'Any modern browser with a keyboard.',
      'A GitHub sign-in for the authenticated commands.',
    ],
    limitations: [
      'It is not a general-purpose shell: it does not run arbitrary Unix commands.',
      'There is no file upload, package manager or network access from the prompt.',
    ],
    launch: { window: 'terminal', os: DEFAULT_OS },
    preview: '/previews/terminal.jpg',
    previewAlt: 'The terminal window showing real runtime probe output',
  },
];

export const APP_PATHS: readonly string[] = APPS.map((app) => app.path);

export const GAMES = APPS.filter((app) => app.category === 'games');

export function getApp(slug: string): SiteApp | undefined {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  return APPS.find((app) => app.slug === clean);
}

export function relatedApps(app: SiteApp, limit = 4): SiteApp[] {
  return APPS.filter((item) => item.slug !== app.slug)
    .sort((a, b) => Number(b.category === app.category) - Number(a.category === app.category))
    .slice(0, limit);
}

export function launchHref(app: SiteApp): string {
  const params = new URLSearchParams({ os: app.launch.os, window: app.launch.window, desktop: '1' });
  return `/workspace?${params.toString()}`;
}

export const CATEGORY_LABELS: Record<AppCategory, string> = {
  systems: 'System',
  media: 'Media',
  tools: 'Tool',
  games: 'Game',
  agent: 'Coding agent',
};
