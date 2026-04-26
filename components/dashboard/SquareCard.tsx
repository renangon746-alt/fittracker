import { useTheme } from '@/context/ThemeContext';
import { Platform, Text, View } from 'react-native';

const SHADOW = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  android: { elevation: 2 },
  default: {},
}) as object;

type Props = {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  size: number;
  isStreak?: boolean;
};

export default function SquareCard({ label, value, sub, accent, size, isStreak }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[
      { width: size, height: size, borderRadius: 24, padding: 16, justifyContent: 'flex-end', backgroundColor: colors.backgroundPrimary },
      SHADOW,
    ]}>
      {isStreak && <Text style={{ fontSize: 24, marginBottom: 4 }}>🔥</Text>}
      <Text
        style={{ fontSize: 20, fontWeight: '700', color: accent ?? colors.textPrimary }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={{ fontSize: 11, fontWeight: '500', marginTop: 2, color: colors.textSecondary }}>
        {label}
      </Text>
      {sub ? (
        <Text style={{ fontSize: 10, marginTop: 1, color: colors.textSecondary }} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}
