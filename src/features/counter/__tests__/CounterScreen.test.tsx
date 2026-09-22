import { NavigationContainer } from '@react-navigation/native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { CounterScreen } from '@/features/counter/CounterScreen';
import i18n from '@/shared/i18n';
import { useProgressStore } from '@/shared/store/useProgressStore';

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
    });
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
});
