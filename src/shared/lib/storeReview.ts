import * as StoreReview from 'expo-store-review';
import { Linking, Platform, Share } from 'react-native';

import { toLocalDateString } from '@/shared/lib/dateHelpers';
import { shouldPromptReview } from '@/shared/lib/reviewPacing';
import { useAdStore } from '@/shared/store/useAdStore';
import { useProgressStore } from '@/shared/store/useProgressStore';

const ANDROID_PACKAGE = 'com.deepdivelabs.mantrika';
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

/**
 * Called when a practitioner reaches their daily goal or completes a vow, a
 * moment of satisfaction. Shows the native in-app review dialog when pacing
 * allows; Play decides whether it actually appears and gives no result back,
 * so the attempt is what we record.
 */
export async function maybeRequestReview(now = new Date()) {
  if (Platform.OS === 'web') return;
  const today = toLocalDateString(now);
  const due = shouldPromptReview({
    today,
    activeDays: useProgressStore.getState().activeDates.length,
    lastPromptDate: useAdStore.getState().lastReviewPromptDate,
  });
  if (!due) return;
  try {
    if (!(await StoreReview.isAvailableAsync())) return;
    useAdStore.getState().markReviewPrompted(today);
    await StoreReview.requestReview();
  } catch {
    // Never let a rating prompt interrupt practice.
  }
}

/**
 * The explicit "Rate Mantrika" action. Opens the store listing rather than the
 * in-app dialog, which Play may silently suppress and would leave the button
 * looking broken.
 */
export async function openStoreListing() {
  try {
    // The Play app handles market:// directly; elsewhere, or without Play, use the web listing.
    if (Platform.OS !== 'android') throw new Error('no market scheme');
    await Linking.openURL(`market://details?id=${ANDROID_PACKAGE}`);
  } catch {
    await Linking.openURL(PLAY_STORE_URL).catch(() => undefined);
  }
}

export async function shareApp(title: string, message: string) {
  await Share.share({ title, message: `${message}\n${PLAY_STORE_URL}` });
}
