import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { useEditProfile } from '@/hooks/auth/useEditProfile';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function EditProfile() {
  const { colors } = useTheme();
  const { loading } = useUser();
  const {
    saving,
    nombre, setNombre,
    bio, setBio,
    enlace, setEnlace,
    displayImage,
    handlePickImage,
    handleSave,
  } = useEditProfile();

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
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
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={handlePickImage} style={styles.avatarWrap}>
          {displayImage ? (
            <Image
              source={{ uri: displayImage }}
              style={styles.avatar}
              key={displayImage}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.backgroundTertiary }]}>
              <Ionicons name="person-outline" size={40} color={colors.iconInactive} />
            </View>
          )}
          <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera-outline" size={14} color="#fff" />
          </View>
        </Pressable>

        <Section title="NOMBRE" colors={colors}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            placeholderTextColor={colors.iconInactive}
            maxLength={50}
          />
        </Section>

        <Section title="BIO" colors={colors}>
          <TextInput
            style={[styles.input, styles.inputMultiline, { color: colors.textPrimary }]}
            value={bio}
            onChangeText={setBio}
            placeholder="Cuéntanos algo sobre ti..."
            placeholderTextColor={colors.iconInactive}
            multiline
            maxLength={150}
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {bio.length}/150
          </Text>
        </Section>

        <Section title="ENLACE" colors={colors}>
          <View style={styles.inputRow}>
            <Ionicons name="link-outline" size={18} color={colors.iconInactive} />
            <TextInput
              style={[styles.input, styles.inputFlex, { color: colors.textPrimary }]}
              value={enlace}
              onChangeText={setEnlace}
              placeholder="https://tu-web.com"
              placeholderTextColor={colors.iconInactive}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </Section>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: colors.primary, opacity: pressed || saving ? 0.7 : 1 },
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Guardar cambios</Text>
          )}
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View
        style={[
          styles.sectionCard,
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

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { paddingVertical: 24, paddingBottom: 48, alignItems: 'center' },
  avatarWrap: { marginBottom: 32, position: 'relative' },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  section: { width: '100%', marginBottom: 24 },
  sectionTitle: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.6,
    textTransform: 'uppercase', marginHorizontal: 20, marginBottom: 8,
  },
  sectionCard: {
    marginHorizontal: 16, borderRadius: 32, overflow: 'hidden',
    paddingHorizontal: 16, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  input: { fontSize: 16, paddingVertical: 13, minHeight: 50 },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top', paddingTop: 13 },
  inputFlex: { flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  charCount: { fontSize: 12, textAlign: 'right', paddingBottom: 8 },
  saveBtn: {
    marginHorizontal: 16, width: '90%', borderRadius: 32,
    paddingVertical: 15, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
