import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AnimSpeed, Language, Settings, SoundscapeId } from '@/shared/types/models';

import { asyncStorageAdapter } from './persist';

const DEFAULT_SETTINGS: Settings = {
  name: 'Arjun Das',
  lang: 'en',
  haptics: true,
  risingMantra: true,
  animSpeed: 'steady',
  sound: 'silence',
  reminderTime: null,
};

type SettingsStore = Settings & {
  setName: (name: string) => void;
  setLang: (lang: Language) => void;
  setHaptics: (on: boolean) => void;
  setRisingMantra: (on: boolean) => void;
  setAnimSpeed: (speed: AnimSpeed) => void;
  setSound: (sound: SoundscapeId) => void;
  setReminderTime: (time: string | null) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setName: (name) => set({ name: name.trim() || DEFAULT_SETTINGS.name }),
      setLang: (lang) => set({ lang }),
      setHaptics: (haptics) => set({ haptics }),
      setRisingMantra: (risingMantra) => set({ risingMantra }),
      setAnimSpeed: (animSpeed) => set({ animSpeed }),
      setSound: (sound) => set({ sound }),
      setReminderTime: (reminderTime) => set({ reminderTime }),
    }),
    { name: 'mantrika.settings.v1', storage: asyncStorageAdapter },
  ),
);
