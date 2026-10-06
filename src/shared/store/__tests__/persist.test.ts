import AsyncStorage from '@react-native-async-storage/async-storage';

import { asyncStorageAdapter, flushPersistWrites } from '@/shared/store/persist';

describe('asyncStorageAdapter', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    await AsyncStorage.clear();
    jest.mocked(AsyncStorage.multiSet).mockClear();
  });

  afterEach(() => {
    flushPersistWrites();
    jest.useRealTimers();
  });

  it('coalesces rapid writes into one serialized write of the latest value', () => {
    asyncStorageAdapter.setItem('k', { state: { n: 1 }, version: 0 });
    asyncStorageAdapter.setItem('k', { state: { n: 2 }, version: 0 });
    expect(AsyncStorage.multiSet).not.toHaveBeenCalled();

    jest.advanceTimersByTime(400);
    expect(AsyncStorage.multiSet).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
      ['k', JSON.stringify({ state: { n: 2 }, version: 0 })],
    ]);
  });

  it('reads a queued value before it is flushed', () => {
    const value = { state: { n: 3 }, version: 0 };
    asyncStorageAdapter.setItem('k', value);
    expect(asyncStorageAdapter.getItem('k')).toBe(value);
  });

  it('parses stored values and returns null when missing', async () => {
    await AsyncStorage.setItem('stored', JSON.stringify({ state: { n: 4 }, version: 1 }));
    await expect(asyncStorageAdapter.getItem('stored')).resolves.toEqual({
      state: { n: 4 },
      version: 1,
    });
    await expect(asyncStorageAdapter.getItem('missing')).resolves.toBeNull();
  });
});
