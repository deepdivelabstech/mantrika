import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioSource,
} from 'expo-audio';
import { useEffect, useRef } from 'react';

import { isPremiumSound, isSoundUnlocked } from '@/shared/lib/soundAccess';
import { useAdStore } from '@/shared/store/useAdStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import type { SoundscapeId } from '@/shared/types/models';

/**
 * Seamless 40s loops synthesized by scripts/generate-soundscapes.py (AAC with
 * gapless metadata, so `loop` doesn't click or gap at the seam).
 */
export const SOUNDSCAPE_SOURCES: Partial<Record<SoundscapeId, AudioSource>> = {
  ganga: require('../../../assets/sounds/ganga.m4a'),
  forest: require('../../../assets/sounds/forest.m4a'),
  bowls: require('../../../assets/sounds/bowls.m4a'),
  rain: require('../../../assets/sounds/rain.m4a'),
  ocean: require('../../../assets/sounds/ocean.m4a'),
  thunder: require('../../../assets/sounds/thunder.m4a'),
  crickets: require('../../../assets/sounds/crickets.m4a'),
  havan: require('../../../assets/sounds/havan.m4a'),
  windchimes: require('../../../assets/sounds/windchimes.m4a'),
  templebells: require('../../../assets/sounds/templebells.m4a'),
  tanpura: require('../../../assets/sounds/tanpura.m4a'),
  om: require('../../../assets/sounds/om.m4a'),
  himalaya: require('../../../assets/sounds/himalaya.m4a'),
};

export const TARGET_VOLUME = 0.5;
const FADE_IN_MS = 1500;
const FADE_STEPS = 15;

/**
 * On Android `remove()` only drops the JS-side registry entry — the native
 * ExoPlayer keeps playing until garbage collection, so switching soundscapes
 * would stack loops. Pause first, then release the native object outright.
 */
export function disposePlayer(player: AudioPlayer) {
  try {
    player.pause();
    player.remove();
    player.release();
  } catch {
    // Already released (e.g. after a JS reload) — nothing left to stop.
  }
}

/**
 * Keeps the selected soundscape playable: a premium sound whose rewarded
 * unlock has run out falls back to silence, on launch or the moment it expires.
 */
function useSoundExpiry() {
  const soundId = useSettingsStore((s) => s.sound);
  const unlockedUntil = useAdStore((s) => (isPremiumSound(soundId) ? s.soundUnlocks[soundId] : 0));

  useEffect(() => {
    if (!isPremiumSound(soundId)) return;
    const relock = () => {
      const { soundUnlocks } = useAdStore.getState();
      if (!isSoundUnlocked(soundId, soundUnlocks, Date.now())) {
        useSettingsStore.getState().setSound('silence');
      }
    };
    const remaining = (unlockedUntil ?? 0) - Date.now();
    if (remaining <= 0) {
      relock();
      return;
    }
    const timer = setTimeout(relock, remaining + 50);
    return () => clearTimeout(timer);
  }, [soundId, unlockedUntil]);
}

/**
 * Plays the selected ambient soundscape on a loop; stops cleanly on
 * unmount/change/silence, and pauses while a Settings preview is playing.
 */
export function useSound() {
  useSoundExpiry();
  const soundId = useSettingsStore((s) => s.sound);
  const previewing = useAdStore((s) => s.previewSound !== null);
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    let fade: ReturnType<typeof setInterval> | null = null;

    async function run() {
      if (playerRef.current) {
        disposePlayer(playerRef.current);
        playerRef.current = null;
      }
      if (soundId === 'silence' || previewing) return;
      // Expired unlock: useSoundExpiry resets the setting; never play it meanwhile.
      if (!isSoundUnlocked(soundId, useAdStore.getState().soundUnlocks, Date.now())) return;

      const source = SOUNDSCAPE_SOURCES[soundId];
      if (!source) return;

      await setAudioModeAsync({ playsInSilentMode: true });
      if (cancelled) return;

      const player = createAudioPlayer(source);
      player.loop = true;
      player.volume = 0;
      playerRef.current = player;
      player.play();

      // Ease in rather than starting at full volume.
      let step = 0;
      fade = setInterval(() => {
        step += 1;
        player.volume = (TARGET_VOLUME * step) / FADE_STEPS;
        if (step >= FADE_STEPS && fade) clearInterval(fade);
      }, FADE_IN_MS / FADE_STEPS);
    }

    void run();

    return () => {
      cancelled = true;
      if (fade) clearInterval(fade);
      const p = playerRef.current;
      playerRef.current = null;
      if (p) disposePlayer(p);
    };
  }, [soundId, previewing]);
}
