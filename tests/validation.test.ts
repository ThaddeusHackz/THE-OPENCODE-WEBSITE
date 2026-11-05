import { describe, expect, it } from 'vitest';
import {
  isSafeArchivePath,
  safeJoin,
  validatePrompt,
  validateRef,
  validateRepoFullName,
  validateSessionId,
  ValidationError,
} from '../src/lib/validation';

describe('repository / ref / prompt validation', () => {
  it('accepts well-formed inputs', () => {
    expect(validateRepoFullName('octocat/hello-world')).toBe('octocat/hello-world');
    expect(validateRef('feature/my-branch')).toBe('feature/my-branch');
    expect(validateRef('a1b2c3d')).toBe('a1b2c3d');
    expect(validatePrompt('  explain the auth flow  ')).toBe('explain the auth flow');
  });

  it.each([
    ['../etc/passwd', 'traversal'],
    ['owner\\repo', 'backslash'],
    ['owner/repo.git', 'git suffix'],
    ['owner/repo;rm -rf /', 'shell characters'],
    ['', 'empty'],
    ['owner/', 'missing repo'],
    ['a/b/c', 'too many segments'],
  ])('rejects unsafe repoFullName %s (%s)', (value) => {
    expect(() => validateRepoFullName(value)).toThrow(ValidationError);
  });

  it.each([
    ['../main', 'traversal'],
    ['-main', 'option injection'],
    ['main^', 'git rev syntax'],
    ['main~1', 'git rev syntax'],
    ['main;echo hi', 'shell metacharacter'],
    ['main//x', 'double slash'],
    ['main@{1}', 'git reflog'],
    ['main x', 'whitespace'],
    ['main\0x', 'null byte'],
    ['main\\x', 'backslash'],
    ['refs/heads/../x', 'traversal in ref'],
  ])('rejects unsafe ref %s (%s)', (value) => {
    expect(() => validateRef(value)).toThrow(ValidationError);
  });

  it('rejects empty, oversized and null-byte prompts', () => {
    expect(() => validatePrompt('')).toThrow(ValidationError);
    expect(() => validatePrompt('x'.repeat(8001))).toThrow(ValidationError);
    expect(() => validatePrompt('hello\0world')).toThrow(ValidationError);
  });

  it('validates session ids', () => {
    expect(validateSessionId('3f2504e0-4f89-11d3-9a0c-0305e82c3301')).toContain('3f2504e0');
    expect(() => validateSessionId('not-a-uuid')).toThrow(ValidationError);
  });
});

describe('archive path safety', () => {
  it('accepts safe relative paths', () => {
    expect(isSafeArchivePath('src/index.ts')).toBe(true);
    expect(isSafeArchivePath('a/b/./c')).toBe(true);
  });

  it.each([
    '/etc/passwd',
    '../outside.txt',
    'a/../../b',
    'C:\\Windows\\system32',
    'a\\b',
    'a\0b',
    '',
  ])('rejects unsafe archive path %s', (value) => {
    expect(isSafeArchivePath(value)).toBe(false);
  });

  it('safeJoin refuses traversal', () => {
    expect(safeJoin('/tmp/ws', 'src/a.ts')).toBe('/tmp/ws/src/a.ts');
    expect(() => safeJoin('/tmp/ws', '../secret')).toThrow(ValidationError);
  });
});
