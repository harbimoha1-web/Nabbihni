import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const REVIEW_TRACKING_KEY = '@nabbihni/review-tracking';

interface ReviewTracking {
  hasRequestedReview: boolean;
  appOpenCount: number;
  countdownCreatedCount: number;
  lastReviewRequestDate?: string;
}

const defaultTracking: ReviewTracking = {
  hasRequestedReview: false,
  appOpenCount: 0,
  countdownCreatedCount: 0,
};

async function getTracking(): Promise<ReviewTracking> {
  try {
    const data = await AsyncStorage.getItem(REVIEW_TRACKING_KEY);
    if (data) {
      return { ...defaultTracking, ...JSON.parse(data) };
    }
    return defaultTracking;
  } catch {
    return defaultTracking;
  }
}

async function saveTracking(tracking: ReviewTracking): Promise<void> {
  try {
    await AsyncStorage.setItem(REVIEW_TRACKING_KEY, JSON.stringify(tracking));
  } catch {}
}

/**
 * Attempt to show the native in-app review prompt.
 * Triggers after 3+ countdowns created OR 5+ app opens.
 * Rate-limited to once per 90 days.
 */
export async function maybeRequestReview(
  trigger: 'countdown_created' | 'app_open'
): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const tracking = await getTracking();

    // Don't request if already requested within 90 days
    if (tracking.hasRequestedReview && tracking.lastReviewRequestDate) {
      const daysSince =
        (Date.now() - new Date(tracking.lastReviewRequestDate).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSince < 90) return false;
    }

    // Update counters
    if (trigger === 'app_open') {
      tracking.appOpenCount += 1;
    } else if (trigger === 'countdown_created') {
      tracking.countdownCreatedCount += 1;
    }
    await saveTracking(tracking);

    // Check trigger conditions
    const shouldPrompt =
      (trigger === 'countdown_created' && tracking.countdownCreatedCount >= 3) ||
      (trigger === 'app_open' && tracking.appOpenCount >= 5);

    if (!shouldPrompt) return false;

    // Check platform availability and request review
    const StoreReview = require('expo-store-review');
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return false;

    await StoreReview.requestReview();

    // Mark as requested
    tracking.hasRequestedReview = true;
    tracking.lastReviewRequestDate = new Date().toISOString();
    await saveTracking(tracking);

    return true;
  } catch {
    return false;
  }
}
