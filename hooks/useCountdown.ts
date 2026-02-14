import { useState, useEffect, useCallback, useRef } from 'react';
import { TimeRemaining } from '@/types/countdown';
import { useLanguage } from '@/contexts/LanguageContext';

const calculateTimeRemaining = (targetDate: string): TimeRemaining => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isComplete: true,
    };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isComplete: false,
  };
};

/**
 * Shared tick hook — runs ONE setInterval for the entire list screen.
 * Pass the returned `tick` value to each card's useCountdown via `externalTick`.
 */
export const useCountdownTick = (intervalMs = 1000): number => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return tick;
};

interface UseCountdownOptions {
  targetDate: string;
  onComplete?: () => void;
  updateInterval?: number; // in ms, default 1000
  externalTick?: number; // when provided, skip own interval
}

export const useCountdown = ({
  targetDate,
  onComplete,
  updateInterval = 1000,
  externalTick,
}: UseCountdownOptions) => {
  const { t } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(targetDate)
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const updateTime = useCallback(() => {
    const remaining = calculateTimeRemaining(targetDate);
    setTimeRemaining(remaining);

    if (remaining.isComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onCompleteRef.current?.();
    }
  }, [targetDate]);

  // When driven by externalTick, recalculate on each tick (no own interval)
  useEffect(() => {
    if (externalTick === undefined) return;
    hasCompletedRef.current = false;
    updateTime();
  }, [externalTick, updateTime]);

  // Self-managed interval only when no externalTick is provided
  useEffect(() => {
    if (externalTick !== undefined) return;
    hasCompletedRef.current = false;
    updateTime();

    intervalRef.current = setInterval(updateTime, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateTime, updateInterval, externalTick]);

  const formatTime = useCallback(
    (compact = false): string => {
      const { days, hours, minutes, seconds, isComplete } = timeRemaining;

      if (isComplete) {
        return t.countdown.timeUp;
      }

      if (compact) {
        if (days > 0) {
          return `${days} ${t.timeUnits.days}`;
        }
        if (hours > 0) {
          return `${hours} ${t.timeUnits.hours}`;
        }
        if (minutes > 0) {
          return `${minutes} ${t.timeUnits.minutes}`;
        }
        return `${seconds} ${t.timeUnits.seconds}`;
      }

      const parts: string[] = [];
      if (days > 0) parts.push(`${days} ${t.timeUnits.days}`);
      if (hours > 0) parts.push(`${hours} ${t.timeUnits.hours}`);
      if (minutes > 0) parts.push(`${minutes} ${t.timeUnits.minutes}`);
      if (seconds > 0 || parts.length === 0) parts.push(`${seconds} ${t.timeUnits.seconds}`);

      return parts.join(t.timeUnits.and);
    },
    [timeRemaining, t]
  );

  const getProgress = useCallback(
    (totalDuration: number): number => {
      // totalDuration in seconds (from creation to target)
      if (timeRemaining.isComplete) return 1;
      const elapsed = totalDuration - timeRemaining.totalSeconds;
      return Math.max(0, Math.min(1, elapsed / totalDuration));
    },
    [timeRemaining]
  );

  return {
    timeRemaining,
    formatTime,
    getProgress,
    isComplete: timeRemaining.isComplete,
  };
};

export default useCountdown;
