import type { NextConfig } from 'next';

/**
 * Vercel traces server imports automatically, but a native binary that is only
 * ever spawned (never imported) must be included explicitly. The pinned
 * @opencode/cli-linux-x64 package ships a single ~241 MB executable; see
 * docs/ARCHITECTURE.md for the bundle-size implications and the Large Functions
 * requirement on Vercel.
 */
const binaryIncludes = [
  './node_modules/@opencode/cli-linux-x64/bin/**',
  './node_modules/@opencode/cli/bin/**',
];

/**
 * Paths that must render the reference portal exactly (public/winfy-site.html).
 *
 * `/` is the public landing page, `/opencode-studio` is what the portal's
 * OpenCode Studio links point at, and `/runwine*` are the legacy launcher URLs
 * that used to open the boot screen. All of them now return the same document
 * without changing the address bar, so the visitor never leaves this domain.
 */
const winfyPaths = ['/', '/opencode-studio', '/runwine', '/runwine/index.php', '/runwine/start.php'];

const nextConfig: NextConfig = {
  serverExternalPackages: ['tar'],
  /**
   * The workspace is previewed through a proxied host in the development
   * sandbox. Without this, Next blocks the dev HMR socket and hot reload
   * silently stops working behind the proxy.
   */
  allowedDevOrigins: ['*.e2b.app'],
  outputFileTracingIncludes: {
    '/api/agent/run': binaryIncludes,
    '/api/runtime/probe': binaryIncludes,
    '/api/runtime/poc': binaryIncludes,
    '/api/models/test': binaryIncludes,
  },
  /**
   * This deployment hosts a copy of someone else's landing page for a private
   * proof of concept, so keep it out of search indexes.
   */
  async headers() {
    return winfyPaths.map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    }));
  },
  async rewrites() {
    return {
      beforeFiles: winfyPaths.map((source) => ({ source, destination: '/winfy-site.html' })),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
