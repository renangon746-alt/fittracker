import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

function StreakBadge() {
  const { colors } = useTheme();
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('usuario')
        .select('racha_actual')
        .eq('email', user.email)
        .single();
      if (data) setStreak(data.racha_actual ?? 0);
    }
    load();
  }, []);

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundPrimary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
      elevation: 4,
    }}>
      <Text style={{ fontSize: 12 }}>🔥</Text>
      <Text style={{
        color: colors.textPrimary,
        fontWeight: '700',
        fontSize: 13,
        marginLeft: 4
      }}>
        {streak}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textPrimary,
      tabBarStyle: { backgroundColor: colors.backgroundSecondary },

      headerStyle: {
        backgroundColor: colors.backgroundSecondary,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerShadowVisible: false,
      headerTintColor: colors.textPrimary,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: '600',
          },
          headerTitleAlign: 'left',
          headerTitleContainerStyle: {
            paddingLeft: 16,
          },
          headerRightContainerStyle: {
            paddingRight: 24,
          },
          headerRight: () => <StreakBadge />,

          tabBarIcon: ({ color }) => (
            <FontAwesome5 size={28} name="home" color={color} />
          ),
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