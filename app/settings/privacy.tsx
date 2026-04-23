import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

export default function Privacy() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [publicProfile, setPublicProfile] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
  async function fetchPreference() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Sin auth todavía — ponemos valor por defecto y salimos
      setPublicProfile(false);
      return;
    }

    const { data, error } = await supabase
      .from('usuario')
      .select('perfil_publico')
      .eq('email', user.email)
      .single();

    if (error) {
      Alert.alert(t('error'), t('could_not_load_settings'));
      setPublicProfile(false);
      return;
    }

    setPublicProfile(data.perfil_publico);
  }

  fetchPreference();
}, [t]);

  // ── Guardar cambio en Supabase ────────────────────────────────────────────
  async function handleToggle(value: boolean) {
    setPublicProfile(value);
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('usuario')
      .update({ perfil_publico: value })
      .eq('email', user.email);

    if (error) {
      setPublicProfile(!value);
      Alert.alert(t('error'), t('could_not_save_change_retry'));
    }

    setSaving(false);
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (publicProfile === null) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      contentContainerStyle={styles.container}
    >
      {/* ── Card ── */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.backgroundPrimary,
            shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}> 
              {t('public_account')}
            </Text>
          </View>

          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Switch
              value={publicProfile}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          )}
        </View>
      </View>

      {/* ── Descripción dinámica ── */}
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {publicProfile
          ? t('public_account_description')
          : t('private_account_description')}
      </Text>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingVertical: 24,
    paddingBottom: 48,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowLabel: {
    fontSize: 16,
  },
  description: {
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: 10,
    lineHeight: 18,
  },
});
