import { readServerEnv } from '../env';
import { AppError } from '../errors';
import { validateRepoFullName } from '../validation';
import { createInstallationToken, githubApi } from './app';
import { listInstallationRepositories, listUserRepositories, patOwnerLogin, userCanAccessRepository, type RepoInfo } from './repos';

export type GitHubContext = {
  mode: 'app' | 'pat';
  token: string;
  /** GitHub login owning a PAT, or null for an App installation token. */
  ownerLogin: string | null;
};

/**
 * Resolve server-side GitHub credentials. GitHub App is preferred (least
 * privilege). A fine-grained PAT is supported as a fallback; it is never sent
 * to the browser, logged, or committed.
 */
export async function resolveGitHubContext(): Promise<GitHubContext> {
  const cfg = readServerEnv();
  if (cfg.githubMode === 'app') {
    const token = await createInstallationToken({
      appId: cfg.githubAppId,
      privateKey: cfg.githubAppPrivateKey,
      installationId: cfg.githubInstallationId,
    });
    return { mode: 'app', token, ownerLogin: null };
  }
  if (cfg.githubMode === 'pat') {
    const response = await githubApi('/user', cfg.githubToken);
    if (!response.ok) {
      throw new AppError(502, 'GITHUB_TOKEN_INVALID', `Server-side GitHub token was rejected (HTTP ${response.status}).`);
    }
    return { mode: 'pat', token: cfg.githubToken, ownerLogin: await patOwnerLogin(cfg.githubToken) };
  }
  throw new AppError(
    503,
    'GITHUB_NOT_CONFIGURED',
    'GitHub access is not configured. Set GITHUB_APP_* (preferred) or GITHUB_TOKEN as a server-side secret.',
  );
}

export async function listAuthorizedRepositories(context: GitHubContext): Promise<RepoInfo[]> {
  return context.mode === 'app'
    ? listInstallationRepositories(context.token)
    : listUserRepositories(context.token);
}

/**
 * A selected repository must be in the credential's allowlist AND the signed-in
 * GitHub user must own it (PAT owner) or be a verified collaborator.
 * `userLogin` always comes from the verified Supabase session, never the body.
 */
export async function assertRepoAuthorized(
  context: GitHubContext,
  repoFullName: string,
  userLogin: string,
  allowlist: RepoInfo[],
): Promise<void> {
  const repo = validateRepoFullName(repoFullName);
  if (!allowlist.some((item) => item.full_name === repo)) {
    throw new AppError(403, 'REPO_NOT_AUTHORIZED', 'The selected repository is not in the configured GitHub allowlist.');
  }
  if (context.mode === 'pat' && context.ownerLogin && context.ownerLogin === userLogin) return;
  const allowed = await userCanAccessRepository(context.token, repo, userLogin);
  if (!allowed) throw new AppError(403, 'REPO_NOT_AUTHORIZED', 'You are not a collaborator on the selected repository.');
}
