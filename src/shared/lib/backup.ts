import { useMantraStore } from '@/shared/store/useMantraStore';
import { useProgressStore } from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import type { CustomMantra, ProgressState, Settings } from '@/shared/types/models';

export const BACKUP_VERSION = 1;

export type Backup = {
  app: 'mantrika';
  version: number;
  exportedAt: string;
  progress: ProgressState;
  settings: Settings;
  mantras: { custom: CustomMantra[]; favorites: string[] };
};

export function buildBackup(now = new Date()): Backup {
  const p = useProgressStore.getState();
  const s = useSettingsStore.getState();
  const m = useMantraStore.getState();
  return {
    app: 'mantrika',
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    progress: {
      currentMantraId: p.currentMantraId,
      beadsToday: p.beadsToday,
      roundsToday: p.roundsToday,
      totalBeadsLifetime: p.totalBeadsLifetime,
      streakDays: p.streakDays,
      lastActiveDate: p.lastActiveDate,
      activeDates: p.activeDates,
    },
    settings: {
      name: s.name,
      onboarded: s.onboarded,
      lang: s.lang,
      haptics: s.haptics,
      risingMantra: s.risingMantra,
      animSpeed: s.animSpeed,
      sound: s.sound,
      reminderTime: s.reminderTime,
    },
    mantras: { custom: m.custom, favorites: m.favorites },
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isStrArr = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

function isProgress(v: unknown): v is ProgressState {
  return (
    isObj(v) &&
    typeof v.currentMantraId === 'string' &&
    isNum(v.beadsToday) &&
    isNum(v.roundsToday) &&
    isNum(v.totalBeadsLifetime) &&
    isNum(v.streakDays) &&
    typeof v.lastActiveDate === 'string' &&
    isStrArr(v.activeDates)
  );
}

function isCustomMantra(v: unknown): v is CustomMantra {
  return (
    isObj(v) &&
    typeof v.id === 'string' &&
    typeof v.text === 'string' &&
    typeof v.createdAt === 'string'
  );
}

/** Parses and validates backup JSON; throws with a short reason when it isn't a usable backup. */
export function parseBackup(json: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('not-json');
  }
  if (!isObj(data) || data.app !== 'mantrika') throw new Error('not-mantrika');
  if (typeof data.version !== 'number' || data.version > BACKUP_VERSION) {
    throw new Error('unsupported-version');
  }
  const { progress, settings, mantras } = data;
  if (!isProgress(progress)) throw new Error('invalid-progress');
  if (!isObj(settings)) throw new Error('invalid-settings');
  if (
    !isObj(mantras) ||
    !Array.isArray(mantras.custom) ||
    !mantras.custom.every(isCustomMantra) ||
    !isStrArr(mantras.favorites)
  ) {
    throw new Error('invalid-mantras');
  }
  return data as Backup;
}

const SETTINGS_ENUMS: Partial<Record<keyof Settings, readonly unknown[]>> = {
  lang: ['en', 'hi'],
  animSpeed: ['gentle', 'steady', 'quick'],
  sound: ['silence', 'ganga', 'forest', 'bowls'],
};

/** Keeps only known settings whose type matches the current value; anything else keeps its current value. */
function sanitizeSettings(incoming: Record<string, unknown>, current: Settings): Partial<Settings> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(current) as (keyof Settings)[]) {
    if (!(key in incoming)) continue;
    const value = incoming[key];
    const allowed = SETTINGS_ENUMS[key];
    if (allowed ? allowed.includes(value) : typeof value === typeof current[key]) {
      out[key] = value;
    } else if (key === 'reminderTime' && (value === null || typeof value === 'string')) {
      out[key] = value;
    }
  }
  return out as Partial<Settings>;
}

export function applyBackup(backup: Backup) {
  useProgressStore.getState().replaceProgress(backup.progress);
  useSettingsStore.setState({
    ...sanitizeSettings(backup.settings, useSettingsStore.getState()),
    onboarded: true,
  });
  useMantraStore.setState({
    custom: backup.mantras.custom,
    favorites: backup.mantras.favorites,
  });
}
