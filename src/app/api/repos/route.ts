import { NextRequest } from 'next/server';
import { githubLoginFromUser } from '@/lib/auth';
import { assertRepoAuthorized, listAuthorizedRepositories, resolveGitHubContext } from '@/lib/github/context';
import { jsonError, jsonOk } from '@/lib/http';
import { requireRouteUser } from '@/lib/route-context';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { user, applyCookies } = await requireRouteUser(request);
    const login = githubLoginFromUser(user);
    if (!login) {
      return applyCookies(jsonOk({ repos: [], mode: 'none', reason: 'GITHUB_IDENTITY_MISSING' }));
    }
    const context = await resolveGitHubContext();
    const all = await listAuthorizedRepositories(context);
    const candidates = all.slice(0, 30);
    const results = await Promise.all(
      candidates.map(async (repo) => {
        try {
          await assertRepoAuthorized(context, repo.full_name, login, all);
          return repo;
        } catch {
          return null;
        }
      }),
    );
    const repos = results.filter((repo): repo is NonNullable<typeof repo> => repo !== null);
    return applyCookies(jsonOk({ repos, mode: context.mode, limited: all.length > candidates.length }));
  } catch (error) {
    return jsonError(error);
  }
}
