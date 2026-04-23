import { Language, useLanguage, useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const LANGUAGE_FLAGS: Record<Language, string> = {
  es: 'ES',
  en: 'EN',
};

const LANGUAGES: Language[] = ['es', 'en'];

export default function LanguageScreen() {
  const { colors } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const languageLabel = (lang: Language) => (lang === 'es' ? t('spanish') : t('english'));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      contentContainerStyle={styles.container}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.backgroundPrimary,
            shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
          },
        ]}
      >
        {LANGUAGES.map((lang, index) => (
          <Pressable
            key={lang}
            onPress={() => setLanguage(lang)}
            style={({ pressed }) => [
              styles.row,
              { opacity: pressed ? 0.5 : 1 },
              index < LANGUAGES.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[styles.badge, { backgroundColor: colors.backgroundTertiary }]}> 
              <Text style={[styles.badgeText, { color: colors.textPrimary }]}>{LANGUAGE_FLAGS[lang]}</Text>
            </View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>{languageLabel(lang)}</Text>
            {language === lang && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 24, paddingBottom: 48 },
  card: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 50,
    gap: 14,
  },
  badge: {
    width: 34,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  label: { flex: 1, fontSize: 16 },
});
