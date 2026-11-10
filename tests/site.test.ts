import { describe, expect, it } from 'vitest';
import { APPS, APP_PATHS, GAMES, getApp, launchHref, relatedApps } from '../src/lib/apps';
import { WINFY_OS_PROFILES, resolveWinfyOs, resolveWinfyWindow, sanitizeNextPath } from '../src/lib/winfy/catalog';

describe('public app catalog', () => {
  it('uses unique flat paths that match the slug', () => {
    expect(new Set(APP_PATHS).size).toBe(APPS.length);
    for (const app of APPS) {
      expect(app.path).toBe(`/${app.slug}`);
      expect(app.path.startsWith('//')).toBe(false);
    }
  });

  it('only launches real desktop windows and real OS profiles', () => {
    const osIds = new Set(WINFY_OS_PROFILES.map((profile) => profile.id));
    for (const app of APPS) {
      expect(osIds.has(app.launch.os)).toBe(true);
      expect(resolveWinfyOs(app.launch.os).id).toBe(app.launch.os);
      expect(resolveWinfyWindow(app.launch.window)).toBe(app.launch.window);
      expect(launchHref(app)).toBe(`/runwine?os=${app.launch.os}&window=${app.launch.window}&desktop=1`);
    }
  });

  it('keeps every app page complete enough to render', () => {
    for (const app of APPS) {
      expect(app.name.length).toBeGreaterThan(1);
      expect(app.lead.length).toBeGreaterThan(10);
      expect(app.description.length).toBeGreaterThan(0);
      expect(app.features.length).toBeGreaterThanOrEqual(3);
      expect(app.requirements.length).toBeGreaterThan(0);
      expect(app.limitations.length).toBeGreaterThan(0);
      expect(app.preview).toBe(`/previews/${app.slug}.jpg`);
      expect(app.previewAlt.length).toBeGreaterThan(10);
    }
  });

  it('resolves slugs and related apps without repeating the current app', () => {
    expect(getApp('wine-online')?.name).toBe('Wine Basic');
    expect(getApp('/wine-online/')?.slug).toBe('wine-online');
    expect(getApp('nope')).toBeUndefined();
    const app = APPS[0];
    const related = relatedApps(app);
    expect(related).toHaveLength(4);
    expect(related.some((item) => item.slug === app.slug)).toBe(false);
    expect(GAMES.length).toBe(3);
  });

  it('allows post-OAuth returns to app pages and legal pages', () => {
    for (const path of APP_PATHS) {
      expect(sanitizeNextPath(path)).toBe(path);
      expect(sanitizeNextPath(`${path}?utm=1`)).toBe(`${path}?utm=1`);
    }
    expect(sanitizeNextPath('/terms-of-service')).toBe('/terms-of-service');
    expect(sanitizeNextPath('/privacy-policy')).toBe('/privacy-policy');
    expect(sanitizeNextPath('/apps')).toBe('/');
  });
});
