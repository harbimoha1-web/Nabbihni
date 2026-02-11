const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Stub native modules that crash Expo Go / web with empty modules
const EXPO_GO_INCOMPATIBLE_MODULES = [
  'react-native-purchases',
  'react-native-google-mobile-ads',
  'react-native-android-widget',
  'react-native-shared-group-preferences',
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Match exact module names and any sub-path imports
  const isIncompatible = EXPO_GO_INCOMPATIBLE_MODULES.some(
    (mod) => moduleName === mod || moduleName.startsWith(mod + '/')
  );

  if (isIncompatible) {
    return { type: 'empty' };
  }

  // Also stub relative imports from within incompatible modules
  if (context.originModulePath) {
    const isFromIncompatible = EXPO_GO_INCOMPATIBLE_MODULES.some(
      (mod) => context.originModulePath.includes(path.join('node_modules', mod))
    );
    if (isFromIncompatible) {
      return { type: 'empty' };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
