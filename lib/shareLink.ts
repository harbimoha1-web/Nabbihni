import { Countdown, ThemeId } from '@/types/countdown';

const WEB_URL = 'https://nabbihni.com';

// Shared countdown data structure (minimal for URL encoding)
export interface SharedCountdownData {
  t: string;      // title
  d: string;      // targetDate (ISO)
  i: string;      // icon (emoji)
  th: ThemeId;    // theme
  n?: string;     // sharer name (optional)
}

// Full decoded countdown data for display
export interface DecodedSharedCountdown {
  title: string;
  targetDate: string;
  icon: string;
  theme: ThemeId;
  sharerName?: string;
}

/**
 * Encodes countdown data for sharing via URL.
 * Uses Base64 URL-safe encoding for compact representation.
 */
export function encodeCountdownForShare(
  countdown: Countdown,
  sharerName?: string
): string {
  const data: SharedCountdownData = {
    t: countdown.title,
    d: countdown.targetDate,
    i: countdown.icon,
    th: countdown.theme,
  };

  if (sharerName?.trim()) {
    data.n = sharerName.trim();
  }

  try {
    // JSON → encodeURIComponent (handle Arabic) → base64
    const jsonStr = JSON.stringify(data);
    const encoded = encodeURIComponent(jsonStr);
    // Use base64 URL-safe encoding (replace + with -, / with _, remove =)
    const base64 = btoa(encoded)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  } catch (error) {
    console.error('Error encoding countdown for share:', error);
    throw new Error('Failed to encode countdown');
  }
}

/**
 * Decodes shared countdown data from URL parameter.
 * Returns null if decoding fails (invalid data).
 */
export function decodeSharedCountdown(encoded: string): DecodedSharedCountdown | null {
  try {
    // Restore base64 padding and URL-safe chars
    let base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // Add back padding
    while (base64.length % 4) {
      base64 += '=';
    }

    // base64 → decodeURIComponent → JSON
    const decoded = atob(base64);
    const jsonStr = decodeURIComponent(decoded);
    const data: SharedCountdownData = JSON.parse(jsonStr);

    // Validate required fields
    if (!data.t || !data.d || !data.i || !data.th) {
      console.error('Invalid shared countdown data: missing required fields');
      return null;
    }

    // Validate date
    const date = new Date(data.d);
    if (isNaN(date.getTime())) {
      console.error('Invalid shared countdown data: invalid date');
      return null;
    }

    return {
      title: data.t,
      targetDate: data.d,
      icon: data.i,
      theme: data.th,
      sharerName: data.n,
    };
  } catch (error) {
    console.error('Error decoding shared countdown:', error);
    return null;
  }
}

/**
 * Creates a full shareable link with embedded countdown data.
 * Format: https://nabbihni.com/s/{base64_data}
 */
export function createShareableLink(
  countdown: Countdown,
  sharerName?: string
): string {
  const encoded = encodeCountdownForShare(countdown, sharerName);
  return `${WEB_URL}/s/${encoded}`;
}

/**
 * Creates a share message with the embedded link.
 */
export function createShareMessage(
  countdown: Countdown,
  sharerName?: string,
  language: 'ar' | 'en' = 'ar'
): { message: string; link: string } {
  const link = createShareableLink(countdown, sharerName);

  const message = language === 'ar'
    ? `${countdown.icon} شاركني العد التنازلي لـ "${countdown.title}"\n\n${link}`
    : `${countdown.icon} Join my countdown to "${countdown.title}"\n\n${link}`;

  return { message, link };
}

/**
 * Checks if a URL is a shared countdown link.
 */
export function isSharedCountdownLink(url: string): boolean {
  return url.includes('/s/') || url.includes('nabbihni://shared/');
}

/**
 * Extracts the encoded data from a shared link URL.
 */
export function extractEncodedData(url: string): string | null {
  try {
    // Handle web URL: https://nabbihni.com/s/{data}
    const webMatch = url.match(/\/s\/([^/?]+)/);
    if (webMatch) {
      return webMatch[1];
    }

    // Handle deep link: nabbihni://shared/{data}
    const deepMatch = url.match(/nabbihni:\/\/shared\/([^/?]+)/);
    if (deepMatch) {
      return deepMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}
