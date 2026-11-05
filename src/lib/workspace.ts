import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as tar from 'tar';
import { AppError } from './errors';
import { isSafeArchivePath } from './validation';

export type TempWorkspace = {
  root: string;
  repo: string;
  home: string;
  config: string;
  data: string;
  cache: string;
  state: string;
  tmp: string;
};

/**
 * One fresh workspace per request. On Vercel this is /tmp (writable, up to 500 MB);
 * nothing is assumed to survive after the invocation. Always removed in finally.
 */
export async function withTempWorkspace<T>(fn: (workspace: TempWorkspace) => Promise<T>): Promise<T> {
  const root = await mkdtemp(path.join(tmpdir(), 'opencode-ws-'));
  const dirs: TempWorkspace = {
    root,
    repo: path.join(root, 'repo'),
    home: path.join(root, 'home'),
    config: path.join(root, 'xdg', 'config'),
    data: path.join(root, 'xdg', 'data'),
    cache: path.join(root, 'xdg', 'cache'),
    state: path.join(root, 'xdg', 'state'),
    tmp: path.join(root, 'tmp'),
  };
  await Promise.all(Object.values(dirs).map((dir) => mkdir(dir, { recursive: true })));
  try {
    return await fn(dirs);
  } finally {
    await rm(root, { recursive: true, force: true }).catch(() => undefined);
  }
}

export type ArchiveLimits = { maxFiles: number; maxBytes: number };

export const DEFAULT_ARCHIVE_LIMITS: ArchiveLimits = { maxFiles: 20_000, maxBytes: 100_000_000 };

/** Extract a GitHub tarball with path-traversal, symlink and size protection. */
export async function extractRepositoryArchive(
  archivePath: string,
  repoDir: string,
  limits: ArchiveLimits = DEFAULT_ARCHIVE_LIMITS,
): Promise<void> {
  let files = 0;
  let bytes = 0;
  let failure: AppError | null = null;
  await tar.x({
    file: archivePath,
    cwd: repoDir,
    strip: 1,
    filter: (memberPath: string, entry: unknown) => {
      if (failure) return false;
      const meta = entry as { type?: string; size?: number } | undefined;
      const type = meta?.type ?? 'File';
      if (!isSafeArchivePath(memberPath)) {
        failure = new AppError(400, 'UNSAFE_ARCHIVE_ENTRY', 'Archive contains an unsafe path.');
        return false;
      }
      if (type !== 'File' && type !== 'Directory' && type !== 'OldFile' && type !== 'ContiguousFile') {
        failure = new AppError(400, 'UNSAFE_ARCHIVE_ENTRY', 'Archive contains a non-regular entry (symlink/device/link).');
        return false;
      }
      const size = Number(meta?.size ?? 0);
      bytes += size;
      if (bytes > limits.maxBytes) {
        failure = new AppError(413, 'REPO_TOO_LARGE', 'Extracted repository exceeds the configured size limit.');
        return false;
      }
      if (type === 'File') {
        files += 1;
        if (files > limits.maxFiles) {
          failure = new AppError(413, 'REPO_TOO_LARGE', 'Repository contains too many files.');
          return false;
        }
      }
      return true;
    },
  });
  if (failure) throw failure;
}

export type FileSnapshot = Map<string, { size: number; sha256: string; text?: string }>;

const SKIP_DIRS = new Set(['.git', '.opencode', 'node_modules']);
const SKIP_FILES = new Set(['opencode.jsonc', 'opencode.json']);

export type SnapshotLimits = { maxFiles: number; maxTextBytesPerFile: number; maxTotalTextBytes: number };
export const DEFAULT_SNAPSHOT_LIMITS: SnapshotLimits = {
  maxFiles: 2000,
  maxTextBytesPerFile: 64_000,
  maxTotalTextBytes: 4_000_000,
};

/** Bounded content snapshot — no full repository copy is ever persisted. */
export async function snapshotFiles(
  root: string,
  limits: SnapshotLimits = DEFAULT_SNAPSHOT_LIMITS,
): Promise<FileSnapshot> {
  const result: FileSnapshot = new Map();
  let totalText = 0;

  async function walk(dir: string, relative: string): Promise<void> {
    if (result.size >= limits.maxFiles) return;
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (result.size >= limits.maxFiles) return;
      const rel = relative ? `${relative}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        await walk(full, rel);
        continue;
      }
      if (!entry.isFile() || SKIP_FILES.has(entry.name)) continue;
      const content = await readFile(full);
      const sha256 = createHash('sha256').update(content).digest('hex');
      const isText = !content.subarray(0, 8192).includes(0);
      const canStoreText =
        isText && content.length <= limits.maxTextBytesPerFile && totalText + content.length <= limits.maxTotalTextBytes;
      const record: { size: number; sha256: string; text?: string } = { size: content.length, sha256 };
      if (canStoreText) {
        record.text = content.toString('utf8');
        totalText += content.length;
      }
      result.set(rel, record);
    }
  }

  await walk(root, '');
  return result;
}

export type FileChange = {
  path: string;
  status: 'added' | 'removed' | 'modified';
  patch?: string;
};

/** Small LCS-based unified diff, bounded so only a summary can be stored. */
export function unifiedDiff(before: string, after: string): string {
  const a = before.split('\n');
  const b = after.split('\n');
  if (a.length > 400 || b.length > 400) return '[diff omitted: file too large]';
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const lines: string[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      lines.push(` ${a[i]}`);
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      lines.push(`-${a[i]}`);
      i += 1;
    } else {
      lines.push(`+${b[j]}`);
      j += 1;
    }
  }
  while (i < n) lines.push(`-${a[i++]}`);
  while (j < m) lines.push(`+${b[j++]}`);
  return lines.join('\n');
}

export function diffSnapshots(
  before: FileSnapshot,
  after: FileSnapshot,
  maxChanges = 20,
  maxPatchBytes = 32_000,
): { changes: FileChange[]; patch: string } {
  const paths = new Set([...before.keys(), ...after.keys()]);
  const changes: FileChange[] = [];
  const patches: string[] = [];
  let patchBytes = 0;
  for (const file of [...paths].sort()) {
    const old = before.get(file);
    const next = after.get(file);
    if (old?.sha256 === next?.sha256) continue;
    if (changes.length >= maxChanges) {
      changes.push({ path: '[additional changes omitted]', status: 'modified' });
      break;
    }
    const status: FileChange['status'] = !old ? 'added' : !next ? 'removed' : 'modified';
    const change: FileChange = { path: file, status };
    if (old?.text !== undefined || next?.text !== undefined) {
      const patch = unifiedDiff(old?.text ?? '', next?.text ?? '');
      const header = `--- a/${file}\n+++ b/${file}\n${patch}`;
      if (patchBytes + header.length <= maxPatchBytes) {
        change.patch = patch;
        patches.push(header);
        patchBytes += header.length;
      }
    }
    changes.push(change);
  }
  return { changes, patch: patches.join('\n\n') };
}
