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
