/**
 * Request-scoped Vercel OIDC credentials.
 *
 * Vercel injects the OIDC token into each Function invocation as the
 * `x-vercel-oidc-token` REQUEST HEADER. `VERCEL_OIDC_TOKEN` in process.env is
 * only a build-time / local-development value — it is NOT present in the
 * Function runtime. OpenCode's `vercel-ai-gateway` provider accepts either
 * `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`, so we make the request token
 * visible to the child under both names.
 *
 * The token never leaves server memory into the browser, logs, workspace files
 * or the repository. We only ever report whether it is present (a boolean).
 * See https://vercel.com/docs/environment-variables/system-environment-variables
 */

export const VERCEL_OIDC_HEADER = 'x-vercel-oidc-token';

type HeaderRequest = { headers: { get(name: string): string | null } };

/** Read the per-request OIDC token Vercel injects (or a local env fallback). */
export function vercelOidcToken(request?: HeaderRequest): string | undefined {
  // Only trust the header on Vercel's own runtime; an arbitrary client header
  // on a self-hosted deployment is not a platform credential.
  if (request && process.env.VERCEL === '1') {
    const header = request.headers.get(VERCEL_OIDC_HEADER)?.trim();
    if (header) return header;
  }
  const local = process.env.VERCEL_OIDC_TOKEN?.trim();
  return local || undefined;
}

/**
 * Server env record for this request. This is a plain in-memory object; the
 * global `process.env` is never mutated (important for Fluid compute, where one
 * instance can serve concurrent requests with different tokens).
 */
export function serverEnvWithOidc(request?: HeaderRequest): Record<string, string | undefined> {
  const token = vercelOidcToken(request);
  if (!token) return { ...process.env };
  return {
    ...process.env,
    VERCEL_OIDC_TOKEN: token,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY || token,
  };
}

/** Safe diagnostic: presence only, never the value. */
export function hasVercelOidc(request?: HeaderRequest): boolean {
  return Boolean(vercelOidcToken(request));
}
