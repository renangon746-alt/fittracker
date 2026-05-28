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
  /**
   * Optional pre-fetched auth_uuid. If the parent already has it,
   * pass it down to skip the lookup query in this card.
   */
  authUuid?: string | null;
}

export default function UserCard({ id, userName, fullName, authUuid }: UserCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = globalStyles(colors);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAvatar(uuid: string) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(`${uuid}/avatar.jpg`);
      if (!cancelled) {
        setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
        setLoading(false);
      }
    }

    async function resolve() {
      // Fast path: parent already gave us the auth_uuid
      if (authUuid) {
        await loadAvatar(authUuid);
        return;
      }

      // Slow path: look it up via the usuario row (no admin endpoints)
      try {
        const { data, error } = await supabase
          .from('usuario')
          .select('auth_uuid')
          .eq('id_usuario', id)
          .single();

        if (cancelled) return;

        if (error || !data?.auth_uuid) {
          setLoading(false);
          return;
        }

        await loadAvatar(data.auth_uuid);
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [id, authUuid]);

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
        <Text style={[styles.userCardUserName, { color: colors.textPrimary }]}>{userName}</Text>
        <Text style={[styles.userCardFullName, { color: colors.textSecondary }]}>@{fullName}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={24} color={colors.primary} />
    </Pressable>
  );
}
