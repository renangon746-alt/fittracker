import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const SHADOW = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  android: { elevation: 2 },
  default: {},
}) as object;

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatFecha(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

type Props = {
  foto: { url: string; fecha: string } | null;
  size: number;
  onPress: () => void;
};

export default function CheckInCard({ foto, size, onPress }: Props) {
  const { colors } = useTheme();

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
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{formatFecha(foto.fecha)}</Text>
          </View>
        </>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <View style={{ width: 46, height: 46, borderRadius: 24, backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>Check In</Text>
          <Text style={{ fontSize: 10, color: colors.textSecondary }}>Añadir foto</Text>
        </View>
      )}
    </Pressable>
  );
}
