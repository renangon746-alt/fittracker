import { useActiveRoutine } from "@/app/_layout";
import { useTheme } from "@/context/ThemeContext";
import { globalStyles } from "@/styles/global-styles";
import { trainStyles } from "@/styles/train-styles";
import { Pressable, Text, View } from "react-native";

interface RoutineCardProps {
    id: string;
    title: string;
    lastTrained?: string | null;
}

function formatLastTrained(iso: string | null | undefined): string {
    if (!iso) return 'Never trained';
    const date = new Date(iso);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = date.getDate();
    const suffix =
        day === 1 || day === 21 || day === 31 ? 'st' :
        day === 2 || day === 22 ? 'nd' :
        day === 3 || day === 23 ? 'rd' : 'th';
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${weekday} ${day}${suffix} ${month} ${year}`;
}

export default function RoutineCard({ id, title, lastTrained }: RoutineCardProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
    const { navigateToRoutine } = useActiveRoutine();

    return (
        <View style={train_styles.rc_container}>
            <View style={train_styles.rc_dayEdit}>
                <Text style={{ ...global_styles.secondaryText, color: colors.routineCard.day }}>
                    {formatLastTrained(lastTrained)}
                </Text>
                <Text style={{ ...global_styles.principalText, color: colors.routineCard.day }}>...</Text>
            </View>

            <View style={train_styles.rc_routineTitle}>
                <Text style={{ ...global_styles.principalText, color: colors.routineCard.title }}>{title}</Text>
            </View>

            <View style={train_styles.rc_startButtonContainer}>
                <Pressable
                    style={[global_styles.principalButton, train_styles.rc_startButtonPressable]}
                    onPress={() => navigateToRoutine(id, title)}
                >
                    <Text style={global_styles.principalText}>Start routine</Text>
                </Pressable>
            </View>
        </View>
    );
}
