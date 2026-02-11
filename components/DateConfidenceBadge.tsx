import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DateConfidence } from '@/types/countdown';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface DateConfidenceBadgeProps {
  confidence: DateConfidence;
  isHijriDerived?: boolean;
  showLabel?: boolean;
  size?: 'small' | 'medium';
}

export const DateConfidenceBadge: React.FC<DateConfidenceBadgeProps> = ({
  confidence,
  isHijriDerived = false,
  showLabel = true,
  size = 'small',
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const getConfidenceConfig = () => {
    switch (confidence) {
      case 'confirmed':
        return {
          icon: 'checkmark-circle' as const,
          color: '#22c55e', // green
          label: t.explore.confirmed,
        };
      case 'estimated':
        return {
          icon: 'time' as const,
          color: '#f97316', // orange
          label: t.explore.estimated,
        };
      case 'tentative':
        return {
          icon: 'help-circle' as const,
          color: '#9ca3af', // gray
          label: t.explore.tentative,
        };
      default:
        return {
          icon: 'help-circle' as const,
          color: '#9ca3af',
          label: '',
        };
    }
  };

  const config = getConfidenceConfig();
  const iconSize = size === 'small' ? 12 : 16;
  const fontSize = size === 'small' ? 10 : 12;

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
        <Ionicons name={config.icon} size={iconSize} color={config.color} />
        {showLabel && (
          <Text style={[styles.label, { color: config.color, fontSize }]}>
            {config.label}
          </Text>
        )}
      </View>
      {isHijriDerived && confidence === 'estimated' && (
        <Text style={[styles.moonNote, { color: colors.textSecondary, fontSize: fontSize - 1 }]}>
          {t.explore.moonSightingNote}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  label: {
    fontWeight: '500',
  },
  moonNote: {
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default DateConfidenceBadge;
