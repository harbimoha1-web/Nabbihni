const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// EAS Build compiles native modules in — no stubbing needed
// During local development, stub native-only modules to prevent crashes
const isEASBuild = !!process.env.EAS_BUILD;

if (!isEASBuild) {
  const EXPO_GO_INCOMPATIBLE_MODULES = [
    'react-native-purchases',
    'react-native-google-mobile-ads',
    'react-native-android-widget',
    'react-native-shared-group-preferences',
  ];

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const isIncompatible = EXPO_GO_INCOMPATIBLE_MODULES.some(
      (mod) => moduleName === mod || moduleName.startsWith(mod + '/')
    );

    if (isIncompatible) {
      return { type: 'empty' };
    }

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
}

module.exports = config;
