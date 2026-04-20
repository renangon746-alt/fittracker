import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const defaultAvatar = require('../../assets/images/defaultAvatar.png');

interface UserCardProps {
  id: number;
  userName: string;
  fullName: string;
  email: string;
}

export default function UserCard({ id, userName, fullName, email }: UserCardProps) {
  const { colors } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAvatar() {
      try {
        if (!email) {
          setLoading(false);
          return;
        }

        // Get all auth users and find by email
        const { data: { users: authUsers }, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
          console.error('Error fetching auth users:', error);
          setLoading(false);
          return;
        }

        // Find user with matching email
        const authUser = authUsers?.find(u => u.email === email);
        
        if (authUser) {
          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(`${authUser.id}/avatar.jpg`);
          
          setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
        }
      } catch (error) {
        console.error('Error in fetchAvatar:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAvatar();
  }, [email]);

  return (
    <Pressable
      style={[styles.container, { borderBottomColor: colors.border }]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`User ${userName}`}
      accessibilityHint="Opens user profile"
      onPress={() => router.push({ pathname: '/profile/profileDescription', params: { id: id.toString() } })}
    >
      <View style={styles.avatarContainer}>
        {loading ? (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name="person" size={32} color="#4A4A4A" />
          </View>
        ) : avatarUrl && !imgError ? (
          <Image
            source={{ uri: avatarUrl }}
            onError={() => setImgError(true)}
            style={styles.avatar}
          />
        ) : (
          <Image
            source={defaultAvatar}
            style={styles.avatar}
          />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.userName, { color: colors.textPrimary }]}>@{fullName}</Text>
        <Text style={[styles.fullName, { color: colors.textSecondary }]}>{userName}</Text>
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
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
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