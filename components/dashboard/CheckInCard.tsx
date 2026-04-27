import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const SHADOW = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  android: { elevation: 2 },
  default: {},
}) as object;

const MONTH_KEYS = [
  'month_jan', 'month_feb', 'month_mar', 'month_apr', 'month_may', 'month_jun',
  'month_jul', 'month_aug', 'month_sep', 'month_oct', 'month_nov', 'month_dec',
];

function formatFecha(iso: string, t: (key: string) => string) {
  const d = new Date(iso);
  return `${d.getDate()} ${t(MONTH_KEYS[d.getMonth()])}`;
}

type Props = {
  foto: { url: string; fecha: string } | null;
  size: number;
  onPress: () => void;
};

export default function CheckInCard({ foto, size, onPress }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size, height: size, borderRadius: 24, overflow: 'hidden',
          justifyContent: 'flex-end', backgroundColor: colors.backgroundPrimary,
          opacity: pressed ? 0.85 : 1,
        },
        SHADOW,
      ]}
    >
      {foto ? (
        <>
          <Image source={{ uri: foto.url }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', padding: 8 }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{formatFecha(foto.fecha, t)}</Text>
          </View>
        </>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <View style={{ width: 46, height: 46, borderRadius: 24, backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>{t('check_in')}</Text>
          <Text style={{ fontSize: 10, color: colors.textSecondary }}>{t('add_photo')}</Text>
        </View>
      )}
    </Pressable>
  );
}
