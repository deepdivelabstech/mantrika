import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { toLocalDateString } from '@/shared/lib/dateHelpers';

function msUntilNextMidnight(now: Date): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

/**
 * Local ISO date that stays current: refreshes at local midnight and whenever
 * the app returns to the foreground (timers don't fire while suspended).
 */
export function useToday(): string {
  const [today, setToday] = useState(() => toLocalDateString(new Date()));

  useEffect(() => {
    const refresh = () => setToday(toLocalDateString(new Date()));
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => setToday(toLocalDateString(new Date())),
      msUntilNextMidnight(new Date()) + 1000,
    );
    return () => clearTimeout(timer);
  }, [today]);

  return today;
}
