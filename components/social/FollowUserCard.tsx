import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { globalStyles } from '@/styles/global-styles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

const defaultAvatar = require('../../assets/images/defaultAvatar.png');

interface Props {
  id: number;
  nombre: string;
  nickname: string | null;
  authUuid: string | null;
}

export default function FollowUserCard({ id, nombre, nickname, authUuid }: Props) {
  const { colors } = useTheme();
  const styles = globalStyles(colors);
  const [imgError, setImgError] = useState(false);

  const avatarUrl = useMemo(() => {
    if (!authUuid) return null;
    const { data } = supabase.storage.from('avatars').getPublicUrl(`${authUuid}/avatar.jpg`);
    return data.publicUrl;
  }, [authUuid]);

  const showDefault = imgError || !avatarUrl;

  return (
    <Pressable
      style={[styles.userCardContainer, { borderBottomColor: colors.border }]}
      onPress={() => router.push({ pathname: '/profile/profileDescription', params: { id: id.toString() } })}
    >
      <View style={styles.userCardAvatarContainer}>
        {showDefault ? (
          <Image source={defaultAvatar} style={styles.userCardAvatar} />
        ) : (
          <Image
            source={{ uri: avatarUrl! }}
            onError={() => setImgError(true)}
            style={styles.userCardAvatar}
          />
        )}
      </View>
      <View style={styles.userCardTextContainer}>
        <Text style={[styles.userCardUserName, { color: colors.textPrimary }]}>{nombre}</Text>
        {nickname ? (
          <Text style={[styles.userCardFullName, { color: colors.textSecondary }]}>@{nickname}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward-outline" size={24} color={colors.primary} />
    </Pressable>
  );
}
