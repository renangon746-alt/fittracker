import { useTheme } from '@/context/ThemeContext';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

const DAYS   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const WEEKS  = 13;
const CENTER = 6;

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMonday(ref: Date): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

export default function WeekSelector({ fechasEntrenadas }: { fechasEntrenadas: string[] }) {
  const { colors }   = useTheme();
  const { width }    = useWindowDimensions();
  const today        = new Date();
  const todayStr     = toDateStr(today);
  const [selected, setSelected] = useState(todayStr);
  const scrollRef    = useRef<ScrollView>(null);
  const monday       = getMonday(today);

  const weeks = Array.from({ length: WEEKS }, (_, wi) => {
    const offset = (wi - CENTER) * 7;
    return Array.from({ length: 7 }, (_, di) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + offset + di);
      return d;
    });
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: CENTER * width, animated: false });
  }, [width]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
    >
      {weeks.map((days, wi) => (
        <View
          key={wi}
          style={{ width, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 }}
        >
          {days.map((d, di) => {
            const dateStr     = toDateStr(d);
            const isToday     = dateStr === todayStr;
            const isSelected  = dateStr === selected;
            const hasActivity = fechasEntrenadas.includes(dateStr);
            const isFuture    = d > today && !isToday;

            return (
              <Pressable
                key={di}
                onPress={() => setSelected(dateStr)}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 8,
                  borderRadius: 14,
                  backgroundColor: isSelected ? colors.backgroundPrimary : isToday ? colors.backgroundTertiary : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                  transform: pressed ? [{ scale: 0.9 }] : [{ scale: 1 }],
                })}
              >
                <Text style={{
                  fontSize: 11,
                  fontWeight: '500',
                  letterSpacing: 0.2,
                  color: colors.textPrimary
                }}>
                  {DAYS[di]}
                </Text>

                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: hasActivity ? colors.primary : colors.textDisabled,
                }}>
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: colors.textPrimary
                  }}>
                    {d.getDate()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
