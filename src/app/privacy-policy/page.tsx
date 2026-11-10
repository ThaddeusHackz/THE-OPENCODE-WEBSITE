import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="legal-page">
      <div className="legal-card">
        <Link href="/runwine/index.php?os=winegui_2_ubuntu-22-amd64" className="win-btn small">
          ← Back to RunWine
        </Link>
        <h1>Privacy Policy</h1>
        <p>
          This application stores only your Supabase authenticated user identity, session metadata, prompts,
          assistant output, and bounded diff summaries in Postgres under strict row-level security.
        </p>
        <h2>Credentials &amp; Secrets</h2>
        <p>
          Provider API keys, OIDC tokens, and GitHub tokens remain strictly on the server, are filtered from child
          environments, and are redacted from captured CLI output before storage. No third-party ad trackers or
          Google AdSense scripts are loaded by this deployment.
        </p>
      </div>
    </main>
  );
}
