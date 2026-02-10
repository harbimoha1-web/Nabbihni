import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Countdown } from '@/types/countdown';
import { getTheme , COLORS } from '@/constants/themes';
import { useLanguage } from '@/contexts/LanguageContext';


interface ShareCardProps {
  countdown: Countdown;
  timeText: string;
  onShare?: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  countdown,
  timeText,
  onShare,
}) => {
  const theme = getTheme(countdown.theme);
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <Text style={styles.appName}>نبّهني</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.icon}>{countdown.icon}</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {countdown.title}
          </Text>
          <Text style={[styles.timeText, { color: theme.colors.accent }]}>
            {timeText}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t.share.startCounting}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            nabbihni.com
          </Text>
        </View>
      </LinearGradient>

      {onShare && (
        <Pressable onPress={onShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color={COLORS.text} />
          <Text style={styles.shareText}>{t.share.shareButton}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  card: {
    width: 280,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    padding: 12,
    alignItems: 'flex-end',
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  footer: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shareText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default ShareCard;
