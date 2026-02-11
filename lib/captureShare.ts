import { RefObject } from 'react';
import { Share, Platform } from 'react-native';
import ViewShot from 'react-native-view-shot';

/**
 * Captures a view as an image and returns the URI.
 */
export async function captureViewAsImage(
  viewRef: RefObject<ViewShot>
): Promise<string | null> {
  try {
    if (!viewRef.current || !viewRef.current.capture) {
      console.error('ViewShot ref is not available');
      return null;
    }

    const uri = await viewRef.current.capture();
    return uri ?? null;
  } catch (error) {
    console.error('Error capturing view as image:', error);
    return null;
  }
}

/**
 * Captures a view and shares it as an image.
 */
export async function captureAndShare(
  viewRef: RefObject<ViewShot>,
  options?: {
    message?: string;
    title?: string;
  }
): Promise<boolean> {
  try {
    const uri = await captureViewAsImage(viewRef);
    if (!uri) {
      return false;
    }

    return await shareImage(uri, options);
  } catch (error) {
    console.error('Error capturing and sharing:', error);
    return false;
  }
}

/**
 * Shares an image from a local URI.
 */
export async function shareImage(
  uri: string,
  options?: {
    message?: string;
    title?: string;
  }
): Promise<boolean> {
  try {
    const message = options?.message || '';

    // On Android, we need to pass the URL differently
    if (Platform.OS === 'android') {
      await Share.share(
        { message },
        { dialogTitle: options?.title }
      );
    } else {
      // iOS can share both URL and message
      await Share.share(
        { url: uri, message },
        { subject: options?.title }
      );
    }

    return true;
  } catch (error) {
    // User cancelled share - not an error
    if ((error as Error)?.message?.includes('User did not share')) {
      return false;
    }
    console.error('Error sharing image:', error);
    return false;
  }
}

/**
 * Shares a text message with an optional URL.
 */
export async function shareText(
  message: string,
  options?: {
    title?: string;
    url?: string;
  }
): Promise<boolean> {
  try {
    const fullMessage = options?.url
      ? `${message}\n\n${options.url}`
      : message;

    await Share.share(
      {
        message: fullMessage,
        url: options?.url,
      },
      {
        dialogTitle: options?.title,
        subject: options?.title,
      }
    );

    return true;
  } catch (error) {
    // User cancelled share - not an error
    if ((error as Error)?.message?.includes('User did not share')) {
      return false;
    }
    console.error('Error sharing text:', error);
    return false;
  }
}
