export type Mantra = {
  id: string;
  name: string;
  deva: string;
  chant: string;
  description?: string;
  excerpt?: string;
  core?: boolean;
};

export type CustomMantra = {
  id: string;
  text: string;
  createdAt: string;
};

export type Language = 'en' | 'hi';
export type AnimSpeed = 'gentle' | 'steady' | 'quick';
export type SoundscapeId = 'silence' | 'ganga' | 'forest' | 'bowls';

export type Settings = {
  name: string;
  lang: Language;
  haptics: boolean;
  risingMantra: boolean;
  animSpeed: AnimSpeed;
  sound: SoundscapeId;
  reminderTime: string | null; // 'HH:mm' | null
};

export type ProgressState = {
  currentMantraId: string;
  beadsToday: number;
  roundsToday: number;
  totalBeadsLifetime: number;
  streakDays: number;
  lastActiveDate: string; // ISO date (yyyy-mm-dd)
  activeDates: string[]; // ISO dates, most recent last, capped for the dot indicator
};

export const BEADS_PER_ROUND = 108;
export const DAILY_FOCUS_TARGET = 1008;
