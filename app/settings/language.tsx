import { Language, useLanguage, useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { globalStyles } from '@/styles/global-styles';
import { Ionicons } from '@expo/vector-icons';
import {
  Platform,
  Pressable,
  ScrollView,
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
  const styles = globalStyles(colors);

  const languageLabel = (lang: Language) => (lang === 'es' ? t('spanish') : t('english'));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      contentContainerStyle={styles.languageContainer}
    >
      <View
        style={[
          styles.languageCard,
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
              styles.languageRow,
              { opacity: pressed ? 0.5 : 1 },
              index < LANGUAGES.length - 1 && {
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[styles.languageBadge, { backgroundColor: colors.backgroundTertiary }]}> 
              <Text style={[styles.languageBadgeText, { color: colors.textPrimary }]}>{LANGUAGE_FLAGS[lang]}</Text>
            </View>
            <Text style={[styles.languageLabel, { color: colors.textPrimary }]}>{languageLabel(lang)}</Text>
            {language === lang && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
