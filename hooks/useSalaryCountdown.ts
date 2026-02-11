import { useCallback } from 'react';
import { Countdown, RecurrenceSettings } from '@/types/countdown';
import { calculateNextSalaryDate } from '@/lib/salaryCalculator';
import { calculateNextRecurringDate } from '@/lib/recurringCalculator';
import { hasDatePassedInSaudiTime } from '@/lib/hijriService';
import { updateCountdown } from '@/lib/storage';

interface UseSalaryCountdownResult {
  checkAndAdvance: (countdown: Countdown) => Promise<Countdown | null>;
  shouldAutoAdvance: (countdown: Countdown) => boolean;
  getNextSalaryDate: (recurrence: RecurrenceSettings) => string;
}

/**
 * Hook for managing salary countdown auto-advance logic
 */
export const useSalaryCountdown = (): UseSalaryCountdownResult => {
  /**
   * Check if a countdown should auto-advance
   */
  const shouldAutoAdvance = useCallback((countdown: Countdown): boolean => {
    if (!countdown.isRecurring || !countdown.recurrence) {
      return false;
    }
    return hasDatePassedInSaudiTime(countdown.targetDate);
  }, []);

  /**
   * Get next date based on recurrence settings (supports all recurrence types)
   */
  const getNextSalaryDate = useCallback((recurrence: RecurrenceSettings): string => {
    // Use general recurring calculator for all types
    const result = calculateNextRecurringDate({ recurrence });
    return result.targetDate;
  }, []);

  /**
   * Check and auto-advance a recurring countdown if needed
   */
  const checkAndAdvance = useCallback(
    async (countdown: Countdown): Promise<Countdown | null> => {
      if (!shouldAutoAdvance(countdown) || !countdown.recurrence) {
        return null;
      }

      const newTargetDate = getNextSalaryDate(countdown.recurrence);

      const updates: Partial<Countdown> = {
        targetDate: newTargetDate,
        recurrence: {
          ...countdown.recurrence,
          lastAutoAdvanced: new Date().toISOString(),
        },
      };

      const updated = await updateCountdown(countdown.id, updates);
      return updated;
    },
    [shouldAutoAdvance, getNextSalaryDate]
  );

  return {
    checkAndAdvance,
    shouldAutoAdvance,
    getNextSalaryDate,
  };
};

/**
 * Standalone function to check and advance recurring countdowns
 * Used in loadCountdowns without hooks
 * Supports all recurrence types: salary, daily, weekly, monthly, yearly
 */
export async function checkAndAdvanceRecurringCountdown(
  countdown: Countdown
): Promise<Countdown | null> {
  if (!countdown.isRecurring || !countdown.recurrence) {
    return null;
  }

  if (!hasDatePassedInSaudiTime(countdown.targetDate)) {
    return null;
  }

  // Use general recurring calculator for all types
  const result = calculateNextRecurringDate({
    recurrence: countdown.recurrence,
  });

  const updates: Partial<Countdown> = {
    targetDate: result.targetDate,
    recurrence: {
      ...countdown.recurrence,
      lastAutoAdvanced: new Date().toISOString(),
    },
  };

  return await updateCountdown(countdown.id, updates);
}

export default useSalaryCountdown;
