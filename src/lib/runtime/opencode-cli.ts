import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '../errors';
import { PROVIDER_KEY_NAMES, readServerEnv } from '../env';
import { DEFAULT_FREE_MODEL, isFreeOpenCodeModel, validateModel } from '../models';
import {
  diffSnapshots,
  snapshotFiles,
  withTempWorkspace,
  type TempWorkspace,
} from '../workspace';
import type { AgentRunRequest, AgentRunResult, RuntimeAdapter, RuntimeProbeResult } from './types';

const RUNTIME_ID = 'opencode-cli' as const;

const BUNDLED_BINARY_CANDIDATES = [
  path.join(process.cwd(), 'node_modules', '@opencode', 'cli-linux-x64', 'bin', 'opencode'),
  path.join(process.cwd(), 'node_modules', '@opencode', 'cli', 'bin', 'opencode.exe'),
];

/** Locate the real OpenCode binary. Never downloads, never substitutes a mock. */
export function resolveOpenCodeBinary(
  env: Record<string, string | undefined> = process.env,
  exists: (file: string) => boolean = existsSync,
): string | null {
  const candidates = [env.OPENCODE_BINARY_PATH ?? '', ...BUNDLED_BINARY_CANDIDATES];
  for (const candidate of candidates) {
    if (candidate && path.isAbsolute(candidate) && exists(candidate)) return candidate;
  }
  return null;
}

/**
 * Build a brand-new environment for the child process. Nothing from process.env
 * is inherited except PATH and the allowlisted model keys. GitHub, Supabase and
 * Vercel credentials are NOT passed to the agent.
 */
export function buildChildEnv(
  workspace: TempWorkspace,
  source: Record<string, string | undefined> = process.env,
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    PATH: source.PATH ?? '/usr/local/bin:/usr/bin:/bin',
    HOME: workspace.home,
    XDG_CONFIG_HOME: workspace.config,
    XDG_DATA_HOME: workspace.data,
    XDG_CACHE_HOME: workspace.cache,
    XDG_STATE_HOME: workspace.state,
    TMPDIR: workspace.tmp,
    TMP: workspace.tmp,
    TEMP: workspace.tmp,
    NO_COLOR: '1',
    CI: '1',
    NODE_ENV: 'production',
  };
  for (const name of PROVIDER_KEY_NAMES) {
    const value = source[name];
    if (value) env[name] = value;
  }
  return env;
}

/** Replace any host secret-looking value before output is stored or returned. */
export function redactSecrets(text: string, source: Record<string, string | undefined> = process.env): string {
  let result = text;
  for (const [name, value] of Object.entries(source)) {
    if (!value || typeof value !== 'string' || value.length < 8) continue;
    if (!/(KEY|TOKEN|SECRET|PASSWORD|PRIVATE|CREDENTIAL)/i.test(name)) continue;
    result = result.split(value).join('[REDACTED]');
  }
  return result;
}

export function extractAssistantText(stdout: string): { text: string | null; errors: string[] } {
  const texts: string[] = [];
  const errors: string[] = [];
  for (const line of stdout.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line) as {
        type?: string;
        part?: { text?: unknown };
        error?: { message?: unknown } | string;
      };
      if (event.type === 'text' && typeof event.part?.text === 'string') texts.push(event.part.text);
      if (event.type === 'error') {
        const message =
          typeof event.error === 'string'
            ? event.error
            : typeof event.error?.message === 'string'
              ? event.error.message
              : 'OpenCode reported an error';
        errors.push(message);
      }
    } catch {
      // non-JSON diagnostic lines are retained in the raw stdout field
    }
  }
  return { text: texts.join('\n').trim() || null, errors };
}

type SpawnResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
};

function spawnWithTimeout(
  binary: string,
  args: string[],
  options: {
    cwd: string;
    env: NodeJS.ProcessEnv;
    timeoutMs: number;
    maxOutputBytes: number;
    stdin?: string;
  },
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(binary, args, {
        cwd: options.cwd,
        env: options.env,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: true,
        windowsHide: true,
      });
    } catch (error) {
      reject(error);
      return;
    }
    const cap = (current: string, chunk: Buffer): string => {
      const next = current + chunk.toString('utf8');
      return next.length > options.maxOutputBytes ? next.slice(0, options.maxOutputBytes) : next;
    };
    child.stdout?.on('data', (chunk: Buffer) => {
      stdout = cap(stdout, chunk);
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr = cap(stderr, chunk);
    });
    const finish = (exitCode: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode, timedOut, durationMs: Date.now() - started });
    };
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (child.pid) process.kill(-child.pid, 'SIGKILL');
      } catch {
        try {
          child.kill('SIGKILL');
        } catch {
          /* already gone */
        }
      }
    }, options.timeoutMs);
    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => finish(code));
    try {
      child.stdin?.end(options.stdin ?? '');
    } catch {
      /* stdin already closed */
    }
  });
}

/** Strict project config written into the ephemeral workspace only. */
export async function writeWorkspaceOpenCodeConfig(repoDir: string, model: string): Promise<void> {
  const config = {
    $schema: 'https://opencode.ai/config.json',
    model,
    permissions: [
      { action: 'read', resource: '*', effect: 'allow' },
      { action: 'read', resource: '*.env', effect: 'deny' },
      { action: 'read', resource: '*.env.*', effect: 'deny' },
      { action: 'read', resource: '*.env.example', effect: 'allow' },
      { action: 'edit', resource: '*', effect: 'allow' },
      { action: 'glob', resource: '*', effect: 'allow' },
      { action: 'grep', resource: '*', effect: 'allow' },
      { action: 'shell', resource: '*', effect: 'deny' },
      { action: 'external_directory', resource: '*', effect: 'deny' },
      { action: 'webfetch', resource: '*', effect: 'deny' },
      { action: 'websearch', resource: '*', effect: 'deny' },
      { action: 'subagent', resource: '*', effect: 'deny' },
      { action: 'execute', resource: '*', effect: 'deny' },
    ],
  };
  await writeFile(path.join(repoDir, 'opencode.jsonc'), JSON.stringify(config, null, 2), 'utf8');
}

/** Minimal real-runtime proof of concept: spawn the actual binary and read --version. */
export async function probeOpenCode(): Promise<RuntimeProbeResult> {
  const binary = resolveOpenCodeBinary();
  if (!binary) {
    return {
      available: false,
      runtimeId: RUNTIME_ID,
      binaryPath: null,
      versionOutput: null,
      error:
        'OPENCODE_RUNTIME_NOT_FOUND: no OpenCode CLI binary is available in this function. ' +
        'Set OPENCODE_BINARY_PATH or include @opencode/cli-linux-x64 in the deployment bundle.',
      ephemeralWorkspace: true,
    };
  }
  try {
    return await withTempWorkspace(async (workspace) => {
      const result = await spawnWithTimeout(binary, ['--version'], {
        cwd: workspace.repo,
        env: buildChildEnv(workspace),
        timeoutMs: 30_000,
        maxOutputBytes: 20_000,
      });
      return {
        available: result.exitCode === 0 && !result.timedOut,
        runtimeId: RUNTIME_ID,
        binaryPath: binary,
        versionOutput: redactSecrets(result.stdout.trim()),
        error: result.exitCode === 0 ? null : redactSecrets(result.stderr.trim()) || `exit ${result.exitCode}`,
        ephemeralWorkspace: true,
      };
    });
  } catch (error) {
    return {
      available: false,
      runtimeId: RUNTIME_ID,
      binaryPath: binary,
      versionOutput: null,
      error: `OPENCODE_PROBE_FAILED: ${redactSecrets(error instanceof Error ? error.message : String(error))}`,
      ephemeralWorkspace: true,
    };
  }
}

/**
 * Run the real `opencode run` in an isolated /tmp workspace. Uses --standalone
 * (no shared background service, no fixed port 49374) and a hard timeout.
 * Repository contents are untrusted; the child gets a stripped environment.
 */
export async function runOpenCodeAgent(request: AgentRunRequest): Promise<AgentRunResult> {
  const cfg = readServerEnv();
  const binary = resolveOpenCodeBinary();
  if (!binary) {
    throw new AppError(
      503,
      'OPENCODE_RUNTIME_NOT_FOUND',
      'The real OpenCode runtime is not available in this function. No agent reply was generated. See docs/ARCHITECTURE.md.',
    );
  }
  let model: string;
  try {
    model = validateModel(request.model, cfg.openCodeModel || DEFAULT_FREE_MODEL);
  } catch (error) {
    throw new AppError(400, 'INVALID_MODEL', error instanceof Error ? error.message : 'Invalid model.');
  }
  // Official OpenCode Zen free models work signed out; everything else needs a key.
  if (!isFreeOpenCodeModel(model) && cfg.providerKeyNames.length === 0) {
    throw new AppError(
      503,
      'OPENCODE_NOT_CONFIGURED',
      'A model-provider key is required for a non-free model. No reply was generated.',
    );
  }

  await writeWorkspaceOpenCodeConfig(request.workspace.repo, model);
  const before = await snapshotFiles(request.workspace.repo);
  const args = ['--standalone', 'run', '--format', 'json', '--auto', '--model', model];
  let spawned: SpawnResult;
  try {
    spawned = await spawnWithTimeout(binary, args, {
      cwd: request.workspace.repo,
      env: buildChildEnv(request.workspace),
      timeoutMs: cfg.openCodeTimeoutMs,
      maxOutputBytes: cfg.openCodeMaxOutputBytes,
      stdin: request.prompt,
    });
  } catch (error) {
    throw new AppError(
      502,
      'OPENCODE_SPAWN_FAILED',
      `Could not start the OpenCode runtime: ${redactSecrets(error instanceof Error ? error.message : String(error))}`,
    );
  }
  const after = await snapshotFiles(request.workspace.repo);
  const { changes, patch } = diffSnapshots(before, after);
  const parsed = extractAssistantText(spawned.stdout);
  const stdout = redactSecrets(spawned.stdout);
  const stderr = redactSecrets(spawned.stderr);

  let error: string | null = null;
  if (spawned.timedOut) {
    error = `AGENT_TIMEOUT: the agent did not finish within ${cfg.openCodeTimeoutMs} ms. Vercel functions also have a hard maxDuration; increase the plan limit or shorten the request.`;
  } else if (spawned.exitCode !== 0 || parsed.errors.length > 0) {
    error = parsed.errors[0] ?? stderr.slice(0, 500) ?? `OpenCode exited with code ${spawned.exitCode}`;
  } else if (!parsed.text) {
    error = 'OPENCODE_NO_OUTPUT: the real runtime produced no assistant text. No reply was fabricated.';
  }

  return {
    ok: error === null,
    runtimeId: RUNTIME_ID,
    text: parsed.text,
    error,
    exitCode: spawned.exitCode,
    durationMs: spawned.durationMs,
    stdout: stdout.slice(0, cfg.openCodeMaxOutputBytes),
    stderr: stderr.slice(0, 20_000),
    changes,
    patch,
    workspaceEphemeral: true,
    timedOut: spawned.timedOut,
  };
}

/** Real, tiny model-backed run used to verify an official free model works. */
export type ModelSmokeResult = {
  ok: boolean;
  runtimeId: 'opencode-cli';
  model: string;
  text: string | null;
  error: string | null;
  exitCode: number | null;
  durationMs: number;
  timedOut: boolean;
  stdout: string;
  stderr: string;
};

export async function runOpenCodeSmokeTest(requestedModel: string): Promise<ModelSmokeResult> {
  const cfg = readServerEnv();
  const binary = resolveOpenCodeBinary();
  if (!binary) {
    throw new AppError(503, 'OPENCODE_RUNTIME_NOT_FOUND', 'The real OpenCode binary is not available in this function.');
  }
  let model: string;
  try {
    model = validateModel(requestedModel, cfg.openCodeModel || DEFAULT_FREE_MODEL);
  } catch (error) {
    throw new AppError(400, 'INVALID_MODEL', error instanceof Error ? error.message : 'Invalid model.');
  }
  if (!isFreeOpenCodeModel(model) && cfg.providerKeyNames.length === 0) {
    throw new AppError(503, 'OPENCODE_NOT_CONFIGURED', 'A model-provider key is required for a non-free model.');
  }
  return withTempWorkspace(async (workspace) => {
    await writeWorkspaceOpenCodeConfig(workspace.repo, model);
    await writeFile(path.join(workspace.repo, 'README.md'), '# free-model smoke test\n', 'utf8');
    const args = ['--standalone', 'run', '--format', 'json', '--auto', '--model', model];
    let spawned: SpawnResult;
    try {
      spawned = await spawnWithTimeout(binary, args, {
        cwd: workspace.repo,
        env: buildChildEnv(workspace),
        timeoutMs: Math.min(cfg.openCodeTimeoutMs, 90_000),
        maxOutputBytes: cfg.openCodeMaxOutputBytes,
        stdin: 'Reply with the single word OK.',
      });
    } catch (error) {
      throw new AppError(502, 'OPENCODE_SPAWN_FAILED', `Could not start OpenCode: ${redactSecrets(String(error))}`);
    }
    const parsed = extractAssistantText(spawned.stdout);
    const stdout = redactSecrets(spawned.stdout);
    const stderr = redactSecrets(spawned.stderr);
    let error: string | null = null;
    if (spawned.timedOut) error = 'AGENT_TIMEOUT: the model did not answer within the smoke-test limit.';
    else if (spawned.exitCode !== 0 || parsed.errors.length > 0)
      error = parsed.errors[0] ?? stderr.slice(0, 500) ?? `OpenCode exited with code ${spawned.exitCode}`;
    else if (!parsed.text) error = 'OPENCODE_NO_OUTPUT: the real runtime produced no assistant text.';
    return {
      ok: error === null,
      runtimeId: RUNTIME_ID,
      model,
      text: parsed.text,
      error,
      exitCode: spawned.exitCode,
      durationMs: spawned.durationMs,
      timedOut: spawned.timedOut,
      stdout: stdout.slice(0, 2000),
      stderr: stderr.slice(0, 1000),
    };
  });
}

export const openCodeCliAdapter: RuntimeAdapter = {
  id: RUNTIME_ID,
  probe: probeOpenCode,
  run: runOpenCodeAgent,
};
