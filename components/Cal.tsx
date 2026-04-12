import { calendarTheme } from '@/app/utils/calendarTheme';
import { useTheme } from '@/context/ThemeContext';
import { globalStyles } from '@/styles/global-styles';
import { useState } from 'react';
import { Dimensions, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function Cal() {
  const screenWidth = Dimensions.get('window').width;
  const [selectedDate, setSelectedDate] = useState('');
  const { colors } = useTheme();
  const styles = globalStyles(colors);

  // Workout days 
  const workoutDays = {
    '2026-04-05': { marked: true, dotColor: colors.calendar.dot },
    '2026-04-07': { marked: true, dotColor: colors.calendar.dot },
    '2026-04-09': { marked: true, dotColor: colors.calendar.dot },
  };

  return (
    <View style={styles.calendarContainer}>
      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          ...workoutDays,
          [selectedDate]: {
            selected: true,
            selectedColor: colors.calendar.selectedDay,
            marked: workoutDays[selectedDate]?.marked
          }
        }}
        theme={calendarTheme(colors)}
        style={[styles.calendarRadius, { width: screenWidth - 60 }]}
      />
    </View>
  );
}