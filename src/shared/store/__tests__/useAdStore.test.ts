import { AD_FREE_MS } from '@/shared/lib/adPacing';
import { SOUND_UNLOCK_MS } from '@/shared/lib/soundAccess';
import { useAdStore } from '@/shared/store/useAdStore';

describe('useAdStore rewards', () => {
  beforeEach(() => {
    useAdStore.setState({ adFreeUntil: 0, soundUnlocks: {}, previewSound: null });
  });

  it('grants a day without ads', () => {
    useAdStore.getState().grantAdFree(5_000);
    expect(useAdStore.getState().adFreeUntil).toBe(5_000 + AD_FREE_MS);
  });

  it('unlocks each sound separately for 48 hours', () => {
    useAdStore.getState().unlockSound('rain', 1_000);
    useAdStore.getState().unlockSound('om', 2_000);
    expect(useAdStore.getState().soundUnlocks).toEqual({
      rain: 1_000 + SOUND_UNLOCK_MS,
      om: 2_000 + SOUND_UNLOCK_MS,
    });
  });

  it('re-unlocking extends from the new time', () => {
    useAdStore.getState().unlockSound('rain', 1_000);
    useAdStore.getState().unlockSound('rain', 9_000);
    expect(useAdStore.getState().soundUnlocks.rain).toBe(9_000 + SOUND_UNLOCK_MS);
  });

  it('tracks the previewed sound', () => {
    useAdStore.getState().setPreviewSound('tanpura');
    expect(useAdStore.getState().previewSound).toBe('tanpura');
    useAdStore.getState().setPreviewSound(null);
    expect(useAdStore.getState().previewSound).toBeNull();
  });
});
