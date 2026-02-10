import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { Share } from 'react-native';
import { Countdown } from '@/types/countdown';
import {
  encodeCountdownForShare,
  decodeSharedCountdown,
  isSharedCountdownLink,
  extractEncodedData,
  DecodedSharedCountdown,
} from './shareLink';

const APP_SCHEME = 'nabbihni';
const WEB_URL = 'https://nabbihni.com';

export const createDeepLink = (countdownId: string): string => {
  return `${APP_SCHEME}://countdown/${countdownId}`;
};

export const createWebLink = (countdownId: string): string => {
  return `${WEB_URL}/c/${countdownId}`;
};

/**
 * Creates a shareable link with embedded countdown data (no backend needed).
 */
export const createEmbeddedShareLink = (
  countdown: Countdown,
  sharerName?: string
): string => {
  const encoded = encodeCountdownForShare(countdown, sharerName);
  return `${WEB_URL}/s/${encoded}`;
};

/**
 * Creates an app deep link with embedded countdown data.
 */
export const createEmbeddedDeepLink = (
  countdown: Countdown,
  sharerName?: string
): string => {
  const encoded = encodeCountdownForShare(countdown, sharerName);
  return `${APP_SCHEME}://shared/${encoded}`;
};

export type ParsedLink =
  | { type: 'countdown'; countdownId: string }
  | { type: 'shared'; data: DecodedSharedCountdown }
  | null;

/**
 * Parses any deep link URL and returns the appropriate data.
 */
export const parseDeepLink = (url: string): ParsedLink => {
  try {
    // Handle shared countdown link: /s/{data} or nabbihni://shared/{data}
    if (isSharedCountdownLink(url)) {
      const encoded = extractEncodedData(url);
      if (encoded) {
        const data = decodeSharedCountdown(encoded);
        if (data) {
          return { type: 'shared', data };
        }
      }
    }

    // Handle app deep link: nabbihni://countdown/{id}
    if (url.startsWith(`${APP_SCHEME}://`)) {
      const match = url.match(/countdown\/([^/?]+)/);
      if (match) {
        return { type: 'countdown', countdownId: match[1] };
      }
    }

    // Handle web link: https://nabbihni.com/c/{id}
    if (url.includes('nabbihni.com')) {
      const match = url.match(/\/c\/([^/?]+)/);
      if (match) {
        return { type: 'countdown', countdownId: match[1] };
      }
    }

    return null;
  } catch {
    return null;
  }
};

export const shareCountdown = async (countdown: Countdown): Promise<boolean> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.log('Sharing is not available');
      return false;
    }

    const link = createWebLink(countdown.id);
    const message = `${countdown.icon} العد التنازلي لـ ${countdown.title}\n\n${link}`;

    // Note: expo-sharing doesn't support sharing plain text on all platforms
    // In production, you'd generate an image share card
    await Sharing.shareAsync(link, {
      dialogTitle: `شارك العد التنازلي: ${countdown.title}`,
    });

    return true;
  } catch (error) {
    console.error('Error sharing countdown:', error);
    return false;
  }
};

/**
 * Shares a countdown with embedded data (no backend needed).
 * Uses native Share API for better text/link sharing.
 */
export const shareCountdownWithData = async (
  countdown: Countdown,
  sharerName?: string,
  language: 'ar' | 'en' = 'ar'
): Promise<boolean> => {
  try {
    const link = createEmbeddedShareLink(countdown, sharerName);

    const message = language === 'ar'
      ? `${countdown.icon} شاركني العد التنازلي لـ "${countdown.title}"\n\n${link}`
      : `${countdown.icon} Join my countdown to "${countdown.title}"\n\n${link}`;

    await Share.share(
      { message },
      {
        dialogTitle: language === 'ar'
          ? `شارك العد التنازلي: ${countdown.title}`
          : `Share countdown: ${countdown.title}`,
      }
    );

    return true;
  } catch (error) {
    // User cancelled - not an error
    if ((error as Error)?.message?.includes('User did not share')) {
      return false;
    }
    console.error('Error sharing countdown with data:', error);
    return false;
  }
};

export const shareText = async (text: string): Promise<boolean> => {
  try {
    // Use Linking to open share sheet with text
    const url = `sms:&body=${encodeURIComponent(text)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const getInitialURL = async (): Promise<string | null> => {
  return Linking.getInitialURL();
};

export const addLinkingListener = (
  callback: (event: { url: string }) => void
): (() => void) => {
  const subscription = Linking.addEventListener('url', callback);
  return () => subscription.remove();
};
