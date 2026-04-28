import FollowUserCard from '@/components/social/FollowUserCard';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { fetchFollowing, FollowUser } from '@/hooks/social/useFollowers';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FollowingScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const targetId = Number(id);

  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || Number.isNaN(targetId)) { setLoading(false); return; }
    fetchFollowing(targetId).then(list => {
      setUsers(list);
      setLoading(false);
    });
  }, [id, targetId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 6 }}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={({ pressed }) => ({ padding: 8, opacity: pressed ? 0.5 : 1 })}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>{t('following')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : users.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary, fontSize: 14 }}>
          {t('not_following_anyone')}
        </Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
          {users.map(u => (
            <FollowUserCard
              key={u.id}
              id={u.id}
              nombre={u.nombre}
              nickname={u.nickname}
              authUuid={u.auth_uuid}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
