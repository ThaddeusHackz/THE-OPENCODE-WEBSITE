import { NextRequest } from 'next/server';
import { requireRouteUser } from '@/lib/route-context';
import { githubLoginFromUser } from '@/lib/auth';
import { readServerEnv } from '@/lib/env';
import { AppError } from '@/lib/errors';
import { createInstallationToken } from '@/lib/github/app';
import { listInstallationRepositories, userCanAccessRepository } from '@/lib/github/repos';
import { jsonError, jsonOk } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { user, applyCookies } = await requireRouteUser(request);
    const cfg = readServerEnv();
    if (!cfg.githubAppId || !cfg.githubAppPrivateKey || !cfg.githubInstallationId) {
      throw new AppError(503, 'GITHUB_APP_NOT_CONFIGURED', 'GitHub App is not configured. Set GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY and GITHUB_APP_INSTALLATION_ID.');
    }
    const login = githubLoginFromUser(user);
    if (!login) {
      throw new AppError(403, 'GITHUB_IDENTITY_MISSING', 'Your Supabase GitHub profile has no username; cannot verify repository access.');
    }
    const token = await createInstallationToken({
      appId: cfg.githubAppId,
      privateKey: cfg.githubAppPrivateKey,
      installationId: cfg.githubInstallationId,
    });
    const all = await listInstallationRepositories(token);
    const candidates = all.slice(0, 30);
    const checks = await Promise.all(
      candidates.map(async (repo) => ({
        repo,
        allowed: await userCanAccessRepository(token, repo.full_name, login),
      })),
    );
    const repos = checks.filter((entry) => entry.allowed).map((entry) => entry.repo);
    return applyCookies(jsonOk({ repos, limited: all.length > candidates.length }));
  } catch (error) {
    return jsonError(error);
  }
}
