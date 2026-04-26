import { useTheme } from '@/context/ThemeContext';
import { Text, View } from 'react-native';

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function WeekSelector({ fechasEntrenadas }: { fechasEntrenadas: string[] }) {
  const { colors } = useTheme();
  const today = new Date();

  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      {days.map((d, i) => {
        const isToday    = d.toDateString() === today.toDateString();
        const dateStr    = toDateStr(d);
        const hasWorkout = fechasEntrenadas.includes(dateStr);
        const isFuture   = d > today && !isToday;

        return (
          <View key={i} style={{ alignItems: 'center', gap: 6 }}>
            <Text style={{
              fontSize: 11,
              fontWeight: isToday ? '700' : '400',
              color: isToday ? colors.textPrimary : colors.textSecondary,
            }}>
              {DIAS_SEMANA[i]}
            </Text>
            <View style={[
              { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
              isToday && { backgroundColor: colors.textPrimary },
              !isToday && hasWorkout && { borderColor: colors.primary, borderWidth: 2 },
              !isToday && !hasWorkout && !isFuture && { borderColor: colors.border, borderWidth: 1 },
              isFuture && { borderColor: colors.border, borderWidth: 1, opacity: 0.4 },
            ]}>
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: isToday
                  ? (colors.backgroundSecondary ?? '#000')
                  : hasWorkout ? colors.primary
                  : colors.textSecondary,
              }}>
                {d.getDate()}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
