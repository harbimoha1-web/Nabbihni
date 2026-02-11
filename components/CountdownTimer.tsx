import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimeRemaining, Theme } from '@/types/countdown';
import { useLanguage } from '@/contexts/LanguageContext';


interface TimeUnitProps {
  value: number;
  label: string;
  theme: Theme;
  size?: 'compact' | 'small' | 'medium' | 'large';
  isDays?: boolean;
}

// Calculate font size for days based on digit count
// Slightly reduce for 3+ digits, adjustsFontSizeToFit handles the rest
const getDaysFontSize = (days: number, baseSize: number): number => {
  const digitCount = String(days).length;
  if (digitCount <= 2) return baseSize;
  // Slightly reduce for 3+ digits, adjustsFontSizeToFit handles the rest
  return Math.floor(baseSize * 0.85);
};

// Calculate minimum width based on digit count for days (can be 4+ digits)
// For compact mode, keep same width as other units for consistent card shape
const getDaysWidth = (days: number, size: 'compact' | 'small' | 'medium' | 'large'): number => {
  // Compact mode: fixed width, let adjustsFontSizeToFit handle large numbers
  if (size === 'compact') {
    return 32; // Same as other units for consistent shape
  }

  const digitCount = String(days).length;
  const baseWidths = {
    compact: 32,
    small: 52,
    medium: 68,
    large: 90,
  };
  // Add extra width per additional digit beyond 2 (only for non-compact)
  const extraDigits = Math.max(0, digitCount - 2);
  const widthPerDigit = {
    compact: 0,
    small: 14,
    medium: 18,
    large: 24,
  };
  return baseWidths[size] + extraDigits * widthPerDigit[size];
};

const TimeUnit: React.FC<TimeUnitProps> = ({ value, label, theme, size = 'medium', isDays = false }) => {
  // Removed scale animation - was causing blur on every tick
  // Clean, static rendering is better for readability

  const sizes = {
    compact: { value: 12, label: 7 },
    small: { value: 22, label: 10 },
    medium: { value: 28, label: 11 },
    large: { value: 36, label: 13 },
  };

  const containerSizes = {
    compact: { minWidth: 32, height: 32, paddingVertical: 3, paddingHorizontal: 4 },
    small: { minWidth: 52, height: 56, paddingVertical: 6, paddingHorizontal: 6 },
    medium: { minWidth: 68, height: 72, paddingVertical: 8, paddingHorizontal: 8 },
    large: { minWidth: 70, height: 88, paddingVertical: 10, paddingHorizontal: 6 },
  };

  // For 3+ digit numbers, don't pad with zeros
  const displayValue = value >= 100 ? String(value) : String(value).padStart(2, '0');

  // Use theme's glass color with adjusted opacity for better visibility
  const glassBackground = 'rgba(245, 243, 240, 0.12)';

  // Calculate dynamic width for days unit
  const unitMinWidth = isDays
    ? getDaysWidth(value, size)
    : containerSizes[size].minWidth;

  // Calculate dynamic font size for days (scales down for 3-4+ digit numbers)
  const baseFontSize = sizes[size].value;
  const actualFontSize = isDays ? getDaysFontSize(value, baseFontSize) : baseFontSize;

  return (
    <View
      style={[
        styles.unitContainer,
        {
          backgroundColor: glassBackground,
          minWidth: unitMinWidth,
          height: containerSizes[size].height,
          paddingVertical: containerSizes[size].paddingVertical,
          paddingHorizontal: containerSizes[size].paddingHorizontal,
        },
      ]}
    >
      <Text
        style={[
          styles.unitValue,
          { color: theme.colors.text, fontSize: actualFontSize },
        ]}
        adjustsFontSizeToFit={true}
        numberOfLines={1}
        minimumFontScale={0.5}
        allowFontScaling={false}
      >
        {displayValue}
      </Text>
      <Text
        style={[
          styles.unitLabel,
          {
            color: theme.colors.textSecondary,
            fontSize: sizes[size].label,
            marginTop: size === 'compact' ? 1 : size === 'small' ? 2 : 4,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

interface CountdownTimerProps {
  timeRemaining: TimeRemaining;
  theme: Theme;
  size?: 'compact' | 'small' | 'medium' | 'large';
  showDays?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  timeRemaining,
  theme,
  size = 'medium',
  showDays = true,
}) => {
  const { t } = useLanguage();
  const { days, hours, minutes, seconds, isComplete } = timeRemaining;

  if (isComplete) {
    return (
      <View style={styles.completeContainer}>
        <Text style={[styles.completeText, { color: theme.colors.accent }]}>
          {t.countdown.timeUp}
        </Text>
      </View>
    );
  }

  // Always show days when enabled (even if 0) for consistent card format
  const showingDays = showDays;

  // Hide separators for compact mode to save space
  const showSeparators = size !== 'compact';

  // Gap between time units - need proper spacing even in compact mode
  const containerGap = {
    compact: 4,
    small: 8,
    medium: 10,
    large: 12,
  }[size];

  return (
    <View style={[styles.container, { gap: containerGap }]}>
      {showingDays && (
        <>
          <TimeUnit value={days} label={t.timeUnits.days} theme={theme} size={size} isDays />
          {showSeparators && (
            <Text style={[styles.separator, { color: theme.colors.text }]}>:</Text>
          )}
        </>
      )}
      <TimeUnit value={hours} label={t.timeUnits.hours} theme={theme} size={size} />
      {showSeparators && (
        <Text style={[styles.separator, { color: theme.colors.text }]}>:</Text>
      )}
      <TimeUnit value={minutes} label={t.timeUnits.minutes} theme={theme} size={size} />
      {showSeparators && (
        <Text style={[styles.separator, { color: theme.colors.text }]}>:</Text>
      )}
      <TimeUnit value={seconds} label={t.timeUnits.seconds} theme={theme} size={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    width: '100%',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  unitContainer: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  unitValue: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    // marginTop is set dynamically based on size
  },
  separator: {
    fontSize: 24,
    fontWeight: '600',
    opacity: 0.5,
  },
  completeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  completeText: {
    fontSize: 32,
    fontWeight: '700',
  },
});

export default CountdownTimer;
