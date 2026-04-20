import { useTheme } from "@/context/ThemeContext";
import { globalStyles } from "@/styles/global-styles";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Text, View } from "react-native";

interface StreakBadgeProps {
  count: number;
}

export default function StreakBadge({ count }: StreakBadgeProps) {
  const { colors } = useTheme();
  const global_styles = globalStyles(colors);
  return (
    <View style={global_styles.streakContainer}>
      <FontAwesome5 name="fire-alt" solid size={48} color={colors.primary} />
      <Text style={global_styles.streakNumber}>{count}</Text>
    </View>
  );
}

