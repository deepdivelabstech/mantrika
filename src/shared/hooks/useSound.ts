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
 * Placeholder audio: assets/sounds/*.wav are silent stubs so the app builds
 * and the looping lifecycle is real end-to-end. Swap in real ambient loops
 * at the same paths — nothing else here needs to change. See README.
 */
const SOURCES: Partial<Record<SoundscapeId, AudioSource>> = {
  ganga: require('../../../assets/sounds/ganga.wav'),
  forest: require('../../../assets/sounds/forest.wav'),
  bowls: require('../../../assets/sounds/bowls.wav'),
};

/** Plays the selected ambient soundscape on a loop; stops cleanly on unmount/change/silence. */
export function useSound() {
  const soundId = useSettingsStore((s) => s.sound);
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
      if (soundId === 'silence') return;

      const source = SOURCES[soundId];
      if (!source) return;

      await setAudioModeAsync({ playsInSilentMode: true });
      if (cancelled) return;

      const player = createAudioPlayer(source);
      player.loop = true;
      player.volume = 0.5;
      playerRef.current = player;
      player.play();
    }

    void run();

    return () => {
      cancelled = true;
      const p = playerRef.current;
      playerRef.current = null;
      if (p) p.remove();
    };
  }, [soundId]);
}
