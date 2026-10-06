import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

const WRITE_DEBOUNCE_MS = 400;

// Held as objects, not strings: serializing (the whole progress log, on every
// bead tap) is deferred to the flush, so it happens once per debounce window.
const pending = new Map<string, StorageValue<unknown>>();
let timer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (pending.size === 0) return;
  const entries = [...pending.entries()].map(([name, value]): [string, string] => [
    name,
    JSON.stringify(value),
  ]);
  pending.clear();
  void AsyncStorage.multiSet(entries);
}

// Pending writes must land before the OS can suspend or kill the app.
AppState.addEventListener('change', (state) => {
  if (state !== 'active') flush();
});

/**
 * AsyncStorage-backed persistence for Zustand's `persist` middleware.
 *
 * Coalesces writes: every bead tap updates a persisted store, so instead of
 * one serialize + AsyncStorage write per tap, the latest value per key is
 * written at most once per WRITE_DEBOUNCE_MS (and immediately when the app
 * backgrounds). Zustand never mutates state in place, so holding the value
 * object until the flush is safe.
 *
 * Swap-in note: react-native-mmkv is a drop-in faster alternative for the
 * counter's hot path (it's synchronous, AsyncStorage is not) — if adopted,
 * back this adapter with an MMKV instance and nothing else in the store
 * slices needs to change, since they only depend on the `PersistStorage`
 * shape.
 */
export const asyncStorageAdapter: PersistStorage<unknown> = {
  getItem: (name) => {
    const queued = pending.get(name);
    if (queued) return queued;
    return AsyncStorage.getItem(name).then((raw) =>
      raw === null ? null : (JSON.parse(raw) as StorageValue<unknown>),
    );
  },
  setItem: (name, value) => {
    pending.set(name, value);
    if (!timer) timer = setTimeout(flush, WRITE_DEBOUNCE_MS);
  },
  removeItem: (name) => {
    pending.delete(name);
    return AsyncStorage.removeItem(name);
  },
};

/** Writes any queued values now. Exposed for tests. */
export const flushPersistWrites = flush;
