import { useEffect, useState } from 'react';

import { isAdFree } from '@/shared/lib/adPacing';
import { useAdStore } from '@/shared/store/useAdStore';

/** Whether rewarded ad-free time is running; flips back to false on its own when it ends. */
export function useAdFree(): boolean {
  const adFreeUntil = useAdStore((s) => s.adFreeUntil);
  const [now, setNow] = useState(() => Date.now());

  // A grant always lands in the future, so a stale `now` still reads it as
  // active; only the expiry needs a fresh clock, which this timer supplies.
  useEffect(() => {
    const remaining = adFreeUntil - Date.now();
    if (remaining <= 0) return;
    // setTimeout caps at ~24.8 days; ad-free is 24h, so one timer suffices.
    const timer = setTimeout(() => setNow(Date.now()), remaining + 50);
    return () => clearTimeout(timer);
  }, [adFreeUntil]);

  return isAdFree(now, adFreeUntil);
}
