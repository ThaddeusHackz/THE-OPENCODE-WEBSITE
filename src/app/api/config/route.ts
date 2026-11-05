import { configStatus } from '@/lib/env';
import { jsonOk } from '@/lib/http';

export const runtime = 'nodejs';

/** Public, non-secret configuration status. Used to show setup messages. */
export async function GET() {
  return jsonOk(configStatus());
}
