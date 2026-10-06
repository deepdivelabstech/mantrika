import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef } from 'react';

import { useSettingsStore } from '@/shared/store/useSettingsStore';

import { disposePlayer } from './useSound';

const CHIME = require('../../../assets/sounds/chime.m4a');
const CHIME_VOLUME = 0.7;

/**
 * Round-complete temple bell. The player is created up front (while the toggle
 * is on) so the first chime plays without decode latency, and is replayed by
 * seeking to 0 rather than creating a player per round.
 */
export function useChime() {
  const enabled = useSettingsStore((s) => s.roundChime);
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const player = createAudioPlayer(CHIME);
    player.volume = CHIME_VOLUME;
    playerRef.current = player;
    return () => {
      playerRef.current = null;
      disposePlayer(player);
    };
  }, [enabled]);

  return useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => undefined); // released mid-seek (toggle off / unmount)
  }, []);
}
