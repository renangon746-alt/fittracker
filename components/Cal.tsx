import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function Cal() {
  const screenWidth = Dimensions.get('window').width;
  const [selectedDate, setSelectedDate] = useState('');

  // Workout days 
  const workoutDays = {
    '2026-04-05': { marked: true, dotColor: '#8B5CF6' },
    '2026-04-07': { marked: true, dotColor: '#8B5CF6' },
    '2026-04-09': { marked: true, dotColor: '#8B5CF6' },
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          ...workoutDays,
          [selectedDate]: {
            selected: true,
            selectedColor: '#8B5CF6',
            marked: workoutDays[selectedDate]?.marked
          }
        }}
        theme={{
          backgroundColor: '#1E2923',
          calendarBackground: '#1E2923',
          textSectionTitleColor: '#FFFFFF',
          selectedDayBackgroundColor: '#8B5CF6',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#8B5CF6',
          dayTextColor: '#FFFFFF',
          textDisabledColor: '#4A5568',
          dotColor: '#8B5CF6',
          selectedDotColor: '#FFFFFF',
          arrowColor: '#8B5CF6',
          monthTextColor: '#FFFFFF',
          indicatorColor: '#8B5CF6',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 13,        // Tamaño moderado
          textMonthFontSize: 16,      // Tamaño moderado
          textDayHeaderFontSize: 12   // Tamaño moderado
        }}
        style={[styles.calendar, { 
          width: screenWidth - 60  // Sin height fijo
        }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#08130D',
    borderRadius: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  calendar: {
    borderRadius: 16,
  }
});