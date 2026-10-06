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
  onboarded: boolean;
  lang: Language;
  haptics: boolean;
  risingMantra: boolean;
  animSpeed: AnimSpeed;
  sound: SoundscapeId;
  reminderTime: string | null; // 'HH:mm' | null
  dailyGoalMalas: number; // daily sankalpa, in full rounds of BEADS_PER_ROUND
  roundChime: boolean;
  pauseAfterRound: boolean;
  focusDiscovered: boolean; // has opened or dismissed the eyes-closed mode tip
};

/** Beads per mantra per local day: { 'yyyy-mm-dd': { mantraId: beads } }. */
export type DailyLog = Record<string, Record<string, number>>;

/** A long vow (anushthan): chant one mantra a set number of times within a set number of days. */
export type Sankalpa = {
  mantraId: string;
  targetBeads: number;
  days: number;
  startDate: string; // ISO date the vow began (day 1)
  count: number; // beads of `mantraId` counted inside the window
};

export type ProgressState = {
  currentMantraId: string;
  beadsToday: number;
  roundsToday: number;
  totalBeadsLifetime: number;
  streakDays: number;
  lastActiveDate: string; // ISO date (yyyy-mm-dd)
  activeDates: string[]; // ISO dates, most recent last, capped for the dot indicator
  dailyLog: DailyLog; // pruned to DAILY_LOG_DAYS
  mantraTotals: Record<string, number>; // lifetime beads per mantra (tracked since v2)
  bestStreak: number;
  sankalpa: Sankalpa | null;
};

export const BEADS_PER_ROUND = 108;
export const DAILY_GOAL_OPTIONS = [1, 3, 5, 11, 16, 21] as const;
export const DEFAULT_DAILY_GOAL_MALAS = 1;
