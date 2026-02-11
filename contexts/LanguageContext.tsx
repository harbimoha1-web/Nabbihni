import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { I18nManager, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language, TranslationKeys } from '@/locales/translations';

// Only import expo-updates on native (not web)
let Updates: { reloadAsync: () => Promise<void> } | null = null;
try {
  Updates = require('expo-updates');
} catch {
  // Not available in Expo Go or web
}

const LANGUAGE_STORAGE_KEY = '@nabbihni/language';

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  t: TranslationKeys;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language preference
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && (saved === 'ar' || saved === 'en')) {
          setLanguageState(saved as Language);
        }
      } catch (e) {
        console.error('Failed to load language:', e);
      }
      setIsLoaded(true);
    };
    loadLanguage();
  }, []);

  // Set language with RTL handling
  const setLanguage = useCallback(async (lang: Language) => {
    const isRTL = lang === 'ar';
    const currentRTL = I18nManager.isRTL;

    // Save language preference first
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.error('Failed to save language:', e);
    }

    // Update state
    setLanguageState(lang);

    // If RTL state needs to change, we need to reload the app
    if (currentRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);

      // Get translations for the selected language
      const t = translations[lang];

      // Show alert about restart
      Alert.alert(
        t.language.changeTitle,
        t.language.changeMessage,
        [
          {
            text: t.language.later,
            style: 'cancel',
          },
          {
            text: t.language.restart,
            onPress: async () => {
              try {
                if (Updates) {
                  await Updates.reloadAsync();
                } else {
                  throw new Error('Updates not available');
                }
              } catch {
                // If Updates.reloadAsync fails (e.g., in dev), inform user to restart manually
                Alert.alert(
                  t.language.restartRequired,
                  t.language.restartManual
                );
              }
            },
          },
        ]
      );
    }
  }, []);

  const isRTL = language === 'ar';
  const t = translations[language];

  // Always render provider - loading state handled by parent
  // This prevents the blocking null chain that causes startup freeze
  return (
    <LanguageContext.Provider value={{ language, isRTL, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export type { Language, TranslationKeys };
