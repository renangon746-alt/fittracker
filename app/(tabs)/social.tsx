import UserList from '@/components/UserList';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface DbUser {
  id_usuario: number;
  nombre: string;
  nickname?: string | null;
  email?: string | null;
}

interface SocialUser {
  id: number;
  userName: string;
  fullName: string;
  email: string;
}

export default function Social() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { colors } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);

        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          setErrorMsg(`${t('error_getting_session')}: ${authError.message}`);
          return;
        }

        const loggedEmail = authData.user?.email;
        let loggedUserId: number | null = null;

        if (loggedEmail) {
          const { data: ownProfile, error: ownProfileError } = await supabase
            .from('usuario')
            .select('id_usuario')
            .eq('email', loggedEmail)
            .single();

          if (!ownProfileError && ownProfile) {
            loggedUserId = ownProfile.id_usuario;
          }
        }

        const { data, error } = await supabase
          .from('usuario')
          .select('id_usuario, nombre, nickname, email')
          .order('nombre', { ascending: true });

        if (error) {
          setErrorMsg(`${t('error_loading_users')}: ${error.message}`);
          return;
        }

        const mappedUsers: SocialUser[] = ((data as DbUser[] | null) ?? [])
          .filter((user) => user.id_usuario !== loggedUserId)
          .map((user) => ({
            id: user.id_usuario,
            userName: (user.nickname && user.nickname.trim().length > 0)
              ? user.nickname
              : `user${user.id_usuario}`,
            fullName: user.nombre,
            email: user.email || '',
          }));

        setUsers(mappedUsers);
      } catch (error) {
        setErrorMsg(`${t('unexpected_error')}: ${String(error)}`);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [t]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter(
      (user) =>
        user.userName.toLowerCase().includes(normalizedQuery) ||
        user.fullName.toLowerCase().includes(normalizedQuery)
    );
  }, [query, users]);

  return (
    <ScrollView style={{ backgroundColor: colors.backgroundPrimary }}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.backgroundTertiary,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder={t('search_users_placeholder')}
          placeholderTextColor={colors.textSecondary}
          onChangeText={setQuery}
          value={query}
          accessibilityLabel={t('search_users_placeholder')}
          accessibilityHint={t('search')}
        />
        <Ionicons
          style={styles.icon}
          name="search"
          size={20}
          color={colors.iconInactive}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : errorMsg ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{errorMsg}</Text>
      ) : filteredUsers.length > 0 ? (
        <UserList users={filteredUsers} />
      ) : (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('no_users_found')}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    borderRadius: 30,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 44,
    borderWidth: 1,
  },
  icon: {
    position: 'absolute',
    right: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 8,
  },
  loader: {
    marginTop: 24,
  },
});
