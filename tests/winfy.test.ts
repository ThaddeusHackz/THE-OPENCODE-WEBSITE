import { describe, expect, it } from 'vitest';
import {
  DEFAULT_WINFY_OS,
  WINFY_APPS,
  WINFY_OS_PROFILES,
  resolveWinfyOs,
  resolveWinfyWindow,
  sanitizeNextPath,
} from '../src/lib/winfy/catalog';

describe('Winfy RunWine catalog and routing helpers', () => {
  it('defaults to winegui_2_ubuntu-22-amd64 when os param is empty or unknown', () => {
    expect(resolveWinfyOs().id).toBe(DEFAULT_WINFY_OS);
    expect(resolveWinfyOs('').id).toBe(DEFAULT_WINFY_OS);
    expect(resolveWinfyOs('unknown-os-injection').id).toBe(DEFAULT_WINFY_OS);
  });

  it('resolves exact Winfy os query parameters and friendly aliases', () => {
    expect(resolveWinfyOs('winegui_2_ubuntu-22-amd64').theme).toBe('ubuntu-winegui');
    expect(resolveWinfyOs('winfy-windows11-basic-22.04.3-desktop-amd64').theme).toBe('win11');
    expect(resolveWinfyOs('win-10-theme').theme).toBe('win10');
    expect(resolveWinfyOs('reactos-online').theme).toBe('reactos');
    expect(resolveWinfyOs('reactos').id).toBe('reactos-online');
  });

  it('validates desktop window identifiers strictly', () => {
    expect(resolveWinfyWindow('opencode')).toBe('opencode');
    expect(resolveWinfyWindow('winegui')).toBe('winegui');
    expect(resolveWinfyWindow('format-factory')).toBe('format-factory');
    expect(resolveWinfyWindow('<script>')).toBeNull();
  });

  it('ensures every catalog app maps to a known OS profile and window', () => {
    const validOsIds = new Set(WINFY_OS_PROFILES.map((item) => item.id));
    for (const app of WINFY_APPS) {
      expect(validOsIds.has(app.osParam)).toBe(true);
      expect(resolveWinfyWindow(app.targetWindow)).toBe(app.targetWindow);
    }
  });

  it('prevents open redirects in post-OAuth return paths', () => {
    expect(sanitizeNextPath('/workspace?os=winegui_2_ubuntu-22-amd64&desktop=1')).toBe(
      '/workspace?os=winegui_2_ubuntu-22-amd64&desktop=1',
    );
    expect(sanitizeNextPath('/?desktop=1')).toBe('/?desktop=1');
    expect(sanitizeNextPath('https://evil.example/phish')).toBe('/');
    expect(sanitizeNextPath('//evil.example/phish')).toBe('/');
    expect(sanitizeNextPath('/\\evil.example')).toBe('/');
    expect(sanitizeNextPath('/api/auth/signout')).toBe('/');
    expect(sanitizeNextPath('/workspace\r\nLocation: https://evil.example')).toBe('/');
  });
});
