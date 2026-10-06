import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DEFAULT_DAILY_GOAL_MALAS,
  type AnimSpeed,
  type Language,
  type Settings,
  type SoundscapeId,
} from '@/shared/types/models';

import { asyncStorageAdapter } from './persist';

const DEFAULT_SETTINGS: Settings = {
  name: 'Sadhaka',
  onboarded: false,
  lang: 'en',
  haptics: true,
  risingMantra: true,
  animSpeed: 'steady',
  sound: 'silence',
  reminderTime: null,
  dailyGoalMalas: DEFAULT_DAILY_GOAL_MALAS,
  roundChime: true,
  pauseAfterRound: false,
  focusDiscovered: false,
};

export const MAX_DAILY_GOAL_MALAS = 108;

type SettingsStore = Settings & {
  setName: (name: string) => void;
  completeOnboarding: (name: string, dailyGoalMalas: number) => void;
  setLang: (lang: Language) => void;
  setHaptics: (on: boolean) => void;
  setRisingMantra: (on: boolean) => void;
  setAnimSpeed: (speed: AnimSpeed) => void;
  setSound: (sound: SoundscapeId) => void;
  setReminderTime: (time: string | null) => void;
  setDailyGoalMalas: (malas: number) => void;
  setRoundChime: (on: boolean) => void;
  setPauseAfterRound: (on: boolean) => void;
  markFocusDiscovered: () => void;
};

export function clampGoalMalas(malas: number): number {
  return Number.isFinite(malas)
    ? Math.min(MAX_DAILY_GOAL_MALAS, Math.max(1, Math.round(malas)))
    : DEFAULT_DAILY_GOAL_MALAS;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setName: (name) => set({ name: name.trim() || DEFAULT_SETTINGS.name }),
      completeOnboarding: (name, dailyGoalMalas) =>
        set({
          name: name.trim() || DEFAULT_SETTINGS.name,
          dailyGoalMalas: clampGoalMalas(dailyGoalMalas),
          onboarded: true,
        }),
      setLang: (lang) => set({ lang }),
      setHaptics: (haptics) => set({ haptics }),
      setRisingMantra: (risingMantra) => set({ risingMantra }),
      setAnimSpeed: (animSpeed) => set({ animSpeed }),
      setSound: (sound) => set({ sound }),
      setReminderTime: (reminderTime) => set({ reminderTime }),
      setDailyGoalMalas: (malas) => set({ dailyGoalMalas: clampGoalMalas(malas) }),
      setRoundChime: (roundChime) => set({ roundChime }),
      setPauseAfterRound: (pauseAfterRound) => set({ pauseAfterRound }),
      markFocusDiscovered: () => set({ focusDiscovered: true }),
    }),
    // New fields need no migration: persist shallow-merges stored state over these defaults.
    { name: 'mantrika.settings.v1', storage: asyncStorageAdapter },
  ),
);
