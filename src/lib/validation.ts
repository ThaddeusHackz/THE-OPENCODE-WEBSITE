/**
 * Pure input validators. These are deliberately strict: repo/ref/path values are
 * used to build GitHub API URLs, tar extraction paths and (never) shell arguments.
 * No value from the browser is ever trusted.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const REPO_FULL_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;
const REF_RE = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FORBIDDEN_REF_CHARS = new Set(['\\', '^', '~', ':', '?', '*', '[', ']', '\0']);

function hasControlOrForbiddenChars(value: string): boolean {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code < 0x20 || code === 0x7f || FORBIDDEN_REF_CHARS.has(char) || /\s/.test(char)) return true;
  }
  return false;
}

export function validateRepoFullName(value: unknown): string {
  if (typeof value !== 'string') throw new ValidationError('repoFullName must be a string');
  const repo = value.trim();
  if (!REPO_FULL_NAME_RE.test(repo)) throw new ValidationError('repoFullName must be owner/repo');
  if (repo.includes('..') || repo.endsWith('.git') || repo.includes('\\') || repo.includes('\0')) {
    throw new ValidationError('repoFullName contains unsafe characters');
  }
  return repo;
}

/** Branch, tag or short/full commit SHA. Rejects git-option injection and traversal. */
export function validateRef(value: unknown): string {
  if (typeof value !== 'string') throw new ValidationError('ref must be a string');
  const ref = value.trim();
  if (!REF_RE.test(ref)) throw new ValidationError('ref contains unsupported characters');
  if (
    ref.includes('..') ||
    ref.includes('//') ||
    ref.startsWith('-') ||
    ref.endsWith('/') ||
    ref.includes('@{') ||
    hasControlOrForbiddenChars(ref)
  ) {
    throw new ValidationError('ref contains unsafe characters');
  }
  return ref;
}

export function validatePrompt(value: unknown): string {
  if (typeof value !== 'string') throw new ValidationError('prompt must be a string');
  const prompt = value.trim();
  if (prompt.length === 0) throw new ValidationError('prompt must not be empty');
  if (prompt.length > 8000) throw new ValidationError('prompt must be at most 8000 characters');
  if (prompt.includes('\0')) throw new ValidationError('prompt contains a null byte');
  return prompt;
}

export function validateSessionId(value: unknown): string {
  if (typeof value !== 'string' || !UUID_RE.test(value)) {
    throw new ValidationError('sessionId must be a UUID');
  }
  return value;
}

/** True only for safe, relative, non-traversing archive members. */
export function isSafeArchivePath(memberPath: string): boolean {
  if (typeof memberPath !== 'string' || memberPath.length === 0 || memberPath.length > 1024) return false;
  if (memberPath.startsWith('/') || memberPath.startsWith('\\')) return false;
  if (memberPath.includes('\\') || memberPath.includes('\0')) return false;
  for (const char of memberPath) {
    const code = char.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) return false;
  }
  if (/^[A-Za-z]:/.test(memberPath)) return false;
  const parts = memberPath.split('/');
  for (const part of parts) {
    if (part === '..') return false;
  }
  return true;
}

/** Safe path join that refuses to escape the root. */
export function safeJoin(root: string, relative: string): string {
  if (!isSafeArchivePath(relative)) throw new ValidationError('unsafe relative path');
  const normalized = relative.split('/').filter((p) => p !== '' && p !== '.').join('/');
  return `${root.replace(/\/$/, '')}/${normalized}`;
}

export const PUBLISH_CONFIRM_PHRASE = 'I_CONFIRM_WRITE_BACK';
