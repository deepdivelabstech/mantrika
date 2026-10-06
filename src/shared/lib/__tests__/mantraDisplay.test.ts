import BUNDLED from '@/shared/data/mantraCatalog.json';
import { filterMantras, pickDailyMantra } from '@/shared/lib/mantraDisplay';
import { MANTRA_CATEGORIES, type Mantra } from '@/shared/types/models';

const m = (id: string, description?: string): Mantra => ({
  id,
  name: id,
  deva: id,
  chant: id,
  description,
});

describe('pickDailyMantra', () => {
  const catalog = [m('a', 'x'), m('b'), m('c', 'y'), m('d', 'z')];

  it('only picks mantras that have a description', () => {
    for (let d = 1; d <= 10; d++) {
      expect(pickDailyMantra(catalog, new Date(2026, 0, d))?.description).toBeDefined();
    }
  });

  it('is stable within a day and changes on the next day', () => {
    const morning = pickDailyMantra(catalog, new Date(2026, 9, 6, 6, 0));
    const night = pickDailyMantra(catalog, new Date(2026, 9, 6, 23, 59));
    const tomorrow = pickDailyMantra(catalog, new Date(2026, 9, 7, 6, 0));
    expect(morning).toBe(night);
    expect(tomorrow).not.toBe(morning);
  });

  it('falls back to the first entry when nothing has a description', () => {
    expect(pickDailyMantra([m('a'), m('b')], new Date())?.id).toBe('a');
  });
});

describe('filterMantras', () => {
  const catalog: Mantra[] = [
    { ...m('om-ham-hanumate-namah', 'Invokes Hanuman for courage.'), category: 'hanuman' },
    { ...m('om-dum-durgayei-namaha', 'Freedom from fear.'), category: 'devi' },
    { ...m('maha-mrityunjaya', 'Chanted for healing.'), category: 'shiva' },
  ];

  it('matches the intention in the description', () => {
    expect(filterMantras(catalog, 'healing', 'en').map((x) => x.id)).toEqual(['maha-mrityunjaya']);
  });

  it('matches the tradition, including its localized label', () => {
    expect(filterMantras(catalog, 'devi', 'en')).toHaveLength(1);
    const hindi = filterMantras(catalog, 'हनुमान', 'hi', (c) => (c === 'hanuman' ? 'हनुमान' : c));
    expect(hindi.map((x) => x.id)).toEqual(['om-ham-hanumate-namah']);
  });

  it('returns everything for a blank query', () => {
    expect(filterMantras(catalog, '  ', 'en')).toBe(catalog);
  });
});

describe('bundled catalog', () => {
  it('has unique ids, a known tradition and a description for every mantra', () => {
    const ids = BUNDLED.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const x of BUNDLED) {
      expect(MANTRA_CATEGORIES).toContain(x.category);
      expect(x.description).toBeTruthy();
    }
  });
});
