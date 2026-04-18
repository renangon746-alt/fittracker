import { useTheme } from "@/context/ThemeContext";
import { globalStyles } from "@/styles/global-styles";
import { Pressable, Text, View } from "react-native";

interface RoutineCardProps {
    id: string;
    title: string;
    day: string;
}

export default function RoutineCard({ id, title, day }: RoutineCardProps) {
    const { colors } = useTheme();
    const styles = globalStyles(colors);

    return (
        <View style={{ width: '90%', height: 140, backgroundColor: colors.routineCard.background, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: colors.routineCard.border }}>
            
            {/*Day of the routine and edit button*/}
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                <Text style={{ ...styles.secondaryText, color: colors.routineCard.day }}>{day}</Text>
                <Text style={{ ...styles.principalText, color: colors.routineCard.day }}>...</Text>
            </View>

            {/* Title of the routine */}
            <View style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, marginTop: 10}}>
                <Text style={{ ...styles.principalText, color: colors.routineCard.title }}>{title}</Text>
            </View>

            <View style={{ alignItems: 'center', gap: 20, paddingHorizontal: 10, marginTop: 20}}>
                <Pressable style={[styles.principalButton, { width: '90%', height: 40}]}>
                <Text style={styles.principalText}>Start routine</Text>
                </Pressable>   
            </View>
        </View>
    );
}
       

