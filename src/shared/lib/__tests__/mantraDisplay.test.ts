import { pickDailyMantra } from '@/shared/lib/mantraDisplay';
import type { Mantra } from '@/shared/types/models';

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
