import { writeFile } from 'node:fs/promises';
import { AppError } from '../errors';
import { validateRef, validateRepoFullName } from '../validation';
import { githubApi, githubHeaders, type FetchImpl } from './app';

export type RepoInfo = {
  full_name: string;
  name: string;
  owner: string;
  private: boolean;
  default_branch: string;
  description: string | null;
};

/** Repositories the least-privilege App installation can read. */
export async function listInstallationRepositories(
  token: string,
  fetchImpl: FetchImpl = fetch,
  maxPages = 3,
): Promise<RepoInfo[]> {
  const repos: RepoInfo[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const response = await githubApi(`/installation/repositories?per_page=100&page=${page}`, token, {}, fetchImpl);
    if (!response.ok) {
      throw new AppError(502, 'GITHUB_REPOS_FAILED', `Could not list repositories (HTTP ${response.status}).`);
    }
    const body = (await response.json()) as {
      repositories?: Array<{
        full_name?: string;
        name?: string;
        private?: boolean;
        default_branch?: string;
        description?: string | null;
        owner?: { login?: string };
      }>;
    };
    const rows = body.repositories ?? [];
    for (const row of rows) {
      if (!row.full_name || !/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(row.full_name)) continue;
      repos.push({
        full_name: row.full_name,
        name: row.name ?? row.full_name.split('/')[1] ?? '',
        owner: row.owner?.login ?? row.full_name.split('/')[0] ?? '',
        private: Boolean(row.private),
        default_branch: row.default_branch ?? 'main',
        description: row.description ?? null,
      });
    }
    if (rows.length < 100) break;
  }
  return repos;
}

/** Uses only "Metadata: read" on the App. 204 = collaborator, 404 = not. */
export async function userCanAccessRepository(
  token: string,
  fullName: string,
  login: string,
  fetchImpl: FetchImpl = fetch,
): Promise<boolean> {
  const repo = validateRepoFullName(fullName);
  if (!/^[A-Za-z0-9-]{1,39}$/.test(login)) return false;
  const response = await githubApi(
    `/repos/${repo}/collaborators/${encodeURIComponent(login)}`,
    token,
    {},
    fetchImpl,
  );
  if (response.status === 204) return true;
  if (response.status === 404) return false;
  throw new AppError(502, 'GITHUB_ACCESS_CHECK_FAILED', `Could not verify repository access (HTTP ${response.status}).`);
}

/** Downloads a GitHub-generated archive into /tmp with a hard byte cap. */
export async function downloadRepositoryArchive(
  token: string,
  fullName: string,
  ref: string,
  destination: string,
  maxBytes: number,
  fetchImpl: FetchImpl = fetch,
): Promise<{ bytes: number }> {
  const repo = validateRepoFullName(fullName);
  const safeRef = validateRef(ref);
  const url = `https://api.github.com/repos/${repo}/tarball/${encodeURIComponent(safeRef)}`;
  const response = await fetchImpl(url, {
    headers: { ...githubHeaders(token), Accept: 'application/octet-stream' },
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new AppError(502, 'GITHUB_ARCHIVE_FAILED', `Could not download repository archive (HTTP ${response.status}).`);
  }
  const declared = Number(response.headers.get('content-length') ?? 0);
  if (declared > maxBytes) throw new AppError(413, 'REPO_TOO_LARGE', 'Repository archive exceeds the configured size limit.');
  if (!response.body) throw new AppError(502, 'GITHUB_ARCHIVE_FAILED', 'GitHub returned an empty archive.');

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new AppError(413, 'REPO_TOO_LARGE', 'Repository archive exceeds the configured size limit.');
    }
    chunks.push(value);
  }
  await writeFile(destination, Buffer.concat(chunks));
  return { bytes: total };
}
