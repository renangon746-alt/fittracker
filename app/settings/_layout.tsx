import { typography } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable } from 'react-native';

export default function SettingsLayout() {
  const { colors } = useTheme();
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
        headerTitleStyle: { ...typography.headline, color: colors.textPrimary },
        headerShadowVisible: false,
        headerLeft,
      }}
    >
      <Stack.Screen name="notifications" options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="privacy"       options={{ title: 'Privacidad' }} />
      <Stack.Screen name="editProfile"   options={{ title: 'Editar perfil' }} />
      <Stack.Screen name="editAccount"   options={{ title: 'Editar cuenta' }} />
      <Stack.Screen name="about"         options={{ title: 'Acerca de nosotros' }} />
      <Stack.Screen name="language"      options={{ title: 'Idioma' }} />
    </Stack>
  );
}
