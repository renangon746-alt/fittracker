import { useTheme } from '@/context/ThemeContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Tabs } from 'expo-router';

export default function TabLayout() {

  const { colors } = useTheme();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.iconInactive,
      tabBarStyle: { backgroundColor: colors.backgroundSecondary },
      headerStyle: { backgroundColor: colors.backgroundPrimary },
      headerTintColor: colors.textPrimary,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'exercises',
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="weight-hanging" color={color} />,
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          title: 'train',
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="dumbbell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'social',
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="cog" color={color} />,
        }}
      />   
    </Tabs>
  );
}
