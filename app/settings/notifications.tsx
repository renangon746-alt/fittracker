import { typography } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { globalStyles } from '@/styles/global-styles';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';

export default function Notifications() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = globalStyles(colors);

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function fetchPreference() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('usuario').select('notificaciones_activas').eq('email', user.email).single();
        if (data) setEnabled(data.notificaciones_activas);
      } catch {
        Alert.alert(t('error'), t('could_not_load_settings'));
      } finally {
        setLoading(false);
      }
    }
    fetchPreference();
  }, [t]);

  function showSavedFeedback() {
    Animated.sequence([
      Animated.timing(savedOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(savedOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  async function handleToggle(value: boolean) {
    setEnabled(value);
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('no_active_session'));

      const { error } = await supabase
        .from('usuario').update({ notificaciones_activas: value }).eq('email', user.email);
      if (error) throw error;
      showSavedFeedback();
    } catch {
      setEnabled(!value);
      Alert.alert(t('error'), t('could_not_save_change_retry'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
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
      {/* ── Card principal ── */}
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
              name="notifications-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={[styles.settingsRowLabel, { color: colors.textPrimary }]}>
              {t('notifications')}
            </Text>
          </View>
          {saving
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Switch value={enabled} onValueChange={handleToggle} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
          }
        </View>
      </View>

      {/* ── Descripción ── */}
      <Text style={[styles.settingsDescription, { color: colors.textSecondary }]}>
        {enabled
          ? t('notifications_enabled_description')
          : t('notifications_disabled_description')}
      </Text>

      {/* Saved confirmation */}
      <Animated.View style={[styles.savedPill, { backgroundColor: colors.backgroundPrimary, opacity: savedOpacity }]}>
        <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
        <Text style={[typography.caption1Bold, { color: colors.primary }]}>{t('done_title')}</Text>
      </Animated.View>
    </ScrollView>
  );
}
