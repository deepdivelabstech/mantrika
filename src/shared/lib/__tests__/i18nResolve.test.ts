import { resolveString } from '@/shared/lib/i18nResolve';

const catalog = {
  en: { hello: 'Hello', onlyInEnglish: 'English only' },
  hi: { hello: 'नमस्ते' },
};

describe('resolveString', () => {
  it('resolves a key present in the requested language', () => {
    expect(resolveString(catalog, 'hi', 'en', 'hello')).toBe('नमस्ते');
  });

  it('falls back to English when the key is missing from the requested language', () => {
    expect(resolveString(catalog, 'hi', 'en', 'onlyInEnglish')).toBe('English only');
  });

  it('falls back to the raw key when missing everywhere, never blanking the UI', () => {
    expect(resolveString(catalog, 'hi', 'en', 'nonexistent.key')).toBe('nonexistent.key');
  });

  it('handles an entirely unknown language by falling back', () => {
    expect(resolveString(catalog, 'fr', 'en', 'hello')).toBe('Hello');
  });
});
