/*

PARA HACER POR ALEX

import { Language, useLanguage } from '@/context/LanguageContext';
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
const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function LanguageScreen() {
  const { colors } = useTheme();
  const { language, setLanguage } = useLanguage();

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
            key={lang.code}
            onPress={() => setLanguage(lang.code)}
            style={({ pressed }) => [
              styles.row,
              { opacity: pressed ? 0.5 : 1 },
              index < LANGUAGES.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              {lang.label}
            </Text>
            {language === lang.code && (
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
  flag: { fontSize: 24 },
  label: { flex: 1, fontSize: 16 },
});*/