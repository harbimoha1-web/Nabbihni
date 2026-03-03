import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import { getTheme } from '@/constants/themes';
import { Countdown } from '@/types/countdown';
import { DOWNLOAD_URL } from '@/lib/sharing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);
const CARD_HEIGHT = CARD_WIDTH * 1.25;

export interface ShareCardRef {
  capture: () => Promise<string | undefined>;
}

interface ShareCardProps {
  countdown: Countdown;
  timeText: string;
  language?: 'ar' | 'en';
}

const ShareCard = forwardRef<ShareCardRef, ShareCardProps>(
  ({ countdown, timeText, language = 'ar' }, ref) => {
    const viewShotRef = useRef<ViewShot>(null);
    const themeConfig = getTheme(countdown.theme);

    useImperativeHandle(ref, () => ({
      capture: async () => {
        if (viewShotRef.current && viewShotRef.current.capture) {
          return viewShotRef.current.capture();
        }
        return undefined;
      },
    }));

    const scanText = language === 'ar' ? 'امسح للتحميل' : 'Scan to Download';
    const isRTL = language === 'ar';

    return (
      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        }}
      >
        <View style={styles.container}>
          <LinearGradient
            colors={themeConfig.colors.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Decorative circles */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            {/* Header watermark */}
            <View style={styles.header}>
              <Text style={styles.watermark}>كم باقي</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.icon}>{countdown.icon}</Text>
              <Text
                style={[styles.title, { color: themeConfig.colors.text }]}
                numberOfLines={2}
              >
                {countdown.title}
              </Text>
              <Text
                style={[styles.timeText, { color: themeConfig.colors.accent }]}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {timeText}
              </Text>
            </View>

            {/* Footer: QR code + text stack */}
            <View style={styles.footer}>
              <View style={styles.footerDivider} />
              <View style={[styles.footerRow, isRTL && styles.footerRowRTL]}>
                <QRCode
                  value={DOWNLOAD_URL}
                  size={52}
                  color="rgba(255,255,255,0.9)"
                  backgroundColor="transparent"
                />
                <View style={[styles.footerTextStack, isRTL && styles.footerTextStackRTL]}>
                  <Text style={styles.footerAppName}>كم باقي</Text>
                  <Text style={styles.footerScanText}>{scanText}</Text>
                  <Text style={styles.footerUrl}>nabbihni.com</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ViewShot>
    );
  }
);

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  card: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  watermark: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  timeText: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 10,
  },
  downloadText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  url: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default ShareCard;
