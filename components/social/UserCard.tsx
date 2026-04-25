import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { globalStyles } from "@/styles/global-styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

const defaultAvatar = require('../../assets/images/defaultAvatar.png');

interface UserCardProps {
  id: number;
  userName: string;
  fullName: string;
  email: string;
}

export default function UserCard({ id, userName, fullName, email }: UserCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = globalStyles(colors);
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
      style={[styles.userCardContainer, { borderBottomColor: colors.border }]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`User ${userName}`}
      accessibilityHint={t('opens_user_profile')}
      onPress={() => router.push({ pathname: '/profile/profileDescription', params: { id: id.toString() } })}
    >
      <View style={styles.userCardAvatarContainer}>
        {loading ? (
          <View style={[styles.userCardAvatarPlaceholder, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name="person" size={32} color="#4A4A4A" />
          </View>
        ) : avatarUrl && !imgError ? (
          <Image
            source={{ uri: avatarUrl }}
            onError={() => setImgError(true)}
            style={styles.userCardAvatar}
          />
        ) : (
          <Image
            source={defaultAvatar}
            style={styles.userCardAvatar}
          />
        )}
      </View>
      <View style={styles.userCardTextContainer}>
        <Text style={[styles.userCardUserName, { color: colors.textPrimary }]}>@{fullName}</Text>
        <Text style={[styles.userCardFullName, { color: colors.textSecondary }]}>{userName}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={24} color={colors.primary} />
    </Pressable>
  );
}
