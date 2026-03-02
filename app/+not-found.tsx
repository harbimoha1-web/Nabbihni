import { Link } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🔍</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'}
        </Text>
        <Link href="/" asChild>
          <Pressable style={[styles.button, { backgroundColor: colors.accent }]}>
            <Text style={[styles.buttonText, { color: colors.background }]}>
              {language === 'ar' ? 'العودة للرئيسية' : 'Go home'}
            </Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  emoji: { fontSize: 64 },
  title: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  button: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24 },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
