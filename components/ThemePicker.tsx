import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { ThemeId, Theme } from '@/types/countdown';
import { themeList } from '@/constants/themes';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { saveBackgroundImage, deleteBackgroundImage } from '@/lib/imageStorage';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ThemeOptionProps {
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
  accentColor: string;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  theme,
  isSelected,
  onSelect,
  accentColor,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    onSelect();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, styles.optionContainer]}
    >
      <View
        style={[
          styles.optionWrapper,
          isSelected && {
            borderColor: accentColor,
            shadowColor: accentColor,
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
          },
        ]}
      >
        <LinearGradient
          colors={theme.colors.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.optionGradient}
        >
          {/* Glassmorphism overlay */}
          <View style={styles.glassOverlay} />

          {/* Selected checkmark */}
          {isSelected && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={styles.checkContainer}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
            </Animated.View>
          )}

          {/* Premium badge */}
          {theme.isPremium && (
            <View style={[styles.premiumBadge, { backgroundColor: accentColor }]}>
              <Ionicons name="star" size={10} color="#000" />
            </View>
          )}
        </LinearGradient>
      </View>
    </AnimatedPressable>
  );
};

interface ThemePickerProps {
  selectedTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  backgroundImage?: string;
  onBackgroundImageChange?: (uri: string | undefined) => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  selectedTheme,
  onSelectTheme,
  backgroundImage,
  onBackgroundImageChange,
}) => {
  const { colors } = useTheme();
  const { t, language, isRTL } = useLanguage();
  const { isPremium, showPremiumFeaturePrompt } = useSubscription();
  const [isPickingImage, setIsPickingImage] = useState(false);

  const pickImage = async () => {
    try {
      setIsPickingImage(true);

      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          t.themePicker.permissionRequired,
          t.themePicker.permissionMessage,
          [{ text: t.themePicker.ok }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Save to persistent storage
        const savedUri = await saveBackgroundImage(result.assets[0].uri);

        // Delete old image if exists
        if (backgroundImage) {
          await deleteBackgroundImage(backgroundImage);
        }

        onBackgroundImageChange?.(savedUri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t.error, t.themePicker.failedToPickImage);
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleCustomWallpaperPress = () => {
    Haptics.selectionAsync();

    if (!isPremium) {
      showPremiumFeaturePrompt('customWallpaper');
      return;
    }

    pickImage();
  };

  const handleCustomWallpaperLongPress = () => {
    if (!backgroundImage) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t.cancel, t.themePicker.changeImage, t.themePicker.removeBackground],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImage();
          } else if (buttonIndex === 2) {
            await deleteBackgroundImage(backgroundImage);
            onBackgroundImageChange?.(undefined);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      );
    } else {
      Alert.alert(
        t.themePicker.customWallpaper,
        t.themePicker.whatToDo,
        [
          { text: t.cancel, style: 'cancel' },
          { text: t.themePicker.changeImage, onPress: pickImage },
          {
            text: t.themePicker.removeBackground,
            style: 'destructive',
            onPress: async () => {
              await deleteBackgroundImage(backgroundImage);
              onBackgroundImageChange?.(undefined);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t.themePicker.chooseTheme}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t.themePicker.freeThemes}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {themeList.map((theme) => (
          <View key={theme.id} style={styles.themeItem}>
            <ThemeOption
              theme={theme}
              isSelected={selectedTheme === theme.id && !backgroundImage}
              onSelect={() => {
                onSelectTheme(theme.id);
                // Clear background image when selecting a theme
                if (backgroundImage) {
                  onBackgroundImageChange?.(undefined);
                }
              }}
              accentColor={colors.accent}
            />
            <Text
              style={[
                styles.optionName,
                { color: colors.textSecondary },
                selectedTheme === theme.id && !backgroundImage && {
                  color: colors.accent,
                  fontWeight: '600',
                },
              ]}
            >
              {language === 'en' ? theme.name : theme.nameAr}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Custom Wallpaper Button */}
      {onBackgroundImageChange && (
        <Pressable
          onPress={handleCustomWallpaperPress}
          onLongPress={handleCustomWallpaperLongPress}
          delayLongPress={500}
          disabled={isPickingImage}
          style={[
            styles.wallpaperButton,
            {
              backgroundColor: colors.surface,
              borderColor: backgroundImage ? colors.accent : colors.border,
            },
          ]}
        >
          {/* Thumbnail or Icon */}
          <View style={styles.wallpaperThumbnail}>
            {backgroundImage ? (
              <Image
                source={{ uri: backgroundImage }}
                style={styles.thumbnailImage}
              />
            ) : (
              <View style={[styles.thumbnailPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={styles.thumbnailEmoji}>🖼️</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.wallpaperContent}>
            <View style={styles.wallpaperTitleRow}>
              <Text style={[styles.wallpaperTitle, { color: colors.text }]}>{t.themePicker.myWallpaper}</Text>
              {!isPremium && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                  <Ionicons name="star" size={8} color="#000" style={{ marginLeft: 2 }} />
                </View>
              )}
              {backgroundImage && (
                <Animated.View entering={FadeIn.duration(200)}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                </Animated.View>
              )}
            </View>
            <Text style={[styles.wallpaperSubtitle, { color: colors.textSecondary }]}>
              {backgroundImage ? t.themePicker.customWallpaperSelected : t.themePicker.chooseFromGallery}
            </Text>
          </View>

          {/* Arrow */}
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  themeItem: {
    alignItems: 'center',
  },
  optionContainer: {
    alignItems: 'center',
  },
  optionWrapper: {
    borderRadius: 20,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionGradient: {
    width: 70,
    height: 70,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionName: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  premiumBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallpaperButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  wallpaperThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  thumbnailEmoji: {
    fontSize: 24,
  },
  wallpaperContent: {
    flex: 1,
  },
  wallpaperTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wallpaperTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  wallpaperSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
});

export default ThemePicker;
