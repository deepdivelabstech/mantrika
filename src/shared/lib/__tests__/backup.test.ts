import { applyBackup, buildBackup, parseBackup } from '@/shared/lib/backup';
import { useMantraStore } from '@/shared/store/useMantraStore';
import { useProgressStore } from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';

describe('backup', () => {
  it('round-trips progress, settings and custom mantras', () => {
    useProgressStore.setState({ totalBeadsLifetime: 5000, streakDays: 9 });
    useSettingsStore.setState({ name: 'Asha', lang: 'hi' });
    useMantraStore.setState({
      custom: [{ id: 'custom-1', text: 'Om', createdAt: '2026-01-01T00:00:00.000Z' }],
    });
    const json = JSON.stringify(buildBackup());

    useProgressStore.setState({ totalBeadsLifetime: 0, streakDays: 0 });
    useSettingsStore.setState({ name: 'Sadhaka', lang: 'en' });
    useMantraStore.setState({ custom: [] });

    applyBackup(parseBackup(json));
    expect(useProgressStore.getState()).toMatchObject({ totalBeadsLifetime: 5000, streakDays: 9 });
    expect(useSettingsStore.getState()).toMatchObject({ name: 'Asha', lang: 'hi' });
    expect(useMantraStore.getState().custom).toHaveLength(1);
  });

  it('rejects text that is not a Mantrika backup', () => {
    expect(() => parseBackup('hello')).toThrow('not-json');
    expect(() => parseBackup('{"app":"other"}')).toThrow('not-mantrika');
    const bad = { ...buildBackup(), progress: { beadsToday: 'x' } };
    expect(() => parseBackup(JSON.stringify(bad))).toThrow('invalid-progress');
  });

  it('ignores unknown or mistyped settings', () => {
    useSettingsStore.setState({ lang: 'en', haptics: true });
    const backup = buildBackup();
    const tampered = { ...backup, settings: { ...backup.settings, lang: 'fr', haptics: 'yes' } };
    applyBackup(parseBackup(JSON.stringify(tampered)));
    expect(useSettingsStore.getState()).toMatchObject({ lang: 'en', haptics: true });
  });
});

describe('backup versions', () => {
  it('imports a v1 backup by migrating its progress', () => {
    const v1 = {
      app: 'mantrika',
      version: 1,
      exportedAt: '2026-01-10T00:00:00.000Z',
      progress: {
        currentMantraId: 'om-namah-shivaya',
        beadsToday: 10,
        roundsToday: 1,
        totalBeadsLifetime: 900,
        streakDays: 4,
        lastActiveDate: '2026-01-10',
        activeDates: ['2026-01-10'],
      },
      settings: { name: 'Asha' },
      mantras: { custom: [], favorites: [] },
    };
    applyBackup(parseBackup(JSON.stringify(v1)));
    expect(useProgressStore.getState()).toMatchObject({
      totalBeadsLifetime: 900,
      dailyLog: { '2026-01-10': { 'om-namah-shivaya': 118 } },
      bestStreak: 4,
      sankalpa: null,
    });
  });

  it('round-trips the sankalpa and daily goal', () => {
    const sankalpa = {
      mantraId: 'gayatri-mantra',
      targetBeads: 125000,
      days: 40,
      startDate: '2026-01-01',
      count: 5000,
    };
    useProgressStore.setState({ sankalpa });
    useSettingsStore.setState({ dailyGoalMalas: 11 });
    const json = JSON.stringify(buildBackup());
    useProgressStore.setState({ sankalpa: null });
    useSettingsStore.setState({ dailyGoalMalas: 1 });

    applyBackup(parseBackup(json));
    expect(useProgressStore.getState().sankalpa).toEqual(sankalpa);
    expect(useSettingsStore.getState().dailyGoalMalas).toBe(11);
  });

  it('rejects a malformed sankalpa and an out-of-range goal', () => {
    const backup = buildBackup();
    const badVow = { ...backup, progress: { ...backup.progress, sankalpa: { count: -1 } } };
    expect(() => parseBackup(JSON.stringify(badVow))).toThrow('invalid-progress');

    useSettingsStore.setState({ dailyGoalMalas: 3 });
    const badGoal = { ...backup, settings: { ...backup.settings, dailyGoalMalas: 5000 } };
    applyBackup(parseBackup(JSON.stringify(badGoal)));
    expect(useSettingsStore.getState().dailyGoalMalas).toBe(3);
  });
});
