import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();
  const { signIn, signUp, resetPassword } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(t.auth.invalidEmail);
      return false;
    }
    if (password.length < 6) {
      setError(t.auth.weakPassword);
      return false;
    }
    return true;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsLoading(true);
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const result = isSignUp
      ? await signUp(trimmedEmail, password)
      : await signIn(trimmedEmail, password);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (isSignUp) {
      Alert.alert(t.auth.checkEmail, t.auth.confirmEmailSent, [
        { text: t.ok, onPress: () => router.back() },
      ]);
    } else {
      // Sign in success — go back, sync starts automatically
      router.back();
    }
  }, [email, password, isSignUp, signIn, signUp, t]);

  const handleForgotPassword = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Alert.alert(t.auth.invalidEmail);
      return;
    }
    const result = await resetPassword(trimmedEmail);
    if (result.error) {
      Alert.alert(t.auth.signInError, result.error);
    } else {
      Alert.alert(t.auth.resetPasswordSent);
    }
  }, [email, resetPassword, t]);

  const styles = makeStyles(colors, isRTL);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={colors.textSecondary} />
          </Pressable>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <Ionicons name="cloud-outline" size={56} color={colors.accent} />
            <Text style={styles.title}>{t.auth.signInToSync}</Text>
            <Text style={styles.subtitle}>{t.auth.signInDesc}</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
            {/* Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{t.auth.email}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.auth.emailPlaceholder}
                placeholderTextColor={colors.textSecondary + '80'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{t.auth.password}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.auth.passwordPlaceholder}
                placeholderTextColor={colors.textSecondary + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            {/* Error */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Submit button */}
            <Pressable
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isSignUp ? t.auth.signUp : t.auth.signIn}
                </Text>
              )}
            </Pressable>

            {/* Forgot password (sign in mode only) */}
            {!isSignUp && (
              <Pressable onPress={handleForgotPassword} style={styles.linkButton}>
                <Text style={styles.linkText}>{t.auth.forgotPassword}</Text>
              </Pressable>
            )}

            {/* Toggle sign in / sign up */}
            <Pressable
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>
                {isSignUp ? t.auth.haveAccount : t.auth.noAccount}
              </Text>
            </Pressable>

            {/* Continue without account */}
            <Pressable onPress={() => router.back()} style={styles.skipButton}>
              <Text style={styles.skipText}>{t.auth.orContinueWithout}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any, isRTL: boolean) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    closeButton: {
      alignSelf: isRTL ? 'flex-end' : 'flex-start',
      padding: 8,
      marginTop: 8,
    },
    header: {
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 32,
      gap: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    form: {
      gap: 16,
    },
    inputWrapper: {
      gap: 6,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    errorText: {
      color: '#EF4444',
      fontSize: 14,
      textAlign: 'center',
    },
    submitButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '700',
    },
    linkButton: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    linkText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '600',
    },
    skipButton: {
      alignItems: 'center',
      paddingVertical: 12,
      marginTop: 8,
    },
    skipText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
  });
