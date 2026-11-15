import {
  isFreeSound,
  isPremiumSound,
  isSoundUnlocked,
  SOUND_UNLOCK_MS,
  unlockHoursLeft,
} from '@/shared/lib/soundAccess';
import { FREE_SOUNDS, PREMIUM_SOUNDS } from '@/shared/types/models';

describe('soundAccess', () => {
  it('splits the catalog into free and premium sounds', () => {
    expect(PREMIUM_SOUNDS).toHaveLength(10);
    FREE_SOUNDS.forEach((id) => {
      expect(isFreeSound(id)).toBe(true);
      expect(isPremiumSound(id)).toBe(false);
    });
    PREMIUM_SOUNDS.forEach((id) => expect(isPremiumSound(id)).toBe(true));
  });

  it('keeps the original sounds playable without any unlock', () => {
    FREE_SOUNDS.forEach((id) => expect(isSoundUnlocked(id, {}, Date.now())).toBe(true));
  });

  it('plays a premium sound only until its unlock expires', () => {
    const now = 1_000_000;
    const unlocks = { rain: now + SOUND_UNLOCK_MS };
    expect(isSoundUnlocked('rain', unlocks, now)).toBe(true);
    expect(isSoundUnlocked('rain', unlocks, now + SOUND_UNLOCK_MS)).toBe(false);
    expect(isSoundUnlocked('ocean', unlocks, now)).toBe(false);
  });

  it('reports whole hours left, rounded up', () => {
    const now = 0;
    const hour = 60 * 60 * 1000;
    expect(unlockHoursLeft('rain', { rain: SOUND_UNLOCK_MS }, now)).toBe(48);
    expect(unlockHoursLeft('rain', { rain: hour + 1 }, now)).toBe(2);
    expect(unlockHoursLeft('rain', { rain: 10 }, now)).toBe(1);
    expect(unlockHoursLeft('rain', {}, now)).toBe(0);
    // A stale clock reading never shows more than the 48h granted.
    expect(unlockHoursLeft('rain', { rain: SOUND_UNLOCK_MS + 30_000 }, now)).toBe(48);
  });
});
