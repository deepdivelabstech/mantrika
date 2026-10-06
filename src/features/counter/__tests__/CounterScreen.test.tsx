import { NavigationContainer } from '@react-navigation/native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CounterScreen } from '@/features/counter/CounterScreen';
import i18n from '@/shared/i18n';
import * as Haptics from 'expo-haptics';

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

import { FocusModeScreen } from '@/features/counter/FocusModeScreen';
import { useProgressStore } from '@/shared/store/useProgressStore';
import { useSettingsStore } from '@/shared/store/useSettingsStore';
import { act } from '@testing-library/react-native';
import { CELEBRATION_MS } from '@/features/counter/components/RoundCelebration';

function renderScreen() {
  return render(
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <CounterScreen />
      </NavigationContainer>
    </I18nextProvider>,
  );
}

describe('CounterScreen', () => {
  beforeEach(() => {
    useProgressStore.setState({
      currentMantraId: 'om-namah-shivaya',
      beadsToday: 0,
      roundsToday: 0,
      totalBeadsLifetime: 0,
      streakDays: 0,
      lastActiveDate: '',
      activeDates: [],
      dailyLog: {},
      mantraTotals: {},
      bestStreak: 0,
      sankalpa: null,
      undoStack: [],
    });
    useSettingsStore.setState({
      dailyGoalMalas: 3,
      pauseAfterRound: false,
      haptics: true,
      focusDiscovered: true,
    });
    jest.clearAllMocks();
  });

  it('increments the bead count on tap', async () => {
    renderScreen();

    const tapButton = screen.getByLabelText(i18n.t('counter.countAria'));

    fireEvent.press(tapButton);
    fireEvent.press(tapButton);
    fireEvent.press(tapButton);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeTruthy();
    });
    expect(useProgressStore.getState().beadsToday).toBe(3);
  });

  it('opens eyes-closed mode from the header', () => {
    renderScreen();
    fireEvent.press(screen.getByLabelText(i18n.t('counter.focusAria')));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Focus');
  });

  it('undoes the last bead', async () => {
    renderScreen();

    expect(screen.queryByLabelText(i18n.t('counter.undoAria'))).toBeNull();

    const tapButton = screen.getByLabelText(i18n.t('counter.countAria'));
    fireEvent.press(tapButton);
    fireEvent.press(tapButton);
    fireEvent.press(screen.getByLabelText(i18n.t('counter.undoAria')));

    await waitFor(() => {
      expect(useProgressStore.getState().beadsToday).toBe(1);
    });
    expect(useProgressStore.getState().totalBeadsLifetime).toBe(1);
  });

  it('marks a completed round with a milestone haptic and announced celebration', () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    useProgressStore.setState({ beadsToday: 107, lastActiveDate: today() });
    renderScreen();
    fireEvent.press(screen.getByLabelText(i18n.t('counter.countAria')));

    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(announce).toHaveBeenCalledWith(i18n.t('counter.roundComplete', { count: 1 }));
  });

  it('ignores taps briefly after a round when pause-after-round is on', () => {
    useSettingsStore.setState({ pauseAfterRound: true });
    useProgressStore.setState({ beadsToday: 107, lastActiveDate: today() });
    renderScreen();
    const tapButton = screen.getByLabelText(i18n.t('counter.countAria'));
    fireEvent.press(tapButton);
    fireEvent.press(tapButton);
    expect(useProgressStore.getState().totalBeadsLifetime).toBe(1);
  });
});

describe('eyes-closed mode discovery', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigation.navigate.mockClear();
    useSettingsStore.setState({ focusDiscovered: false, pauseAfterRound: false });
    useProgressStore.setState({
      beadsToday: 107,
      roundsToday: 0,
      lastActiveDate: today(),
      undoStack: [],
    });
  });
  afterEach(() => jest.useRealTimers());

  function completeRound() {
    fireEvent.press(screen.getByLabelText(i18n.t('counter.countAria')));
    act(() => {
      jest.advanceTimersByTime(CELEBRATION_MS);
    });
  }

  it('labels the header button', () => {
    renderScreen();
    expect(screen.getByText(i18n.t('counter.focusLabel'))).toBeTruthy();
  });

  it('shows a tip after the first round, once the celebration has played', () => {
    renderScreen();
    fireEvent.press(screen.getByLabelText(i18n.t('counter.countAria')));
    expect(screen.queryByText(i18n.t('counter.focusTip'))).toBeNull();
    act(() => {
      jest.advanceTimersByTime(CELEBRATION_MS);
    });
    expect(screen.getByText(i18n.t('counter.focusTip'))).toBeTruthy();
  });

  it('dismissing the tip hides it for good', () => {
    renderScreen();
    completeRound();
    fireEvent.press(screen.getByText(i18n.t('counter.focusTipDismiss')));
    expect(screen.queryByText(i18n.t('counter.focusTip'))).toBeNull();
    expect(useSettingsStore.getState().focusDiscovered).toBe(true);
  });

  it('"Try it" opens eyes-closed mode', () => {
    renderScreen();
    completeRound();
    fireEvent.press(screen.getByText(i18n.t('counter.focusTipTry')));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Focus');
    expect(useSettingsStore.getState().focusDiscovered).toBe(true);
  });

  it('stays quiet once the mode has been discovered', () => {
    useSettingsStore.setState({ focusDiscovered: true });
    renderScreen();
    completeRound();
    expect(screen.queryByText(i18n.t('counter.focusTip'))).toBeNull();
  });
});

describe('FocusModeScreen', () => {
  const { goBack } = mockNavigation;
  beforeEach(() => {
    goBack.mockClear();
    useProgressStore.setState({
      beadsToday: 0,
      roundsToday: 0,
      totalBeadsLifetime: 0,
      undoStack: [],
    });
  });

  function renderFocus() {
    return render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <I18nextProvider i18n={i18n}>
          <FocusModeScreen />
        </I18nextProvider>
      </SafeAreaProvider>,
    );
  }

  it('marks the mode as discovered when opened', () => {
    useSettingsStore.setState({ focusDiscovered: false });
    renderFocus();
    expect(useSettingsStore.getState().focusDiscovered).toBe(true);
  });

  it('counts a bead on a tap anywhere and exits on hold', () => {
    renderFocus();
    const surface = screen.getByLabelText(i18n.t('focus.tapAria'));
    fireEvent.press(surface);
    fireEvent.press(surface);
    expect(useProgressStore.getState().totalBeadsLifetime).toBe(2);

    fireEvent(surface, 'longPress');
    expect(goBack).toHaveBeenCalledTimes(1);
    expect(useProgressStore.getState().totalBeadsLifetime).toBe(2);
  });
});

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
