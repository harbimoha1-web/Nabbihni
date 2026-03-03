const { withAndroidStyles } = require('@expo/config-plugins');

/**
 * Removes the `windowSplashScreenAnimatedIcon` item from Android styles.
 *
 * expo-splash-screen (31.x / SDK 54) always writes this reference into
 * res/values/styles.xml even when no splash `image` is configured. The
 * drawable it points to (`splashscreen_logo`) is never generated, so
 * `processReleaseResources` fails with "resource not found".
 *
 * This plugin runs after expo-splash-screen's mod and strips the item.
 */
module.exports = function withNoSplashLogo(config) {
  return withAndroidStyles(config, (config) => {
    const styles = config.modResults;
    if (styles.resources?.style) {
      for (const style of styles.resources.style) {
        if (Array.isArray(style.item)) {
          style.item = style.item.filter(
            (item) => item.$?.name !== 'windowSplashScreenAnimatedIcon'
          );
        }
      }
    }
    return config;
  });
};
