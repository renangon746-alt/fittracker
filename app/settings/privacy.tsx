import { typography } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

export default function Privacy() {
  const { colors } = useTheme();

  const [publicProfile, setPublicProfile] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const savedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function fetchPreference() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPublicProfile(false); return; }
      const { data, error } = await supabase
        .from('usuario').select('perfil_publico').eq('email', user.email).single();
      if (error) { setPublicProfile(false); return; }
      setPublicProfile(data.perfil_publico);
    }
    fetchPreference();
  }, []);

  function showSavedFeedback() {
    Animated.sequence([
      Animated.timing(savedOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(savedOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  async function handleToggle(value: boolean) {
    setPublicProfile(value);
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase
      .from('usuario').update({ perfil_publico: value }).eq('email', user.email);
    if (error) {
      setPublicProfile(!value);
    } else {
      showSavedFeedback();
    }
    setSaving(false);
  }

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
      <View style={[styles.card, { backgroundColor: colors.backgroundPrimary, shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent' }]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textPrimary} />
            <Text style={[typography.callout, { color: colors.textPrimary }]}>Cuenta pública</Text>
          </View>
          {saving
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Switch value={publicProfile} onValueChange={handleToggle} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
          }
        </View>
      </View>

      <Text style={[typography.footnote, styles.description, { color: colors.textSecondary }]}>
        {publicProfile
          ? 'Tu cuenta es pública, todo el mundo la podrá ver y seguir.'
          : 'Tu cuenta es privada, nadie la podrá ver a menos que los aceptes como seguidores.'}
      </Text>

      <Animated.View style={[styles.savedPill, { backgroundColor: colors.backgroundPrimary, opacity: savedOpacity }]}>
        <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
        <Text style={[typography.caption1Bold, { color: colors.primary }]}>Guardado</Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container:   { paddingVertical: 24, paddingBottom: 48 },
  card:        { marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  row:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 16, minHeight: 50 },
  rowLeft:     { flexDirection: 'row', alignItems: 'center', gap: 14 },
  description: { marginHorizontal: 20, marginTop: 10, lineHeight: 18 },
  savedPill:   { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'center', marginTop: 16, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, elevation: 2 },
});
