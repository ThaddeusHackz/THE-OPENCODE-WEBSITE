import path from 'node:path';
import { NextRequest } from 'next/server';
import { assertOwnership, githubLoginFromUser } from '@/lib/auth';
import { createSession, getSession, insertMessage } from '@/lib/data';
import { configStatus, readServerEnv } from '@/lib/env';
import { AppError, safeErrorMessage } from '@/lib/errors';
import { assertRepoAuthorized, listAuthorizedRepositories, resolveGitHubContext } from '@/lib/github/context';
import { downloadRepositoryArchive } from '@/lib/github/repos';
import { jsonError, jsonOk } from '@/lib/http';
import { probeOpenCode, resolveOpenCodeBinary, runOpenCodeAgent } from '@/lib/runtime';
import { validateModel } from '@/lib/models';
import { requireRouteUser } from '@/lib/route-context';
import { validatePrompt, validateRef, validateRepoFullName, validateSessionId, ValidationError } from '@/lib/validation';
import { extractRepositoryArchive, withTempWorkspace } from '@/lib/workspace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Hobby max is 300 s. On Pro/Enterprise this can be raised to 800 s. */
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  let context: Awaited<ReturnType<typeof requireRouteUser>> | null = null;
  let sessionIdForError: string | null = null;
  try {
    context = await requireRouteUser(request);
    const { supabase, user, applyCookies } = context;
    const body = (await request.json()) as Record<string, unknown>;

    // A user id from the browser is never trusted; reject a mismatched one.
    assertOwnership(user.id, typeof body.userId === 'string' ? body.userId : null);

    const cfg = readServerEnv();
    const repoFullName = validateRepoFullName(body.repoFullName);
    const ref = validateRef(body.ref);
    const prompt = validatePrompt(body.prompt);
    let selectedModel: string;
    try {
      selectedModel = validateModel(body.model, cfg.openCodeModel);
    } catch (error) {
      throw new AppError(400, 'INVALID_MODEL', error instanceof Error ? error.message : 'Invalid model.');
    }

    let sessionId = body.sessionId ? validateSessionId(body.sessionId) : null;
    if (sessionId) {
      const session = await getSession(supabase as any, user.id, sessionId);
      if (!session) throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found.');
    } else {
      const session = await createSession(supabase as any, user.id, {
        title: `${repoFullName} · ${ref}`,
        repoFullName,
        ref,
      });
      sessionId = session.id;
    }
    sessionIdForError = sessionId;
    await insertMessage(supabase as any, user.id, {
      sessionId,
      role: 'user',
      content: prompt,
      metadata: { repoFullName, ref, model: selectedModel },
    });

    // --- repository authorization (GitHub App preferred, PAT fallback) -------
    const github = await resolveGitHubContext();
    const allowlist = await listAuthorizedRepositories(github);
    const login = githubLoginFromUser(user);
    if (!login) throw new AppError(403, 'GITHUB_IDENTITY_MISSING', 'Cannot verify GitHub repository access for this account.');
    await assertRepoAuthorized(github, repoFullName, login, allowlist);
    const token = github.token;

    // --- runtime configuration (never fabricate a reply) ---------------------
    const status = configStatus();
    if (!status.openCodeConfigured) {
      throw new AppError(503, 'OPENCODE_NOT_CONFIGURED', status.setupMessage);
    }
    if (!resolveOpenCodeBinary()) {
      throw new AppError(
        503,
        'OPENCODE_RUNTIME_NOT_FOUND',
        'The actual OpenCode binary is not available in this function. No agent reply was generated. See docs/ARCHITECTURE.md.',
      );
    }

    // --- fresh temporary workspace, real runtime, save results ---------------
    const result = await withTempWorkspace(async (workspace) => {
      const archivePath = path.join(workspace.tmp, 'repo.tar.gz');
      await downloadRepositoryArchive(token, repoFullName, ref, archivePath, cfg.openCodeMaxRepoBytes);
      await extractRepositoryArchive(archivePath, workspace.repo);
      return runOpenCodeAgent({ workspace, prompt, repoFullName, ref, model: selectedModel });
    });

    if (result.ok) {
      await insertMessage(supabase as any, user.id, {
        sessionId,
        role: 'assistant',
        content: result.text ?? '',
        metadata: {
          runtime: result.runtimeId,
          model: selectedModel,
          repoFullName,
          ref,
          workspace: 'ephemeral',
          exitCode: result.exitCode,
          durationMs: result.durationMs,
          changes: result.changes,
          patch: result.patch,
          stdout: result.stdout.slice(0, 2000),
          stderr: result.stderr.slice(0, 2000),
        },
      });
    } else {
      await insertMessage(supabase as any, user.id, {
        sessionId,
        role: 'system',
        content: `OpenCode request failed: ${result.error ?? 'unknown error'}`,
        metadata: {
          runtime: result.runtimeId,
          workspace: 'ephemeral',
          exitCode: result.exitCode,
          timedOut: result.timedOut,
          changes: result.changes,
          patch: result.patch,
          stderr: result.stderr.slice(0, 2000),
        },
      });
    }

    return applyCookies(
      jsonOk(
        {
          ok: result.ok,
          sessionId,
          result: {
            text: result.text,
            error: result.error,
            exitCode: result.exitCode,
            durationMs: result.durationMs,
            timedOut: result.timedOut,
            changes: result.changes,
            patch: result.patch,
            runtime: result.runtimeId,
            model: selectedModel,
            workspace: 'ephemeral',
          },
        },
        result.ok ? 200 : 502,
      ),
    );
  } catch (error) {
    if (context && sessionIdForError) {
      await insertMessage(context.supabase as any, context.user.id, {
        sessionId: sessionIdForError,
        role: 'system',
        content: `Request failed: ${safeErrorMessage(error)}`,
        metadata: { error: true, workspace: 'ephemeral' },
      }).catch(() => undefined);
    }
    if (error instanceof SyntaxError || error instanceof ValidationError) {
      return jsonError(new AppError(400, 'INVALID_REQUEST', safeErrorMessage(error)));
    }
    return jsonError(error);
  }
}

/** Read-only probe so the UI can report the real runtime status. */
export async function GET(request: NextRequest) {
  try {
    const { applyCookies } = await requireRouteUser(request);
    return applyCookies(jsonOk(await probeOpenCode()));
  } catch (error) {
    return jsonError(error);
  }
}
