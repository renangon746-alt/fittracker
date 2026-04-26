import { typography } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function EditAccount() {
  const { colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [email, setEmail]               = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);

  const savedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function fetchAccount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
      setLoading(false);
    }
    fetchAccount();
  }, []);

  function showSavedFeedback() {
    Animated.sequence([
      Animated.timing(savedOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(savedOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  async function handleSave() {
    if (newPassword && newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña nueva debe tener al menos 6 caracteres.');
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sin sesión');

      if (email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
      }

      if (newPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: currentPassword,
        });
        if (signInError) throw new Error('La contraseña actual no es correcta.');
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setCurrentPassword('');
        setNewPassword('');
      }

      showSavedFeedback();
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Borrar cuenta',
      '¿Estás seguro? Esta acción es irreversible y se eliminarán todos tus datos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar', style: 'destructive',
          onPress: () => Alert.alert('Próximamente', 'Esta función estará disponible pronto.'),
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Correo */}
        <Section title="CORREO" colors={colors}>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color={colors.iconInactive} />
            <TextInput
              style={[styles.input, { flex: 1, color: colors.textPrimary }]}
              value={email} onChangeText={setEmail}
              placeholder="correo@ejemplo.com" placeholderTextColor={colors.iconInactive}
              autoCapitalize="none" keyboardType="email-address"
            />
          </View>
        </Section>

        {/* Contraseña */}
        <Section title="CONTRASEÑA" colors={colors}>
          <View style={[styles.inputRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <Ionicons name="key-outline" size={18} color={colors.iconInactive} />
            <TextInput
              style={[styles.input, { flex: 1, color: colors.textPrimary }]}
              value={currentPassword} onChangeText={setCurrentPassword}
              placeholder="Contraseña actual" placeholderTextColor={colors.iconInactive}
              secureTextEntry={!showCurrent}
            />
            <Pressable onPress={() => setShowCurrent(v => !v)} hitSlop={8}>
              <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.iconInactive} />
            </Pressable>
          </View>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.iconInactive} />
            <TextInput
              style={[styles.input, { flex: 1, color: colors.textPrimary }]}
              value={newPassword} onChangeText={setNewPassword}
              placeholder="Contraseña nueva" placeholderTextColor={colors.iconInactive}
              secureTextEntry={!showNew}
            />
            <Pressable onPress={() => setShowNew(v => !v)} hitSlop={8}>
              <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.iconInactive} />
            </Pressable>
          </View>
        </Section>

        {/* Olvidé contraseña */}
        <Pressable
          onPress={() => router.push({ pathname: '/auth/forgotPassword', params: { from: 'settings' } })}
          style={styles.forgotWrap}
        >
          <Text style={[typography.footnote, { color: colors.primary }]}>Olvidé mi contraseña</Text>
        </Pressable>

        {/* Borrar cuenta */}
        <Section colors={colors}>
          <Pressable onPress={handleDeleteAccount} style={({ pressed }) => [styles.deleteRow, { opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="heart-dislike-outline" size={20} color="#FF3B30" />
            <Text style={[typography.callout, { color: '#FF3B30' }]}>Borrar cuenta</Text>
          </Pressable>
        </Section>

        {/* Saved pill */}
        <Animated.View style={[styles.savedPill, { backgroundColor: colors.backgroundPrimary, opacity: savedOpacity }]}>
          <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
          <Text style={[typography.caption1Bold, { color: colors.primary }]}>Cambios guardados</Text>
        </Animated.View>

        {/* Guardar */}
        <Pressable
          onPress={handleSave} disabled={saving}
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: pressed || saving ? 0.7 : 1 }]}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={[typography.calloutBold, { color: '#fff' }]}>Guardar cambios</Text>
          }
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children, colors }: { title?: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.section}>
      {title && (
        <Text style={[typography.caption2Bold, { color: colors.textSecondary, letterSpacing: 0.6, textTransform: 'uppercase', marginHorizontal: 20, marginBottom: 8 }]}>
          {title}
        </Text>
      )}
      <View style={[styles.sectionCard, { backgroundColor: colors.backgroundPrimary, shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent' }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container:   { paddingVertical: 24, paddingBottom: 48 },
  section:     { marginBottom: 8 },
  sectionCard: { marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', paddingHorizontal: 16, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input:       { fontSize: 16, paddingVertical: 13, minHeight: 50 },
  forgotWrap:  { marginHorizontal: 20, marginTop: 8, marginBottom: 24 },
  deleteRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  savedPill:   { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'center', marginTop: 16, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 4, elevation: 2 },
  saveBtn:     { marginHorizontal: 16, borderRadius: 24, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
});
