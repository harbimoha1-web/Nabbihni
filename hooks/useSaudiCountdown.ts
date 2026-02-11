import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTimeUntilSaudiMidnight,
  hasDatePassedInSaudiTime,
} from '@/lib/hijriService';

interface SaudiCountdownOptions {
  targetDate: string;
  onComplete?: () => void;
  onAutoRoll?: () => void;
}

interface SaudiCountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isComplete: boolean;
}

/**
 * Hook for Saudi timezone-aware countdown
 * Uses Saudi Arabia time (UTC+3) for all calculations
 * Triggers onAutoRoll when the date passes in Saudi time
 */
export function useSaudiCountdown({
  targetDate,
  onComplete,
  onAutoRoll,
}: SaudiCountdownOptions): SaudiCountdownResult {
  const [timeRemaining, setTimeRemaining] = useState<SaudiCountdownResult>(
    () => getTimeUntilSaudiMidnight(targetDate)
  );
  const hasTriggeredComplete = useRef(false);
  const hasTriggeredAutoRoll = useRef(false);

  useEffect(() => {
    // Reset flags when target date changes
    hasTriggeredComplete.current = false;
    hasTriggeredAutoRoll.current = false;
  }, [targetDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeUntilSaudiMidnight(targetDate);
      setTimeRemaining(remaining);

      // Check if countdown just completed
      if (remaining.isComplete && !hasTriggeredComplete.current) {
        hasTriggeredComplete.current = true;
        onComplete?.();
      }

      // Check if date has passed in Saudi time (for auto-roll)
      if (
        hasDatePassedInSaudiTime(targetDate) &&
        !hasTriggeredAutoRoll.current
      ) {
        hasTriggeredAutoRoll.current = true;
        onAutoRoll?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete, onAutoRoll]);

  return timeRemaining;
}

/**
 * Format countdown time - requires translations object
 */
export function formatSaudiCountdown(
  result: SaudiCountdownResult,
  t: { countdown: { timeUp: string }; timeUnits: { days: string; hours: string; minutes: string; seconds: string; and: string } }
): string {
  if (result.isComplete) {
    return t.countdown.timeUp;
  }

  const parts: string[] = [];

  if (result.days > 0) {
    parts.push(`${result.days} ${t.timeUnits.days}`);
  }
  if (result.hours > 0 || result.days > 0) {
    parts.push(`${result.hours} ${t.timeUnits.hours}`);
  }
  if (result.minutes > 0 || result.hours > 0 || result.days > 0) {
    parts.push(`${result.minutes} ${t.timeUnits.minutes}`);
  }
  parts.push(`${result.seconds} ${t.timeUnits.seconds}`);

  return parts.join(t.timeUnits.and);
}
