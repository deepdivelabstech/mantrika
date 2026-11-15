import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef } from 'react';

import { disposePlayer, SOUNDSCAPE_SOURCES, TARGET_VOLUME } from '@/shared/hooks/useSound';
import { SOUND_PREVIEW_MS } from '@/shared/lib/soundAccess';
import { useAdStore } from '@/shared/store/useAdStore';
import type { SoundscapeId } from '@/shared/types/models';

const FADE_MS = 800;
const FADE_STEPS = 10;

/**
 * Short try-before-unlock previews. Only one plays at a time; the main
 * soundscape pauses meanwhile (via `previewSound` in the ad store). Toggling
 * the same sound stops it, and leaving the screen stops it too.
 */
export function useSoundPreview() {
  const previewSound = useAdStore((s) => s.previewSound);
  const setPreviewSound = useAdStore((s) => s.setPreviewSound);
  const playerRef = useRef<AudioPlayer | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout | typeof setInterval>[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t as ReturnType<typeof setTimeout>));
    timers.current = [];
  };

  const stop = useCallback(() => {
    clearTimers();
    if (playerRef.current) disposePlayer(playerRef.current);
    playerRef.current = null;
    setPreviewSound(null);
  }, [setPreviewSound]);

  const fade = (player: AudioPlayer, from: number, to: number, done?: () => void) => {
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      player.volume = from + ((to - from) * step) / FADE_STEPS;
      if (step >= FADE_STEPS) {
        clearInterval(id);
        done?.();
      }
    }, FADE_MS / FADE_STEPS);
    timers.current.push(id);
  };

  const toggle = useCallback(
    async (id: SoundscapeId) => {
      const wasPlaying = useAdStore.getState().previewSound;
      stop();
      if (wasPlaying === id) return;
      const source = SOUNDSCAPE_SOURCES[id];
      if (!source) return;

      setPreviewSound(id);
      await setAudioModeAsync({ playsInSilentMode: true });
      // Another toggle or stop happened while awaiting.
      if (useAdStore.getState().previewSound !== id) return;

      const player = createAudioPlayer(source);
      player.loop = true;
      player.volume = 0;
      playerRef.current = player;
      player.play();
      fade(player, 0, TARGET_VOLUME);
      timers.current.push(
        setTimeout(() => fade(player, TARGET_VOLUME, 0, stop), SOUND_PREVIEW_MS - FADE_MS),
      );
    },
    [setPreviewSound, stop],
  );

  // Leaving the screen ends any preview.
  useEffect(() => stop, [stop]);

  return { previewing: previewSound, toggle, stop };
}
