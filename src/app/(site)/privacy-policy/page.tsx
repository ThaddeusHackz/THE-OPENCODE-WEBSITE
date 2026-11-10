import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE.name}`,
  description: 'What this deployment stores, what it never stores, and who processes data on its behalf.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="legal">
      <div className="container">
        <div className="legal-inner">
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: 10 November 2026</p>

          <p>
            {SITE.name} is a small, self-hosted browser workspace. This page explains exactly what happens to your data
            when you use it. There are no advertising networks, no third-party analytics scripts and no tracking pixels
            in this deployment.
          </p>

          <h2>What you can use without an account</h2>
          <p>
            The desktop, the games, the editor, the media player, the image converter and the terminal are usable
            without signing in. Files you open in the media player or the converter are read by your browser with an
            object URL; they are never uploaded to this server.
          </p>

          <h2>What is stored when you sign in</h2>
          <p>
            Signing in uses GitHub as the identity provider, brokered by Supabase Auth. When you are signed in, this
            deployment stores:
          </p>
          <ul>
            <li>the Supabase user identifier, e-mail address, display name and avatar URL returned by GitHub;</li>
            <li>the coding sessions you create: repository name, branch, prompts, assistant replies and diff summaries;</li>
            <li>timestamps and, for failed runs, the error message that the runtime produced.</li>
          </ul>
          <p>
            These rows live in a Postgres database on Supabase and are protected by row-level security, which means the
            database itself rejects reads and writes for any other user.
          </p>

          <h2>What is never stored</h2>
          <ul>
            <li>GitHub access tokens and provider API keys stay on the server and are never sent to your browser.</li>
            <li>Your media files, images, notes and JSON documents are processed in the tab and discarded on reload.</li>
            <li>No passwords are ever handled by this site; authentication happens on GitHub.</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            Two cookies are used and nothing else: the Supabase session cookie that keeps you signed in, and a
            short-lived <code>oc_auth_next</code> cookie that returns you to the page you started from after the GitHub
            redirect. There are no marketing or preference cookies.
          </p>

          <h2>Repository data</h2>
          <p>
            When you ask the coding agent to work on a repository, a tarball of that repository is downloaded into a
            temporary directory inside the serverless function, used for that single request, and deleted when the
            request finishes. Changes are returned to you as a diff and are never pushed back to GitHub.
          </p>

          <h2>Processors</h2>
          <p>
            This deployment relies on Vercel (hosting and functions), Supabase (authentication and database), GitHub
            (identity and repository access) and the model provider configured for the selected model. Each of them
            processes data under its own terms and privacy policy.
          </p>

          <h2>Your choices</h2>
          <p>
            You can sign out at any time from the workspace header. To have stored sessions deleted, contact the
            operator of this deployment at <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> with the
            GitHub account you used, and the rows belonging to that account will be removed.
          </p>

          <h2>Changes</h2>
          <p>
            If this policy changes, the date at the top of this page changes with it. Questions are welcome at{' '}
            <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>. See also the{' '}
            <Link href="/terms-of-service">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
