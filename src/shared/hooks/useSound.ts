import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioSource,
} from 'expo-audio';
import { useEffect, useRef } from 'react';

import { useSettingsStore } from '@/shared/store/useSettingsStore';
import type { SoundscapeId } from '@/shared/types/models';

/**
 * Seamless 40s loops synthesized by scripts/generate-soundscapes.py (AAC with
 * gapless metadata, so `loop` doesn't click or gap at the seam).
 */
const SOURCES: Partial<Record<SoundscapeId, AudioSource>> = {
  ganga: require('../../../assets/sounds/ganga.m4a'),
  forest: require('../../../assets/sounds/forest.m4a'),
  bowls: require('../../../assets/sounds/bowls.m4a'),
};

const TARGET_VOLUME = 0.5;
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

/** Plays the selected ambient soundscape on a loop; stops cleanly on unmount/change/silence. */
export function useSound() {
  const soundId = useSettingsStore((s) => s.sound);
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    let fade: ReturnType<typeof setInterval> | null = null;

    async function run() {
      if (playerRef.current) {
        disposePlayer(playerRef.current);
        playerRef.current = null;
      }
      if (soundId === 'silence') return;

      const source = SOURCES[soundId];
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
  }, [soundId]);
}
