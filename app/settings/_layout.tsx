import { typography } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable } from 'react-native';

export default function SettingsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `* { outline: none !important; }`;
      document.head.appendChild(style);
    }
  }, []);

  const headerLeft = () => (
    <Pressable
      onPress={() => router.back()}
      hitSlop={12}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, marginLeft: Platform.OS === 'android' ? 4 : 0 })}
    >
      <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
    </Pressable>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundPrimary },
        headerTintColor: colors.textPrimary,
        headerBackTitle: t('settings'),
        contentStyle: { backgroundColor: colors.backgroundSecondary },
        headerTitleStyle: { ...typography.headline, color: colors.textPrimary },
        headerShadowVisible: false,
        headerLeft,
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
