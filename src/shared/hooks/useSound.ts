import { Audio, type AVPlaybackSource } from 'expo-av';
import { useEffect, useRef } from 'react';

import { useSettingsStore } from '@/shared/store/useSettingsStore';
import type { SoundscapeId } from '@/shared/types/models';

/**
 * Placeholder audio: assets/sounds/*.wav are silent stubs so the app builds
 * and the looping lifecycle is real end-to-end. Swap in real ambient loops
 * at the same paths — nothing else here needs to change. See README.
 */
const SOURCES: Partial<Record<SoundscapeId, AVPlaybackSource>> = {
  ganga: require('../../../assets/sounds/ganga.wav'),
  forest: require('../../../assets/sounds/forest.wav'),
  bowls: require('../../../assets/sounds/bowls.wav'),
};

/** Plays the selected ambient soundscape on a loop; stops cleanly on unmount/change/silence. */
export function useSound() {
  const soundId = useSettingsStore((s) => s.sound);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (soundId === 'silence') return;

      const source = SOURCES[soundId];
      if (!source) return;

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(source, { isLooping: true, volume: 0.5 });
      if (cancelled) {
        await sound.unloadAsync();
        return;
      }
      soundRef.current = sound;
      await sound.playAsync();
    }

    void run();

    return () => {
      cancelled = true;
      const s = soundRef.current;
      soundRef.current = null;
      if (s) void s.unloadAsync();
    };
  }, [soundId]);
}
