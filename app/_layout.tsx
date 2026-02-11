import 'react-native-reanimated';
import 'react-native-get-random-values';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { useEffect, useRef, useState } from 'react';
import { I18nManager, StatusBar, Platform, View, Text, ActivityIndicator } from 'react-native';

// Register Android widget task handler (must be at top level)
if (Platform.OS === 'android') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('@/widgets/widget-task-handler');
    registerWidgetTaskHandler(widgetTaskHandler);
  } catch {
    // react-native-android-widget not available (Expo Go or web)
  }
}

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { parseDeepLink } from '@/lib/sharing';
import { syncWidgetData } from '@/lib/widgetData';

// Notifications are optional - fail silently if not available
let Notifications: any = null;
let configureNotifications: any = null;
let requestPermissions: any = null;

if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    const notifLib = require('@/lib/notifications');
    configureNotifications = notifLib.configureNotifications;
    requestPermissions = notifLib.requestPermissions;
  } catch (e) {
    // Notifications not available - that's OK
  }
}

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Enable RTL support
I18nManager.allowRTL(true);

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [isReady, setIsReady] = useState(false);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Initialize app
  useEffect(() => {
    async function prepare() {
      try {
        // Wait a tiny bit for contexts to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        // Sync widget data on app launch (non-blocking)
        syncWidgetData().catch(() => {});
      } catch (e) {
        console.warn('Prepare error:', e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  // Hide splash when ready
  useEffect(() => {
    if (fontsLoaded && isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, isReady]);

  // Setup notifications (non-blocking)
  useEffect(() => {
    if (Platform.OS === 'web' || !Notifications) return;

    const setup = async () => {
      try {
        configureNotifications?.();
        await requestPermissions?.();
      } catch (e) {
        // Ignore notification errors
      }
    };
    setup();

    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
        const data = response?.notification?.request?.content?.data;
        if (data?.countdownId && data?.type === 'countdown_reminder') {
          router.push(`/countdown/${data.countdownId}`);
        }
      });
    } catch (e) {
      // Ignore
    }

    return () => {
      notificationListener.current?.remove?.();
      responseListener.current?.remove?.();
    };
  }, []);

  // Handle deep links for shared countdowns
  useEffect(() => {
    const handleDeepLink = (url: string | null) => {
      if (!url) return;

      const parsed = parseDeepLink(url);
      if (!parsed) return;

      if (parsed.type === 'shared') {
        // Extract the encoded data from the URL
        const match = url.match(/\/s\/([^/?]+)/) || url.match(/shared\/([^/?]+)/);
        if (match) {
          router.push({ pathname: '/shared/[data]', params: { data: match[1] } });
        }
      } else if (parsed.type === 'countdown') {
        router.push({ pathname: '/countdown/[id]', params: { id: parsed.countdownId } });
      }
    };

    // Handle initial URL (app opened from link)
    Linking.getInitialURL().then(handleDeepLink);

    // Handle URLs while app is open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, []);

  // Show loading while fonts load
  if (!fontsLoaded || !isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f6ad55" />
        <Text style={{ color: '#f6ad55', marginTop: 16, fontFamily: 'System' }}>جارٍ التحميل...</Text>
      </View>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <SubscriptionProvider>
          <RootLayoutNav />
        </SubscriptionProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

function RootLayoutNav() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="countdown/create"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: t.create.title,
          }}
        />
        <Stack.Screen name="countdown/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="shared/[data]" options={{ headerShown: false }} />
        <Stack.Screen
          name="admin/holidays"
          options={{ headerShown: true, title: t.admin.manageEvents }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}
