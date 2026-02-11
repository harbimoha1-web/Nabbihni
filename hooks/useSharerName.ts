import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SHARER_NAME_KEY = '@nabbihni/sharer-name';

export interface UseSharerNameResult {
  name: string | null;
  setName: (name: string) => Promise<void>;
  clearName: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook to manage the user's sharing name.
 * Stored locally in AsyncStorage, used when sharing countdowns.
 */
export function useSharerName(): UseSharerNameResult {
  const [name, setNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load name from storage on mount
  useEffect(() => {
    const loadName = async () => {
      try {
        const storedName = await AsyncStorage.getItem(SHARER_NAME_KEY);
        setNameState(storedName);
      } catch (error) {
        console.error('Error loading sharer name:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadName();
  }, []);

  // Save name to storage
  const setName = useCallback(async (newName: string) => {
    try {
      const trimmedName = newName.trim();
      if (trimmedName) {
        await AsyncStorage.setItem(SHARER_NAME_KEY, trimmedName);
        setNameState(trimmedName);
      }
    } catch (error) {
      console.error('Error saving sharer name:', error);
    }
  }, []);

  // Clear name from storage
  const clearName = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SHARER_NAME_KEY);
      setNameState(null);
    } catch (error) {
      console.error('Error clearing sharer name:', error);
    }
  }, []);

  return {
    name,
    setName,
    clearName,
    isLoading,
  };
}

/**
 * One-time function to get sharer name (for non-hook contexts).
 */
export async function getSharerName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SHARER_NAME_KEY);
  } catch (error) {
    console.error('Error getting sharer name:', error);
    return null;
  }
}

/**
 * One-time function to save sharer name (for non-hook contexts).
 */
export async function saveSharerName(name: string): Promise<void> {
  try {
    const trimmedName = name.trim();
    if (trimmedName) {
      await AsyncStorage.setItem(SHARER_NAME_KEY, trimmedName);
    }
  } catch (error) {
    console.error('Error saving sharer name:', error);
  }
}
