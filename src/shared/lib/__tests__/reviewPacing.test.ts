import {
  REVIEW_COOLDOWN_DAYS,
  REVIEW_MIN_ACTIVE_DAYS,
  shouldPromptReview,
} from '@/shared/lib/reviewPacing';

describe('shouldPromptReview', () => {
  const due = { today: '2026-06-01', activeDays: REVIEW_MIN_ACTIVE_DAYS, lastPromptDate: '' };

  it('asks a returning practitioner who has never been asked', () => {
    expect(shouldPromptReview(due)).toBe(true);
  });

  it('waits until they have practiced on enough days', () => {
    expect(shouldPromptReview({ ...due, activeDays: REVIEW_MIN_ACTIVE_DAYS - 1 })).toBe(false);
  });

  it('respects the cooldown since the last ask', () => {
    expect(shouldPromptReview({ ...due, lastPromptDate: '2026-05-01' })).toBe(false);
    expect(REVIEW_COOLDOWN_DAYS).toBe(90);
    expect(shouldPromptReview({ ...due, lastPromptDate: '2026-03-03' })).toBe(true);
  });
});
