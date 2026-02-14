import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Share,
  Dimensions,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSingleCountdown } from '@/hooks/useCountdowns';
import { useCountdown } from '@/hooks/useCountdown';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSharerName } from '@/hooks/useSharerName';
import { shareCountdownWithData } from '@/lib/sharing';
import CountdownTimer from '@/components/CountdownTimer';
import CelebrationAnimation from '@/components/CelebrationAnimation';
import CelebrationShareCard, { CelebrationShareCardRef } from '@/components/CelebrationShareCard';
import AnimatedIcon from '@/components/AnimatedIcon';
import IconParticleBurst from '@/components/IconParticleBurst';
import DateConfidenceBadge from '@/components/DateConfidenceBadge';
import TaskList from '@/components/TaskList';
import { getTheme } from '@/constants/themes';
import { useTheme } from '@/contexts/ThemeContext';
import { publicEvents } from '@/constants/publicEvents';
import { processEventsWithRecurrence } from '@/lib/eventRecurrenceEngine';
import { Countdown, PublicEvent } from '@/types/countdown';
import { shareImage } from '@/lib/captureShare';

const { width } = Dimensions.get('window');

const publicEventToCountdown = (event: PublicEvent): Countdown => ({
  id: event.id,
  title: event.titleAr,
  targetDate: event.targetDate,
  icon: event.icon,
  theme: event.theme,
  isPublic: true,
  createdAt: new Date().toISOString(),
  participantCount: event.participantCount,
});

export default function CountdownDetailScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const searchParams = useLocalSearchParams<{ id: string; public?: string; eventData?: string }>();
  const isPublicEvent = searchParams.public === 'true';
  const id = searchParams.id;

  // For public events, first try event data passed from explore page,
  // then fall back to static lookup (for deep links)
  const publicEvent = isPublicEvent
    ? (() => {
        // First: use event data passed from explore page
        if (searchParams.eventData) {
          try { return JSON.parse(searchParams.eventData) as PublicEvent; } catch {}
        }
        // Fallback: static lookup (for deep links)
        return publicEvents.find((e) => e.id === id)
          || (() => {
              const baseId = id?.replace(/-\d{4}$/, '');
              const sourceEvent = publicEvents.find(
                (e) => e.baseId === baseId || e.id.replace(/-\d{4}$/, '') === baseId
              );
              if (sourceEvent) {
                const processed = processEventsWithRecurrence([sourceEvent]);
                return processed[0] || null;
              }
              return null;
            })();
      })()
    : null;

  // For personal countdowns, get from storage
  const {
    countdown: personalCountdown,
    loading,
    remove,
    refresh,
    addTask,
    toggleTask,
    deleteTask,
  } = useSingleCountdown(isPublicEvent ? '' : (id ?? ''));

  // Refresh when returning from edit screen
  useFocusEffect(
    useCallback(() => {
      if (!isPublicEvent) {
        refresh();
      }
    }, [isPublicEvent, refresh])
  );

  const { cancelNotifications } = useNotifications();
  const { name: sharerName, setName: setSharerName } = useSharerName();
  const celebrationCardRef = useRef<CelebrationShareCardRef>(null);

  const countdown = publicEvent
    ? publicEventToCountdown(publicEvent)
    : personalCountdown;

  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCelebrationShare, setShowCelebrationShare] = useState(false);
  const [tempSharerName, setTempSharerName] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const handleComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowConfetti(true);
  }, []);

  // Use a stable fallback date far in the future to avoid false "time's up" triggers
  // when countdown is temporarily null during async updates (e.g., adding a task)
  const stableTargetDate = countdown?.targetDate ?? '2099-12-31T23:59:59.999Z';

  const { timeRemaining, formatTime } = useCountdown({
    targetDate: stableTargetDate,
    onComplete: handleComplete,
  });

  const theme = countdown ? getTheme(countdown.theme) : getTheme('default');
  const hasBackgroundImage = !!countdown?.backgroundImage;

  const handleShare = async () => {
    if (!countdown) return;
    setTempSharerName(sharerName || '');
    setShowShareModal(true);
  };

  const handleShareConfirm = async () => {
    if (!countdown || isSharing) return;

    setIsSharing(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Save the name if provided
      if (tempSharerName.trim()) {
        await setSharerName(tempSharerName.trim());
      }

      // Share with embedded data
      await shareCountdownWithData(
        countdown,
        tempSharerName.trim() || undefined,
        language
      );

      setShowShareModal(false);
    } catch (error) {
      if (__DEV__) console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCelebrationShare = async () => {
    if (!countdown || isSharing) return;

    setIsSharing(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Capture the celebration card as image
      const uri = await celebrationCardRef.current?.capture();
      if (uri) {
        await shareImage(uri, {
          message: language === 'ar'
            ? `🎉 ${countdown.title} - حان الوقت!\n\nنبّهني`
            : `🎉 ${countdown.title} - Time's up!\n\nNabbihni`,
          title: language === 'ar' ? 'شارك اللحظة' : 'Share the moment',
        });
      }
    } catch (error) {
      if (__DEV__) console.error('Error sharing celebration:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t.countdown.deleteTitle,
      t.countdown.deleteConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            // Cancel scheduled notifications for this countdown
            if (id) {
              await cancelNotifications(id);
            }
            const success = await remove();
            if (success) {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/countdown/create?id=${id}&mode=edit`);
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    // Show celebration share card after confetti
    setShowCelebrationShare(true);
  };

  if (loading && !isPublicEvent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!countdown) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>{t.countdown.notFound}</Text>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface }]}>
            <Text style={[styles.backButtonText, { color: colors.text }]}>{t.back}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.headerButton, { backgroundColor: colors.glass }]}>
          <Ionicons name="arrow-forward" size={24} color={theme.colors.text} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={handleShare} style={[styles.headerButton, { backgroundColor: colors.glass }]}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </Pressable>
          {!isPublicEvent && (
            <>
              <Pressable onPress={handleEdit} style={[styles.headerButton, { backgroundColor: colors.glass }]}>
                <Ionicons name="create-outline" size={24} color={theme.colors.text} />
              </Pressable>
              <Pressable onPress={handleDelete} style={[styles.headerButton, { backgroundColor: colors.glass }]}>
                <Ionicons name="trash-outline" size={24} color={theme.colors.text} />
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.iconContainer}>
          <View style={styles.particleLayer}>
            <IconParticleBurst emoji={countdown.icon} size={72} />
          </View>
          <View style={styles.iconLayer}>
            <AnimatedIcon emoji={countdown.icon} size={72} />
          </View>
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {countdown.title}
        </Text>

        {countdown.participantCount && countdown.participantCount > 0 && (
          <View style={styles.participantsContainer}>
            <Ionicons
              name="people-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.participantsText, { color: theme.colors.textSecondary }]}>
              {countdown.participantCount.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} {t.countdown.countingWith}
            </Text>
          </View>
        )}

        <View style={styles.timerContainer}>
          <CountdownTimer
            timeRemaining={timeRemaining}
            theme={theme}
            size="large"
          />
        </View>

        {timeRemaining.isComplete && (
          <View style={styles.celebrationContainer}>
            <Text style={[styles.celebrationText, { color: theme.colors.accent }]}>
              🎉 {t.countdown.timeUp} 🎉
            </Text>
            <Pressable onPress={handleShare} style={[styles.shareButton, { backgroundColor: colors.accent }]}>
              <Ionicons name="share-social" size={20} color={colors.background} />
              <Text style={[styles.shareButtonText, { color: colors.background }]}>{t.countdown.shareMoment}</Text>
            </Pressable>
          </View>
        )}

        {!timeRemaining.isComplete && (
          <View style={styles.targetDateContainer}>
            <Text style={[styles.targetDateHijri, { color: theme.colors.text }]}>
              {new Date(countdown.targetDate).toLocaleDateString(
                language === 'ar' ? 'ar-SA-u-ca-islamic' : 'en-US-u-ca-islamic',
                {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }
              )}
            </Text>
            <Text style={[styles.targetDateGregorian, { color: theme.colors.textSecondary }]}>
              {new Date(countdown.targetDate).toLocaleDateString(
                language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US-u-ca-gregory',
                {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}
            </Text>
            {/* Show date confidence badge only for public events with dateConfidence */}
            {publicEvent?.dateConfidence && (
              <View style={styles.confidenceBadgeContainer}>
                <DateConfidenceBadge
                  confidence={publicEvent.dateConfidence}
                  isHijriDerived={publicEvent.isHijriDerived}
                  showLabel={true}
                  size="medium"
                />
              </View>
            )}
          </View>
        )}

        {/* Note Section - uses solid surface color for guaranteed readability */}
        {countdown.note &&
         typeof countdown.note === 'string' &&
         !countdown.note.startsWith('data:') &&
         !countdown.note.startsWith('file:') &&
         countdown.note.length < 5000 && (
          <View style={[styles.noteContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.noteHeader}>
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>
                {t.create.note}
              </Text>
            </View>
            <Text style={[styles.noteText, { color: colors.text }]}>
              {countdown.note}
            </Text>
          </View>
        )}

        {/* Tasks Section - only for personal countdowns */}
        {!isPublicEvent && (
          <TaskList
            tasks={countdown.tasks || []}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      {hasBackgroundImage ? (
        <ImageBackground
          source={{ uri: countdown.backgroundImage }}
          style={styles.container}
          imageStyle={styles.fullScreenImage}
        >
          {/* Dark overlay for text readability */}
          <View style={styles.imageOverlay} />
          {renderContent()}
          <CelebrationAnimation
            active={showConfetti}
            icon={countdown.icon}
            onComplete={handleConfettiComplete}
          />
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={theme.colors.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          {renderContent()}
          <CelebrationAnimation
            active={showConfetti}
            icon={countdown.icon}
            onComplete={handleConfettiComplete}
          />
        </LinearGradient>
      )}

      {/* Share Name Modal */}
      <Modal
        visible={showShareModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowShareModal(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {language === 'ar' ? 'شارك العد التنازلي' : 'Share Countdown'}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {language === 'ar' ? 'اسمك (اختياري)' : 'Your name (optional)'}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: colors.glass, color: colors.text },
              ]}
              placeholder={language === 'ar' ? 'مثال: محمد' : 'e.g., Mohammad'}
              placeholderTextColor={colors.textSecondary}
              value={tempSharerName}
              onChangeText={setTempSharerName}
              textAlign={language === 'ar' ? 'right' : 'left'}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.glass }]}
                onPress={() => setShowShareModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  {t.cancel}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  { backgroundColor: colors.accent },
                ]}
                onPress={handleShareConfirm}
                disabled={isSharing}
              >
                <Ionicons name="share-social" size={18} color={colors.background} />
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  {isSharing
                    ? language === 'ar' ? 'جارٍ...' : 'Sharing...'
                    : t.share.shareButton}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Celebration Share Modal */}
      <Modal
        visible={showCelebrationShare}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCelebrationShare(false)}
      >
        <View style={styles.celebrationModalOverlay}>
          <View style={[styles.celebrationModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.celebrationModalHeader}>
              <Pressable
                style={[styles.celebrationCloseButton, { backgroundColor: colors.glass }]}
                onPress={() => setShowCelebrationShare(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.celebrationCardContainer}>
              {countdown && (
                <CelebrationShareCard
                  ref={celebrationCardRef}
                  title={countdown.title}
                  icon={countdown.icon}
                  theme={countdown.theme}
                  language={language}
                />
              )}
            </View>

            <Text style={[styles.celebrationModalTitle, { color: colors.text }]}>
              {language === 'ar' ? 'شارك اللحظة!' : 'Share the moment!'}
            </Text>

            <Pressable
              style={[
                styles.celebrationShareButton,
                { backgroundColor: colors.accent },
                isSharing && styles.celebrationShareButtonDisabled,
              ]}
              onPress={handleCelebrationShare}
              disabled={isSharing}
            >
              <Ionicons name="share-social" size={22} color={colors.background} />
              <Text style={[styles.celebrationShareButtonText, { color: colors.background }]}>
                {isSharing
                  ? language === 'ar' ? 'جارٍ المشاركة...' : 'Sharing...'
                  : language === 'ar' ? 'شارك كصورة' : 'Share as Image'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.skipButton}
              onPress={() => setShowCelebrationShare(false)}
            >
              <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                {language === 'ar' ? 'لاحقاً' : 'Later'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreenImage: {
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 24,
    paddingBottom: 48,
  },
  iconContainer: {
    marginBottom: 16,
    position: 'relative',
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleLayer: {
    position: 'absolute',
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  iconLayer: {
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
  },
  participantsText: {
    fontSize: 14,
  },
  timerContainer: {
    marginVertical: 32,
    width: '100%',
    alignItems: 'center',
  },
  targetDateContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  targetDateHijri: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  targetDateGregorian: {
    fontSize: 14,
    textAlign: 'center',
  },
  confidenceBadgeContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  celebrationContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noteContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
  },
  // Share Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalButtonPrimary: {},
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Celebration Share Modal Styles
  celebrationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationModalContent: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  celebrationModalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  celebrationCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationCardContainer: {
    marginBottom: 24,
  },
  celebrationModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  celebrationShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  celebrationShareButtonDisabled: {
    opacity: 0.6,
  },
  celebrationShareButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 15,
  },
});
