import { createSign } from 'node:crypto';
import { AppError } from '../errors';

function base64Url(value: string): string {
  return Buffer.from(value).toString('base64url');
}

/** GitHub App JWT (RS256). The private key never leaves the server. */
export function createAppJwt(
  appId: string,
  privateKey: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): string {
  const pem = privateKey.includes('\\n') ? privateKey.replace(/\\n/g, '\n') : privateKey;
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({ iat: nowSeconds - 60, exp: nowSeconds + 540, iss: appId }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  signer.end();
  const signature = signer.sign(pem).toString('base64url');
  return `${header}.${payload}.${signature}`;
}

export function githubApiUrl(path: string): string {
  return `https://api.github.com${path}`;
}

export function githubHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'the-opencode-website/0.1',
  };
}

export type FetchImpl = typeof fetch;

export async function githubApi(
  path: string,
  token: string,
  init: RequestInit = {},
  fetchImpl: FetchImpl = fetch,
): Promise<Response> {
  return fetchImpl(githubApiUrl(path), {
    ...init,
    headers: { ...githubHeaders(token), ...(init.headers as Record<string, string> | undefined) },
    redirect: 'follow',
  });
}

/** Short-lived installation token. Requires no extra dependency and is not cached. */
export async function createInstallationToken(
  cfg: { appId: string; privateKey: string; installationId: string },
  fetchImpl: FetchImpl = fetch,
): Promise<string> {
  const jwt = createAppJwt(cfg.appId, cfg.privateKey);
  const response = await githubApi(
    `/app/installations/${encodeURIComponent(cfg.installationId)}/access_tokens`,
    jwt,
    { method: 'POST' },
    fetchImpl,
  );
  if (!response.ok) {
    throw new AppError(502, 'GITHUB_APP_AUTH_FAILED', `GitHub App authentication failed (HTTP ${response.status}).`);
  }
  const body = (await response.json()) as { token?: string };
  if (!body.token) throw new AppError(502, 'GITHUB_APP_AUTH_FAILED', 'GitHub App returned no installation token.');
  return body.token;
}
