import { useTheme } from "@/context/ThemeContext";
import { globalStyles } from "@/styles/global-styles";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Text, View } from "react-native";

interface StreakBadgeProps {
  count: number;
}

export default function StreakBadge({ count }: StreakBadgeProps) {
  const { colors } = useTheme();
  const styles = globalStyles(colors);
  return (
    <View style={styles.StreakContainer}>
      <FontAwesome5 name="fire-alt" solid size={48} color={colors.primary} />
      <Text style={styles.StreakNumber}>{count}</Text>
    </View>
  );
}

