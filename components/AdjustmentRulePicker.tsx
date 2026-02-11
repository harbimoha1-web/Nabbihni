import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdjustmentRule } from '@/types/countdown';

interface AdjustmentRulePickerProps {
  selectedRule: AdjustmentRule;
  onSelectRule: (rule: AdjustmentRule) => void;
}

// Keys reference translation keys in calendar section
const RULE_KEYS: { value: AdjustmentRule; labelKey: 'adjustYes' | 'adjustNo'; descKey: 'adjustYesDesc' | 'adjustNoDesc'; exampleKey?: 'adjustYesExample'; icon: keyof typeof Ionicons.glyphMap }[] = [
  {
    value: 'smart',
    labelKey: 'adjustYes',
    descKey: 'adjustYesDesc',
    exampleKey: 'adjustYesExample',
    icon: 'checkmark-circle',
  },
  {
    value: 'none',
    labelKey: 'adjustNo',
    descKey: 'adjustNoDesc',
    icon: 'close-circle',
  },
];

export const AdjustmentRulePicker: React.FC<AdjustmentRulePickerProps> = ({
  selectedRule,
  onSelectRule,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const handleSelect = (rule: AdjustmentRule) => {
    Haptics.selectionAsync();
    onSelectRule(rule);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{t.calendar.ifHoliday}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t.calendar.weekendNote}
      </Text>

      <View style={styles.optionsContainer}>
        {RULE_KEYS.map((rule) => {
          const isSelected = selectedRule === rule.value;
          return (
            <Pressable
              key={rule.value}
              onPress={() => handleSelect(rule.value)}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelected
                    ? `${colors.accent}15`
                    : colors.surface,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isSelected
                        ? colors.accent
                        : colors.surface,
                    },
                  ]}
                >
                  <Ionicons
                    name={rule.icon}
                    size={20}
                    color={isSelected ? colors.background : colors.textSecondary}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: isSelected ? colors.accent : colors.text },
                    ]}
                  >
                    {t.calendar[rule.labelKey]}
                  </Text>
                  <Text
                    style={[styles.optionDescription, { color: colors.textSecondary }]}
                  >
                    {t.calendar[rule.descKey]}
                  </Text>
                  {rule.exampleKey && isSelected && (
                    <View style={[styles.exampleContainer, { backgroundColor: `${colors.accent}15` }]}>
                      <Text style={[styles.exampleText, { color: colors.accent }]}>
                        {t.calendar[rule.exampleKey]}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'right',
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    textAlign: 'right',
  },
  exampleContainer: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  exampleText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'right',
  },
});

export default AdjustmentRulePicker;
