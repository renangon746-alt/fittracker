import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Tabs } from 'expo-router';

export default function TabLayout() {

  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textPrimary,
      tabBarStyle: { backgroundColor: colors.backgroundSecondary },
      headerStyle: { backgroundColor: colors.backgroundPrimary },
      headerTintColor: colors.textPrimary,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="home" color={color} />,
          headerShown: false 
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: t('exercises'),
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="weight-hanging" color={color} />,
          headerShown: false
        }}
      /> 
      <Tabs.Screen
        name="train"
        options={{
          title: t('train'),
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="dumbbell" color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: t('social'),
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="users" color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="cog" color={color} />,
          headerShown: false
        }}
      />   
    </Tabs>
  );
}
