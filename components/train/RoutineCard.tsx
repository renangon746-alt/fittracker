import { useTheme } from "@/context/ThemeContext";
import { globalStyles } from "@/styles/global-styles";
import { trainStyles } from "@/styles/train-styles";
import { Pressable, Text, View } from "react-native";

interface RoutineCardProps {
    id: string;
    title: string;
    day: string;
}

export default function RoutineCard({ id, title, day }: RoutineCardProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
 
    return (
        <View style={train_styles.rc_container}>
            
            {/*Day of the routine and edit button*/}
            <View style={train_styles.rc_dayEdit}>
                <Text style={{ ...global_styles.secondaryText, color: colors.routineCard.day }}>{day}</Text>
                <Text style={{ ...global_styles.principalText, color: colors.routineCard.day }}>...</Text>
            </View>

            {/* Title of the routine */}
            <View style={train_styles.rc_routineTitle}>
                <Text style={{ ...global_styles.principalText, color: colors.routineCard.title }}>{title}</Text>
            </View>

            {/* Start Button */}
            <View style={train_styles.rc_startButtonContainer}>
                <Pressable style={[global_styles.principalButton, train_styles.rc_startButtonPressable]}>
                    <Text style={global_styles.principalText}>Start routine</Text>
                </Pressable>   
            </View>
        </View>
    );
}
       

