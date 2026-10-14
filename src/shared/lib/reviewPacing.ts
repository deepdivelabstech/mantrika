import { daysBetween } from './dateHelpers';

/** Only ask practitioners who have come back a few times, not on the first day. */
export const REVIEW_MIN_ACTIVE_DAYS = 3;
/** Never ask again sooner than this. Play also rate-limits the dialog on its side. */
export const REVIEW_COOLDOWN_DAYS = 90;

export type ReviewPacingInput = {
  today: string; // ISO 'yyyy-mm-dd'
  activeDays: number;
  lastPromptDate: string; // '' if never
};

/** Whether reaching a goal today should end in the in-app review dialog. */
export function shouldPromptReview(input: ReviewPacingInput): boolean {
  const { today, activeDays, lastPromptDate } = input;
  if (activeDays < REVIEW_MIN_ACTIVE_DAYS) return false;
  return !lastPromptDate || daysBetween(lastPromptDate, today) >= REVIEW_COOLDOWN_DAYS;
}
