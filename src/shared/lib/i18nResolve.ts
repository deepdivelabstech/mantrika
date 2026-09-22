type Dict = Record<string, string>;
type Catalog = Record<string, Dict>;

/**
 * Resolves a translation key against `dict`, falling back to `fallback`
 * (English) when the key is missing there, and finally to the raw key
 * itself so the UI never silently blanks — a missing key should be visible
 * and grep-able in a screenshot, not invisible.
 */
export function resolveString(
  catalog: Catalog,
  lang: string,
  fallbackLang: string,
  key: string,
): string {
  const primary = catalog[lang];
  if (primary && Object.prototype.hasOwnProperty.call(primary, key)) {
    return primary[key] as string;
  }
  const fallback = catalog[fallbackLang];
  if (fallback && Object.prototype.hasOwnProperty.call(fallback, key)) {
    return fallback[key] as string;
  }
  return key;
}
