import type { DesktopWindowId } from '@/lib/winfy/catalog';

export function WinfyBrandLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect width="36" height="36" rx="9" fill="url(#winfyLogoGrad)" />
      <path d="M8 10.5L16.8 9.2V17.4H8V10.5Z" fill="#FFFFFF" fillOpacity="0.96" />
      <path d="M18.4 9L28 7.5V17.4H18.4V9Z" fill="#E0F2FE" fillOpacity="0.95" />
      <path d="M8 18.8H16.8V26.8L8 25.5V18.8Z" fill="#BAE6FD" fillOpacity="0.92" />
      <path d="M18.4 18.8H28V28.5L18.4 27V18.8Z" fill="#FDBA74" fillOpacity="0.95" />
      <defs>
        <linearGradient id="winfyLogoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284C7" />
          <stop offset="0.55" stopColor="#2563EB" />
          <stop offset="1" stopColor="#E95420" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function WindowAppIcon({ id, size = 20 }: { id: DesktopWindowId | string; size?: number }) {
  switch (id) {
    case 'opencode':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#0F172A" stroke="#34D399" strokeWidth="1.5" />
          <path d="M7 9L10.5 12L7 15" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.5 15H17" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'winegui':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#E95420" />
          <path d="M8 5H16L15.2 10.5C15 12.2 13.7 13.5 12 13.5C10.3 13.5 9 12.2 8.8 10.5L8 5Z" fill="#FFF7ED" />
          <path d="M12 13.5V19M9 19H15" stroke="#FFF7ED" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'terminal':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#1E1B2E" stroke="#64748B" strokeWidth="1.2" />
          <path d="M6.5 8.5L10 12L6.5 15.5" stroke="#F8FAFC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11.5 15.5H17.5" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'explorer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#0369A1" />
          <path d="M5 8.5C5 7.7 5.7 7 6.5 7H10L11.5 8.5H17.5C18.3 8.5 19 9.2 19 10V16.5C19 17.3 18.3 18 17.5 18H6.5C5.7 18 5 17.3 5 16.5V8.5Z" fill="#FCD34D" />
        </svg>
      );
    case 'notepad':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#4D7C0F" />
          <rect x="6" y="5" width="12" height="14" rx="2" fill="#F7FEE7" />
          <path d="M8.5 9H15.5M8.5 12H15.5M8.5 15H13" stroke="#3F6212" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'browser':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#1D4ED8" />
          <circle cx="12" cy="12" r="6.5" stroke="#DBEAFE" strokeWidth="1.6" />
          <ellipse cx="12" cy="12" rx="3" ry="6.5" stroke="#DBEAFE" strokeWidth="1.3" />
          <path d="M5.8 12H18.2" stroke="#DBEAFE" strokeWidth="1.3" />
        </svg>
      );
    case 'vlc':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#C2410C" />
          <path d="M12 5L16.5 17H7.5L12 5Z" fill="#FFEDD5" />
          <path d="M6 17.5H18" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'format-factory':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#0E7490" />
          <path d="M7 10A5 5 0 0 1 16.5 8.5M17 14A5 5 0 0 1 7.5 15.5" stroke="#ECFEFF" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M14.5 9H17.5V6M9.5 15H6.5V18" stroke="#ECFEFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'tetris':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#6D28D9" />
          <rect x="6" y="7" width="4" height="4" fill="#FDE047" />
          <rect x="10" y="7" width="4" height="4" fill="#FDE047" />
          <rect x="14" y="7" width="4" height="4" fill="#FDE047" />
          <rect x="10" y="11" width="4" height="4" fill="#F472B6" />
          <rect x="10" y="15" width="4" height="4" fill="#38BDF8" />
        </svg>
      );
    case 'snake':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#BE185D" />
          <path d="M7 15H13V9H17" stroke="#A7F3D0" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="9" r="2" fill="#FDE047" />
        </svg>
      );
    case 'pong':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#0F766E" />
          <rect x="5" y="7" width="2.2" height="7" rx="1" fill="#F8FAFC" />
          <rect x="16.8" y="10" width="2.2" height="7" rx="1" fill="#F8FAFC" />
          <circle cx="12" cy="12" r="1.8" fill="#FDE047" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#334155" />
          <rect x="7" y="7" width="10" height="10" rx="2" fill="#E2E8F0" />
        </svg>
      );
  }
}
