import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function SettingsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // ── Eliminar outline en web al seleccionar inputs, si deja de ser web la app se puede eliminar esto sin problema ──
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `* { outline: none !important; }`;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundPrimary },
        headerTintColor: colors.textPrimary,
        headerBackTitle: t('settings'),
        contentStyle: { backgroundColor: colors.backgroundSecondary },
      }}
    >
      <Stack.Screen name="notifications" options={{ title: t('notifications') }} />
      <Stack.Screen name="privacy"       options={{ title: t('privacy') }} />
      <Stack.Screen name="editProfile"   options={{ title: t('edit_profile') }} />
      <Stack.Screen name="editAccount"   options={{ title: t('edit_account') }} />
      <Stack.Screen name="about"         options={{ title: t('about_us') }} />
      <Stack.Screen name="language"      options={{ title: t('language') }} />
    </Stack>
  );
}
