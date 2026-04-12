import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface UserCardProps {
  id: number;
  image: number;
  userName: string;
  fullName: string;
  favoriteMuscle: string;
}

export default function UserCard({ id, image, userName, fullName, favoriteMuscle }: UserCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.container, { borderBottomColor: colors.border }]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`User ${userName}`}
      accessibilityHint="Opens user profile"
      onPress={() => router.push({ pathname: '/profile/profileDescription', params: { id: id.toString() } })}
    >
      <View style={[styles.avatarContainer, { backgroundColor: colors.backgroundTertiary }]}>
        <Ionicons name="person" size={32} color="#4A4A4A" />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.userName, { color: colors.textPrimary }]}>@{userName}</Text>
        <Text style={[styles.fullName, { color: colors.textSecondary }]}>{fullName}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={24} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    gap: 16,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  fullName: {
    marginTop: 4,
    fontSize: 14,
  },
});
