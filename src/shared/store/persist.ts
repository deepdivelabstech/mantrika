import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * AsyncStorage-backed persistence for Zustand's `persist` middleware.
 *
 * Swap-in note: react-native-mmkv is a drop-in faster alternative for the
 * counter's hot path (it's synchronous, AsyncStorage is not) — if adopted,
 * replace this file's `getItem`/`setItem`/`removeItem` with an MMKV instance
 * and nothing else in the store slices needs to change, since they only
 * depend on the `StateStorage` shape createJSONStorage expects here.
 */
export const asyncStorageAdapter = createJSONStorage(() => AsyncStorage);
