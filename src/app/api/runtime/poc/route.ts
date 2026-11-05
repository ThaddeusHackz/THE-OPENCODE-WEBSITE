import { jsonOk } from '@/lib/http';
import { probeOpenCode } from '@/lib/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Public, read-only minimal PoC for a Vercel Function. It ONLY spawns the real
 * OpenCode binary with `--version`; no model call, no repository, no credentials,
 * no writes outside /tmp. It exists so a deployment can be verified without a
 * Supabase session. The authenticated route is /api/runtime/probe.
 */
export async function GET() {
  return jsonOk(await probeOpenCode());
}
