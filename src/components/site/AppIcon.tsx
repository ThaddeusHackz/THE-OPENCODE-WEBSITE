import type { CSSProperties } from 'react';

/**
 * Original application icons, drawn as inline SVG so they stay crisp at every
 * size and cost the page no extra requests. Each icon is a soft gradient tile
 * with a single white glyph, matching the flat/soft-3D look of the reference
 * portal without reusing any of its artwork.
 */

type IconTheme = { from: string; to: string; ink?: string };

const THEMES: Record<string, IconTheme> = {
  wine: { from: '#e0506a', to: '#9d0f24' },
  vlc: { from: '#ffb52e', to: '#ea6a06' },
  notepad: { from: '#47d99d', to: '#047857' },
  tetris: { from: '#a98bfa', to: '#5b21b6' },
  snake: { from: '#b6e94a', to: '#3f6212' },
  pong: { from: '#4cc7f5', to: '#0b6f8f' },
  format: { from: '#6aa8fb', to: '#1d4ed8' },
  reactos: { from: '#7c8ba1', to: '#1f2937' },
  win10: { from: '#34d3ee', to: '#075985' },
  explorer: { from: '#fbcf5c', to: '#c2760a' },
  terminal: { from: '#5b6676', to: '#0b1220' },
  opencode: { from: '#5a5a66', to: '#101014' },
};

function Glyph({ name }: { name: string }) {
  const stroke = {
    fill: 'none',
    stroke: '#ffffff',
    strokeWidth: 7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'wine':
      return (
        <>
          <path d="M46 36h36l-3.8 21.5a16.2 16.2 0 0 1-28.4 0L46 36Z" fill="#ffffff" />
          <path d="M50.5 52.5h27" stroke="#9d0f24" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
          <path d="M64 74v8M53 86h22" {...stroke} strokeWidth="6" />
        </>
      );
    case 'vlc':
      return (
        <>
          <path d="M55 32h18l5 15H50l5-15Z" fill="#ffffff" />
          <path d="M47.5 54h33l5 15h-43l5-15Z" fill="#ffffff" opacity="0.88" />
          <path d="M39.5 76h49l4 12h-57l4-12Z" fill="#ffffff" opacity="0.76" />
          <path d="M36 92h56" {...stroke} strokeWidth="6" opacity="0.55" />
        </>
      );
    case 'notepad':
      return (
        <>
          <path d="M44 28h26l16 16v56H44a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4Z" fill="#ffffff" />
          <path d="M70 28v16h16" fill="#ffffff" opacity="0.7" />
          <path d="M50 60h26M50 72h26M50 84h15" stroke="#047857" strokeWidth="5.5" strokeLinecap="round" />
        </>
      );
    case 'tetris':
      return (
        <>
          <rect x="52" y="30" width="20" height="20" rx="5" fill="#ffffff" />
          <rect x="74" y="30" width="20" height="20" rx="5" fill="#ffffff" opacity="0.82" />
          <rect x="30" y="52" width="20" height="20" rx="5" fill="#ffffff" opacity="0.9" />
          <rect x="52" y="52" width="20" height="20" rx="5" fill="#ffffff" />
          <rect x="74" y="52" width="20" height="20" rx="5" fill="#ffffff" opacity="0.82" />
          <rect x="30" y="74" width="20" height="20" rx="5" fill="#ffffff" opacity="0.7" />
        </>
      );
    case 'snake':
      return (
        <>
          <path
            d="M42 44h30a11 11 0 0 1 0 22H56a9 9 0 0 0 0 18h26"
            fill="none"
            stroke="#ffffff"
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="90" cy="46" r="9.5" fill="#ffffff" />
          <circle cx="93" cy="43" r="2.6" fill="#3f6212" />
        </>
      );
    case 'pong':
      return (
        <>
          <path d="M64 32v12M64 54v12M64 76v12" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
          <rect x="34" y="44" width="10" height="38" rx="5" fill="#ffffff" />
          <rect x="84" y="62" width="10" height="38" rx="5" fill="#ffffff" opacity="0.85" />
          <circle cx="66" cy="44" r="8.5" fill="#ffffff" />
        </>
      );
    case 'format':
      return (
        <>
          <rect x="32" y="30" width="64" height="48" rx="9" fill="#ffffff" />
          <circle cx="50" cy="46" r="6" fill="#1d4ed8" />
          <path d="M36 70l15-15 11 11 8-8 10 12" stroke="#1d4ed8" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M40 92h40M70 82l10 10-10 10" {...stroke} strokeWidth="6" />
        </>
      );
    case 'reactos':
      return (
        <>
          <rect x="30" y="38" width="68" height="56" rx="8" fill="#ffffff" />
          <path d="M30 54h68" stroke="#1f2937" strokeWidth="5" opacity="0.35" />
          <circle cx="41" cy="46" r="3.2" fill="#1f2937" opacity="0.5" />
          <circle cx="52" cy="46" r="3.2" fill="#1f2937" opacity="0.35" />
          <circle cx="64" cy="72" r="13" fill="none" stroke="#1f2937" strokeWidth="6" opacity="0.65" />
          <path d="M64 59v26" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
        </>
      );
    case 'win10':
      return (
        <>
          <rect x="30" y="30" width="29" height="29" rx="4" fill="#ffffff" />
          <rect x="66" y="30" width="29" height="29" rx="4" fill="#ffffff" opacity="0.86" />
          <rect x="30" y="66" width="29" height="29" rx="4" fill="#ffffff" opacity="0.86" />
          <rect x="66" y="66" width="29" height="29" rx="4" fill="#ffffff" opacity="0.72" />
        </>
      );
    case 'explorer':
      return (
        <>
          <path d="M30 44a7 7 0 0 1 7-7h16l8 9h30a7 7 0 0 1 7 7v33a7 7 0 0 1-7 7H37a7 7 0 0 1-7-7V44Z" fill="#ffffff" />
          <path d="M30 60h78" stroke="#c2760a" strokeWidth="5" opacity="0.45" />
        </>
      );
    case 'terminal':
      return (
        <>
          <rect x="28" y="32" width="72" height="58" rx="10" fill="none" stroke="#ffffff" strokeWidth="6.5" />
          <path d="M46 56l11 9-11 9" {...stroke} />
          <path d="M66 76h16" {...stroke} />
        </>
      );
    case 'opencode':
      return (
        <>
          <path d="M50 44 34 64l16 20" {...stroke} strokeWidth="8.5" />
          <path d="M78 44l16 20-16 20" {...stroke} strokeWidth="8.5" />
          <path d="M70 36 58 92" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
        </>
      );
    default:
      return <circle cx="64" cy="64" r="26" fill="#ffffff" opacity="0.9" />;
  }
}

export function AppIcon({
  icon,
  size = 96,
  className,
  style,
}: {
  icon: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const theme = THEMES[icon] ?? THEMES.opencode;
  const gradientId = `ai-${icon}`;
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 128 128"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={theme.from} />
          <stop offset="100%" stopColor={theme.to} />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill={`url(#${gradientId})`} />
      <rect width="128" height="64" rx="28" fill="#ffffff" opacity="0.07" />
      <Glyph name={icon} />
    </svg>
  );
}

/** Small line icons used by the feature grid and footer. */
export function UiIcon({ name, size = 22 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'desktop':
      return (
        <svg {...common}>
          <rect x="2.5" y="4" width="19" height="12.5" rx="2" />
          <path d="M9 20h6M12 16.5V20" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...common}>
          <path d="M12 3 2.8 7.6 12 12.2l9.2-4.6L12 3Z" />
          <path d="M2.8 12.4 12 17l9.2-4.6" />
          <path d="M2.8 16.9 12 21.5l9.2-4.6" />
        </svg>
      );
    case 'terminal':
      return (
        <svg {...common}>
          <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
          <path d="M6.5 10.5 9 13l-2.5 2.5M12.5 15.5h5" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 4.5 5.8v6.3c0 4.3 3.1 7.6 7.5 8.9 4.4-1.3 7.5-4.6 7.5-8.9V5.8L12 3Z" />
          <path d="m8.8 12.1 2.2 2.2 4.2-4.4" />
        </svg>
      );
    case 'history':
      return (
        <svg {...common}>
          <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
          <path d="M3.2 4.5v4.2h4.2" />
          <path d="M12 8v4.4l3 1.8" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...common}>
          <path d="M12 2.8 14.2 9l6.2 2.2-6.2 2.2L12 19.6 9.8 13.4 3.6 11.2 9.8 9 12 2.8Z" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...common}>
          <path d="M4.5 12h14M13 6.5l5.5 5.5L13 17.5" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="m4.5 12.5 5 5L20 6.5" />
        </svg>
      );
    case 'github':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 1.8A10.2 10.2 0 0 0 8.8 21.7c.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.2-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.2 10.2 0 0 0 12 1.8Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
        </svg>
      );
  }
}
