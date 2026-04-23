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

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function Notifications() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Cargar preferencia actual del usuario ──────────────────────────────────
  useEffect(() => {
    async function fetchPreference() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('usuario')
          .select('notificaciones_activas')
          .eq('email', user.email)
          .single();

        if (error) throw error;
        if (data) setEnabled(data.notificaciones_activas);
      } catch {
        Alert.alert(t('error'), t('could_not_load_settings'));
      } finally {
        setLoading(false);
      }
    }

    fetchPreference();
  }, [t]);

  // ── Guardar cambio en Supabase ─────────────────────────────────────────────
  async function handleToggle(value: boolean) {
    setEnabled(value); // actualiza UI inmediatamente (optimistic update)
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('no_active_session'));

      const { error } = await supabase
        .from('usuario')
        .update({ notificaciones_activas: value })
        .eq('email', user.email);

      if (error) throw error;
    } catch {
      // Revertir si falla
      setEnabled(!value);
      Alert.alert(t('error'), t('could_not_save_change_retry'));
    } finally {
      setSaving(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
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
      {/* ── Card principal ── */}
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
              name="notifications-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}> 
              {t('notifications')}
            </Text>
          </View>

          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Switch
              value={enabled}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          )}
        </View>
      </View>

      {/* ── Descripción ── */}
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {enabled
          ? t('notifications_enabled_description')
          : t('notifications_disabled_description')}
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

  // Card
  card: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },

  // Row
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

  // Description
  description: {
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: 10,
    lineHeight: 18,
  },
});
