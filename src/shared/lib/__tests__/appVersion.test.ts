import { normalizeVersion } from '@/shared/lib/appVersion';

describe('normalizeVersion', () => {
  it('returns version and build when both are present', () => {
    expect(normalizeVersion('1.2.0', '42')).toEqual({ version: '1.2.0', build: '42' });
  });

  it('keeps the version when the build number is missing', () => {
    expect(normalizeVersion('1.2.0', null)).toEqual({ version: '1.2.0', build: null });
    expect(normalizeVersion('1.2.0', '  ')).toEqual({ version: '1.2.0', build: null });
  });

  it('returns null when the version cannot be read', () => {
    expect(normalizeVersion(null, '42')).toBeNull();
    expect(normalizeVersion(undefined, undefined)).toBeNull();
    expect(normalizeVersion('', '42')).toBeNull();
  });
});
