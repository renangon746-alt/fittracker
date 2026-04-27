import { typography } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { Platform, Text, View } from 'react-native';

const SHADOW = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 6 },
  android: { elevation: 3 },
  default: {},
}) as object;

export default function StreakBadge({ racha }: { racha: number }) {
  const { colors } = useTheme();

  return (
    <View style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: colors.backgroundPrimary,
      },
      SHADOW,
    ]}>
      <Text style={{ fontSize: 13 }}>🔥</Text>
      <Text style={[typography.subheadBold, { color: colors.textPrimary }]}>
        {racha}
      </Text>
    </View>
  );
}
