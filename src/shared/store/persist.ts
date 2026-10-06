import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

const WRITE_DEBOUNCE_MS = 400;

const pending = new Map<string, string>();
let timer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (pending.size === 0) return;
  const entries = [...pending.entries()];
  pending.clear();
  void AsyncStorage.multiSet(entries);
}

// Pending writes must land before the OS can suspend or kill the app.
AppState.addEventListener('change', (state) => {
  if (state !== 'active') flush();
});

/**
 * Coalesces writes: every bead tap updates a persisted store, so instead of
 * one AsyncStorage write per tap, the latest value per key is written at most
 * once per WRITE_DEBOUNCE_MS (and immediately when the app backgrounds).
 */
const debouncedAsyncStorage: StateStorage = {
  getItem: (name) => pending.get(name) ?? AsyncStorage.getItem(name),
  setItem: (name, value) => {
    pending.set(name, value);
    if (!timer) timer = setTimeout(flush, WRITE_DEBOUNCE_MS);
  },
  removeItem: (name) => {
    pending.delete(name);
    return AsyncStorage.removeItem(name);
  },
};

/**
 * AsyncStorage-backed persistence for Zustand's `persist` middleware.
 *
 * Swap-in note: react-native-mmkv is a drop-in faster alternative for the
 * counter's hot path (it's synchronous, AsyncStorage is not) — if adopted,
 * replace `debouncedAsyncStorage` above with an MMKV instance and nothing
 * else in the store slices needs to change, since they only depend on the
 * `StateStorage` shape createJSONStorage expects here.
 */
export const asyncStorageAdapter = createJSONStorage(() => debouncedAsyncStorage);
