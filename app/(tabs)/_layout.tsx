import { typography } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function doNavigate(
  routeName: string,
  routeKey: string,
  state: BottomTabBarProps['state'],
  navigation: BottomTabBarProps['navigation'],
) {
  const isFocused = state.routes[state.index].name === routeName;
  const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
  if (!isFocused && !event.defaultPrevented) navigation.navigate(routeName);
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const STANDARD_TABS = [
    { name: 'index',     label: t('home'),      icon: 'home-outline' as const },
    { name: 'exercises', label: t('exercises'), icon: 'barbell-outline' as const },
    { name: 'social',    label: t('social'),    icon: 'people-outline' as const },
    { name: 'settings',  label: t('settings'),  icon: 'settings-outline' as const },
  ];

  const trainRoute = state.routes.find(r => r.name === 'train');

  const leftTabs  = STANDARD_TABS.slice(0, 2);
  const rightTabs = STANDARD_TABS.slice(2);

  function renderTab(tab: typeof STANDARD_TABS[0]) {
    const route = state.routes.find(r => r.name === tab.name);
    if (!route) return null;
    const isFocused = state.routes[state.index].name === tab.name;
    const color    = isFocused ? colors.primary : colors.iconInactive;

    return (
      <Pressable
        key={route.key}
        onPress={() => doNavigate(tab.name, route.key, state, navigation)}
        style={({ pressed }) => ({
          flex: 1,
          alignItems: 'center',
          gap: 3,
          paddingTop: 5,
          paddingBottom: 4,
          opacity: pressed ? 0.55 : 1,
        })}
      >
        <Ionicons name={tab.icon} size={26} color={color} />
        <Text style={[typography.caption2Bold, { color }]}>{tab.label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={{
      backgroundColor: colors.backgroundPrimary,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingBottom: insets.bottom,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        {leftTabs.map(renderTab)}

        {/* "+" train — overflows above the bar via translateY, layout stays compact */}
        <View style={{ width: 68, overflow: 'visible', alignItems: 'center', justifyContent: 'flex-end' }}>
          {trainRoute && (
            <Pressable
              onPress={() => doNavigate('train', trainRoute.key, state, navigation)}
              style={({ pressed }) => ({
                width: 50,
                height: 50,
                borderRadius: 32,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.75 : 1,
                transform: pressed
                  ? [{ translateY: -10 }, { scale: 0.93 }]
                  : [{ translateY: -10 }],
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
              })}
            >
              <Ionicons name="add" size={26} color="#fff" />
            </Pressable>
          )}
        </View>

        {rightTabs.map(renderTab)}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.backgroundSecondary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerShadowVisible: false,
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { ...typography.headline, color: colors.textPrimary },
      }}
    >
      <Tabs.Screen name="index"     options={{ headerShown: false }} />
      <Tabs.Screen name="exercises" options={{ title: t('exercises') }} />
      <Tabs.Screen name="train"     options={{ title: t('train') }} />
      <Tabs.Screen name="social"    options={{ title: t('social') }} />
      <Tabs.Screen name="settings"  options={{ title: t('settings') }} />
    </Tabs>
  );
}
