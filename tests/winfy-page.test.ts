import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_PATHS } from '../src/lib/apps';

/**
 * The public landing page is the reference portal kept verbatim in
 * `public/winfy-site.html` and served for `/`, `/opencode-studio` and the
 * legacy `/runwine*` URLs (see `winfyPaths` in next.config.ts).
 *
 * These assertions protect the two things that break a cloned document:
 * root-relative assets (which would 404 on this domain) and root-relative
 * links pointing at pages this app does not have.
 */
const html = readFileSync(path.join(process.cwd(), 'public', 'winfy-site.html'), 'utf8');

function attributeValues(attribute: string): string[] {
  const pattern = new RegExp(`\\b${attribute}=(["']?)([^"'\\s>]+)\\1`, 'g');
  return [...html.matchAll(pattern)].map((match) => match[2]);
}

describe('vendored portal document', () => {
  it('is the reference landing page', () => {
    expect(html).toContain('Our secure services & win systems');
    expect(html).toMatch(/<title>[^<]*Secure Win apps with Winfy/);
    expect(html.length).toBeGreaterThan(400_000);
  });

  it('loads every asset from an absolute URL', () => {
    const relative = attributeValues('src').filter((value) => value.startsWith('/') && !value.startsWith('//'));
    expect(relative).toEqual([]);
  });

  it('only links to pages this app can serve', () => {
    const internal = new Set<string>(['/', ...APP_PATHS]);
    const relativeHrefs = attributeValues('href').filter((value) => value.startsWith('/') && !value.startsWith('//'));
    expect(relativeHrefs.length).toBeGreaterThan(0);
    for (const href of relativeHrefs) {
      expect(internal.has(href), `unexpected internal link ${href}`).toBe(true);
    }
  });

  it('keeps the tile grid on this domain', () => {
    for (const appPath of APP_PATHS) {
      if (appPath === '/windows-explorer' || appPath === '/terminal') continue;
      expect(html, `missing tile link to ${appPath}`).toContain(`href="${appPath}"`);
    }
  });
});
