import Link from 'next/link';
import { SITE } from '@/lib/site';

/** Original wordmark: a red/cream split disc plus the site title and tagline. */
export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={`${SITE.name} logo`}>
      <defs>
        <clipPath id="brand-disc">
          <circle cx="24" cy="24" r="24" />
        </clipPath>
        <linearGradient id="brand-red" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#d02039" />
          <stop offset="100%" stopColor="#8f0d20" />
        </linearGradient>
      </defs>
      <g clipPath="url(#brand-disc)">
        <rect width="48" height="48" fill="#f7ecdf" />
        <path d="M0 33c8-9 13 5 22-6 6-7 11-3 16-8v29H0V33Z" fill="url(#brand-red)" />
        <path d="M0 33c8-9 13 5 22-6 6-7 11-3 16-8" fill="none" stroke="#f7ecdf" strokeWidth="2" opacity="0.9" />
      </g>
      <circle cx="24" cy="24" r="23" fill="none" stroke="rgba(23,20,15,0.12)" strokeWidth="2" />
    </svg>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-lockup">
      <BrandMark size={compact ? 34 : 42} />
      <span className="brand-text">
        <strong>{SITE.name}</strong>
        {!compact && <span>{SITE.tagline}</span>}
      </span>
    </span>
  );
}

export function BrandLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label={`${SITE.name} home`}>
      <BrandLockup compact={compact} />
    </Link>
  );
}
