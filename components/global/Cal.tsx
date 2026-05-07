import { calendarTheme } from '@/app/utils/calendarTheme';
import { useTheme } from '@/context/ThemeContext';
import { globalStyles } from '@/styles/global-styles';
import { useState } from 'react';
import { Dimensions, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface CalProps {
    fechasEntrenadas?: string[];
}

export default function Cal({ fechasEntrenadas = [] }: CalProps) {
    const screenWidth = Dimensions.get('window').width;
    const [selectedDate, setSelectedDate] = useState('');
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);

    const workoutDays = fechasEntrenadas.reduce<Record<string, { marked: boolean; dotColor: string }>>((acc, date) => {
        acc[date] = { marked: true, dotColor: colors.calendar.dot };
        return acc;
    }, {});

    return (
        <View style={global_styles.calendarContainer}>
            <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{
                    ...workoutDays,
                    [selectedDate]: {
                        selected: true,
                        selectedColor: colors.calendar.selectedDay,
                        marked: !!workoutDays[selectedDate]?.marked,
                    }
                }}
                theme={calendarTheme(colors)}
                style={[global_styles.calendarRadius, { width: screenWidth - 60 }]}
            />
        </View>
    );
}
