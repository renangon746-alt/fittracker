import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function SettingsLayout() {
  const { colors } = useTheme();

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
        headerBackTitle: 'Ajustes',
        contentStyle: { backgroundColor: colors.backgroundSecondary },
      }}
    >
      <Stack.Screen name="notifications" options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="privacy"       options={{ title: 'Privacidad' }} />
      <Stack.Screen name="editProfile"   options={{ title: 'Editar perfil' }} />
      <Stack.Screen name="editAccount"   options={{ title: 'Editar cuenta' }} />
      <Stack.Screen name="about"         options={{ title: 'Acerca de nosotros' }} />
    </Stack>
  );
}