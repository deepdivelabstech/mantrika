import {
  FREE_SOUNDS,
  PREMIUM_SOUNDS,
  type PremiumSoundId,
  type SoundscapeId,
} from '@/shared/types/models';

/** How long one rewarded video unlocks a premium soundscape. */
export const SOUND_UNLOCK_MS = 48 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/** Length of the try-before-you-unlock preview. */
export const SOUND_PREVIEW_MS = 10 * 1000;

/** Unlock expiry per premium sound, epoch ms. */
export type SoundUnlocks = Partial<Record<PremiumSoundId, number>>;

export function isPremiumSound(id: SoundscapeId): id is PremiumSoundId {
  return (PREMIUM_SOUNDS as readonly string[]).includes(id);
}

export function isFreeSound(id: SoundscapeId): boolean {
  return (FREE_SOUNDS as readonly string[]).includes(id);
}

/** Free sounds are always playable; premium ones only until their unlock expires. */
export function isSoundUnlocked(id: SoundscapeId, unlocks: SoundUnlocks, now: number): boolean {
  if (!isPremiumSound(id)) return true;
  return now < (unlocks[id] ?? 0);
}

/** Whole hours left on an unlock (rounded up), or 0 when locked. */
export function unlockHoursLeft(id: PremiumSoundId, unlocks: SoundUnlocks, now: number): number {
  const ms = (unlocks[id] ?? 0) - now;
  if (ms <= 0) return 0;
  // `now` may lag the unlock by up to a clock tick; never show more than the full grant.
  return Math.min(SOUND_UNLOCK_MS, Math.ceil(ms / HOUR_MS) * HOUR_MS) / HOUR_MS;
}
