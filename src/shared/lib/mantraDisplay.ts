import { customToMantra } from '@/shared/store/useMantraStore';
import type { CustomMantra, Language, Mantra } from '@/shared/types/models';

/** Catalog mantras show real Devanagari in Hindi; a user's own custom text is never auto-transliterated. */
export function displayName(mantra: Mantra, lang: Language): string {
  const isCustom = mantra.id.startsWith('custom-');
  return lang === 'hi' && !isCustom && mantra.deva ? mantra.deva : mantra.name;
}

export function mergeMantras(
  catalog: Mantra[],
  custom: CustomMantra[],
  customLabel: string,
): Mantra[] {
  return [...catalog, ...custom.map((c) => customToMantra(c, customLabel))];
}

export function findMantra(all: Mantra[], id: string): Mantra | undefined {
  return all.find((m) => m.id === id);
}

export function filterMantras(all: Mantra[], query: string, lang: Language): Mantra[] {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((m) => {
    const shown = displayName(m, lang).toLowerCase();
    return (
      shown.includes(q) ||
      m.name.toLowerCase().includes(q) ||
      (m.deva ?? '').toLowerCase().includes(q)
    );
  });
}
