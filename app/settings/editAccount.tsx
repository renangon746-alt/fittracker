import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { globalStyles } from '@/styles/global-styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function EditAccount() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = globalStyles(colors);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // ── Cargar email actual ───────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAccount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
      setLoading(false);
    }
    fetchAccount();
  }, []);

  // ── Guardar cambios ───────────────────────────────────────────────────────
  async function handleSave() {
    if (newPassword && newPassword.length < 6) {
      Alert.alert(t('error'), t('new_password_min_length'));
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('no_active_session'));

      // Cambiar email si ha cambiado
      if (email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
      }

      // Cambiar contraseña si se ha rellenado
      if (newPassword) {
        // Reautenticar primero con la contraseña actual
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: currentPassword,
        });
        if (signInError) throw new Error(t('email_or_password_incorrect'));

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }

      Alert.alert(t('done_title'), t('account_updated_success'), [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(t('error'), error.message ?? t('could_not_save_changes'));
    } finally {
      setSaving(false);
    }
  }

  // ── Borrar cuenta ─────────────────────────────────────────────────────────
  function handleDeleteAccount() {
    Alert.alert(
      t('delete_account_confirm_title'),
      t('delete_account_confirm_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete_account_button'),
          style: 'destructive',
          onPress: async () => {
            // Requiere una Edge Function en Supabase para borrar el usuario de Auth
            // ya que el cliente no puede borrarse a sí mismo por seguridad
            Alert.alert(t('soon'), t('feature_available_soon'));
          },
        },
      ]
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.settingsCentered, { backgroundColor: colors.backgroundSecondary }]}> 
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
        contentContainerStyle={styles.settingsContainer}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Correo ── */}
        <Section title={t('email_section')} colors={colors}>
          <View style={styles.editAccountInputRow}>
            <Ionicons name="mail-outline" size={18} color={colors.iconInactive} />
            <TextInput
              style={[styles.editAccountInput, styles.editAccountInputFlex, { color: colors.textPrimary }]}
              value={email}
              onChangeText={setEmail}
              placeholder={t('email_placeholder_account')}
              placeholderTextColor={colors.iconInactive}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </Section>

        {/* ── Contraseña ── */}
        <Section title={t('password_section')} colors={colors}>
          {/* Contraseña actual */}
          <View style={[styles.editAccountInputRow, {
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border,
          }]}> 
            <Ionicons name="key-outline" size={18} color={colors.iconInactive} />
            <TextInput
              style={[styles.editAccountInput, styles.editAccountInputFlex, { color: colors.textPrimary }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t('current_password')}
              placeholderTextColor={colors.iconInactive}
              secureTextEntry={!showCurrent}
            />
            <Pressable onPress={() => setShowCurrent(v => !v)}>
              <Ionicons
                name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.iconInactive}
              />
            </Pressable>
          </View>

          {/* Contraseña nueva */}
          <View style={styles.editAccountInputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.iconInactive} />
            <TextInput
              style={[styles.editAccountInput, styles.editAccountInputFlex, { color: colors.textPrimary }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('new_password')}
              placeholderTextColor={colors.iconInactive}
              secureTextEntry={!showNew}
            />
            <Pressable onPress={() => setShowNew(v => !v)}>
              <Ionicons
                name={showNew ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.iconInactive}
              />
            </Pressable>
          </View>
        </Section>

        {/* ── Olvidé mi contraseña ── */}
        <Pressable
          onPress={() => router.push({
            pathname: '../../auth/forgotPassword',
            params: { from: 'settings' }
          })}
          style={styles.editAccountForgotWrap}
        >
          <Text style={[styles.editAccountForgotText, { color: colors.primary }]}> 
            {t('forgot_password_link')}
          </Text>
        </Pressable>

        {/* ── Borrar cuenta ── */}
        <Section colors={colors}>
          <Pressable
            onPress={handleDeleteAccount}
            style={({ pressed }) => [styles.editAccountDeleteRow, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="heart-dislike-outline" size={20} color="#FF3B30" />
            <Text style={styles.editAccountDeleteText}>{t('delete_account')}</Text>
          </Pressable>
        </Section>

        {/* ── Guardar ── */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.editAccountSaveBtn,
            { backgroundColor: colors.primary, opacity: pressed || saving ? 0.7 : 1 },
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.editAccountSaveBtnText}>{t('save_changes')}</Text>
          )}
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  colors,
}: {
  title?: string;
  children: React.ReactNode;
  colors: any;
}) {
  const styles = globalStyles(colors);
  return (
    <View style={styles.editAccountSection}>
      {title && (
        <Text style={[styles.editAccountSectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      )}
      <View
        style={[
          styles.editAccountSectionCard,
          {
            backgroundColor: colors.backgroundPrimary,
            shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}
