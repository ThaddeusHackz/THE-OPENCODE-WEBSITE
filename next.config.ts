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

const nextConfig: NextConfig = {
  serverExternalPackages: ['tar'],
  outputFileTracingIncludes: {
    '/api/agent/run': binaryIncludes,
    '/api/runtime/probe': binaryIncludes,
    '/api/runtime/poc': binaryIncludes,
    '/api/models/test': binaryIncludes,
  },
  async rewrites() {
    return [
      { source: '/runwine/index.php', destination: '/runwine' },
      { source: '/runwine/start.php', destination: '/runwine' },
    ];
  },
};

export default nextConfig;
