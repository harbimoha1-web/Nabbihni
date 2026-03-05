import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimeRemaining, Theme } from '@/types/countdown';
import { useLanguage } from '@/contexts/LanguageContext';

// Module-level constants — avoid recreating per render per TimeUnit
const FONT_SIZES = {
  compact: { value: 12, label: 7 },
  small: { value: 22, label: 10 },
  medium: { value: 28, label: 11 },
  large: { value: 36, label: 13 },
} as const;

// Cascade mode: single dominant unit, much larger typography
const CASCADE_FONT_SIZES = {
  compact: { value: 28, label: 11 },
  small: { value: 48, label: 16 },
  medium: { value: 64, label: 18 },
  large: { value: 88, label: 24 },
} as const;

const CONTAINER_SIZES = {
  compact: { minWidth: 32, height: 32, paddingVertical: 3, paddingHorizontal: 4 },
  small: { minWidth: 52, height: 56, paddingVertical: 6, paddingHorizontal: 6 },
  medium: { minWidth: 68, height: 72, paddingVertical: 8, paddingHorizontal: 8 },
  large: { minWidth: 70, height: 88, paddingVertical: 10, paddingHorizontal: 6 },
} as const;

const CONTAINER_GAP = {
  compact: 4,
  small: 8,
  medium: 10,
  large: 12,
} as const;

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

const TimeUnit: React.FC<TimeUnitProps> = memo(({ value, label, theme, size = 'medium', isDays = false }) => {
  // For 3+ digit numbers, don't pad with zeros
  const displayValue = value >= 100 ? String(value) : String(value).padStart(2, '0');

  // Use theme's glass color with adjusted opacity for better visibility
  const glassBackground = 'rgba(245, 243, 240, 0.12)';

  const container = CONTAINER_SIZES[size];

  // Calculate dynamic width for days unit
  const unitMinWidth = isDays
    ? getDaysWidth(value, size)
    : container.minWidth;

  // Calculate dynamic font size for days (scales down for 3-4+ digit numbers)
  const baseFontSize = FONT_SIZES[size].value;
  const actualFontSize = isDays ? getDaysFontSize(value, baseFontSize) : baseFontSize;

  return (
    <View
      style={[
        styles.unitContainer,
        {
          backgroundColor: glassBackground,
          minWidth: unitMinWidth,
          height: container.height,
          paddingVertical: container.paddingVertical,
          paddingHorizontal: container.paddingHorizontal,
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
            fontSize: FONT_SIZES[size].label,
            marginTop: size === 'compact' ? 1 : size === 'small' ? 2 : 4,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

interface CountdownTimerProps {
  timeRemaining: TimeRemaining;
  theme: Theme;
  size?: 'compact' | 'small' | 'medium' | 'large';
  showDays?: boolean;
  cascade?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  timeRemaining,
  theme,
  size = 'medium',
  showDays = true,
  cascade = false,
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

  // Cascade mode: single dominant unit
  if (cascade) {
    let cascadeValue: number;
    let cascadeLabel: string;
    if (days > 0) {
      cascadeValue = days;
      cascadeLabel = t.timeUnits.days;
    } else if (hours > 0) {
      cascadeValue = hours;
      cascadeLabel = t.timeUnits.hours;
    } else if (minutes > 0) {
      cascadeValue = minutes;
      cascadeLabel = t.timeUnits.minutes;
    } else {
      cascadeValue = seconds;
      cascadeLabel = t.timeUnits.seconds;
    }

    const fontSize = CASCADE_FONT_SIZES[size];
    const displayValue = String(cascadeValue);
    const showGlass = size !== 'large';

    return (
      <View style={styles.cascadeContainer}>
        <View style={showGlass ? [styles.cascadeGlass, { backgroundColor: 'rgba(245, 243, 240, 0.12)' }] : null}>
          <Text
            style={[styles.cascadeValue, { color: theme.colors.text, fontSize: fontSize.value }]}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.5}
            allowFontScaling={false}
          >
            {displayValue}
          </Text>
          <Text style={[styles.cascadeLabel, { color: theme.colors.textSecondary, fontSize: fontSize.label }]}>
            {cascadeLabel}
          </Text>
        </View>
      </View>
    );
  }

  // Always show days when enabled (even if 0) for consistent card format
  const showingDays = showDays;

  // Hide separators for compact mode to save space
  const showSeparators = size !== 'compact';

  return (
    <View style={[styles.container, { gap: CONTAINER_GAP[size] }]}>
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
  cascadeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cascadeGlass: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cascadeValue: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  cascadeLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
});

export default CountdownTimer;
