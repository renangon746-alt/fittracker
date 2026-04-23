import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { globalStyles } from '@/styles/global-styles';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';

export default function Privacy() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = globalStyles(colors);

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
      <View style={[styles.settingsCentered, { backgroundColor: colors.backgroundSecondary }]}> 
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      contentContainerStyle={styles.settingsContainer}
    >
      {/* ── Card ── */}
      <View
        style={[
          styles.settingsCard,
          {
            backgroundColor: colors.backgroundPrimary,
            shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
          },
        ]}
      >
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowLeft}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={[styles.settingsRowLabel, { color: colors.textPrimary }]}> 
              {t('public_account')}
            </Text>
          </View>

          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Switch
              value={publicProfile ?? false}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          )}
        </View>
      </View>

      {/* ── Descripción dinámica ── */}
      <Text style={[styles.settingsDescription, { color: colors.textSecondary }]}> 
        {publicProfile
          ? t('public_account_description')
          : t('private_account_description')}
      </Text>
    </ScrollView>
  );
}
