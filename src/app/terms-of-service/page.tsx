import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <main className="legal-page">
      <div className="legal-card">
        <Link href="/runwine/index.php?os=winegui_2_ubuntu-22-amd64" className="win-btn small">
          ← Back to RunWine
        </Link>
        <h1>Terms of Service</h1>
        <p>
          This website provides a Winfy RunWine-inspired web desktop interface integrated with the server-side
          OpenCode CLI v2.2.5 on Vercel Functions and Supabase Auth/Postgres.
        </p>
        <h2>Sessions &amp; Persistence</h2>
        <p>
          Desktop window activity monitors idle time (5 minutes) to reset inactive workspace sessions, while
          authenticated GitHub coding sessions and diffs remain stored under your user account in Supabase Postgres
          protected by row-level security.
        </p>
        <h2>Repository &amp; Runtime Scope</h2>
        <p>
          OpenCode runs read-only repository clones inside ephemeral temporary directories per request and never pushes
          changes back to GitHub automatically. Upstream external Winfy/OffiDocs links are governed by their own
          service terms.
        </p>
      </div>
    </main>
  );
}
