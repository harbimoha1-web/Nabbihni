import { Platform } from 'react-native';
import {
  getInfoAsync,
  makeDirectoryAsync,
  copyAsync,
  deleteAsync,
  documentDirectory,
  readAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUNDS_DIR = documentDirectory ? `${documentDirectory}backgrounds/` : null;
const WEB_BACKGROUNDS_KEY = '@nabbihni/backgrounds';

/**
 * Ensure the backgrounds directory exists (native only)
 */
async function ensureBackgroundsDir(): Promise<void> {
  if (!BACKGROUNDS_DIR) return;

  const dirInfo = await getInfoAsync(BACKGROUNDS_DIR);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(BACKGROUNDS_DIR, { intermediates: true });
  }
}

/**
 * Convert a file URI to base64 data URI (for web compatibility)
 */
async function convertToBase64(uri: string): Promise<string> {
  try {
    // On web, fetch the blob and convert to base64
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // On native, use expo-file-system
    const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Failed to convert to base64:', error);
    throw error;
  }
}

/**
 * Save a background image to persistent storage
 * @param uri - The temporary URI of the image (from image picker)
 * @returns The persistent URI of the saved image
 */
export async function saveBackgroundImage(uri: string): Promise<string> {
  // On web, convert to base64 and store in AsyncStorage
  if (Platform.OS === 'web' || !BACKGROUNDS_DIR) {
    const base64Uri = await convertToBase64(uri);
    const key = `${WEB_BACKGROUNDS_KEY}/${Date.now()}`;
    await AsyncStorage.setItem(key, base64Uri);
    // Return the base64 data URI directly - it works in Image components
    return base64Uri;
  }

  // On native, copy the file to persistent storage
  await ensureBackgroundsDir();

  // Generate a unique filename using timestamp
  const filename = `bg_${Date.now()}.jpg`;
  const destination = `${BACKGROUNDS_DIR}${filename}`;

  // Copy the image to our persistent storage
  await copyAsync({
    from: uri,
    to: destination,
  });

  return destination;
}

/**
 * Delete a background image from storage
 * @param uri - The persistent URI of the image to delete
 */
export async function deleteBackgroundImage(uri: string): Promise<void> {
  // On web, base64 URIs are stored directly in the countdown data
  // Nothing to delete separately - just clear from countdown
  if (Platform.OS === 'web' || uri.startsWith('data:')) {
    return;
  }

  // On native, only delete if it's in our backgrounds directory
  if (!BACKGROUNDS_DIR || !uri.startsWith(BACKGROUNDS_DIR)) {
    return;
  }

  const fileInfo = await getInfoAsync(uri);
  if (fileInfo.exists) {
    await deleteAsync(uri, { idempotent: true });
  }
}

/**
 * Check if a background image exists
 * @param uri - The URI to check
 * @returns Whether the image exists
 */
export async function backgroundImageExists(uri: string): Promise<boolean> {
  if (!uri) return false;

  // Base64 data URIs are always "valid" (they contain the image data directly)
  if (uri.startsWith('data:')) {
    return true;
  }

  // On web, we can't check file existence
  if (Platform.OS === 'web') {
    return true;
  }

  try {
    const fileInfo = await getInfoAsync(uri);
    return fileInfo.exists;
  } catch {
    return false;
  }
}
