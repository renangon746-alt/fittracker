import { typography } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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

  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [nombre, setNombre]       = useState('');
  const [bio, setBio]             = useState('');
  const [enlace, setEnlace]       = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);

  const savedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('usuario').select('id_usuario, nombre, bio, enlace, foto_perfil')
        .eq('email', user.email).single();
      if (error) {
        Alert.alert('Error', 'No se pudo cargar el perfil.');
      } else {
        setIdUsuario(data.id_usuario);
        setNombre(data.nombre ?? '');
        setBio(data.bio ?? '');
        setEnlace(data.enlace ?? '');
        setFotoPerfil(data.foto_perfil ?? null);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  function showSavedFeedback() {
    Animated.sequence([
      Animated.timing(savedOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(savedOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería para cambiar la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setFotoPerfil(result.assets[0].uri);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sin sesión');

      let fotoUrl = fotoPerfil;
      if (fotoPerfil && fotoPerfil.startsWith('file://')) {
        const fileName = `${idUsuario}/avatar.jpg`;
        const response = await fetch(fotoPerfil);
        const blob = await response.blob();
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        fotoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('usuario').update({ nombre, bio, enlace, foto_perfil: fotoUrl }).eq('email', user.email);
      if (error) throw error;

      showSavedFeedback();
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
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
        {/* Avatar */}
        <Pressable onPress={handlePickImage} style={styles.avatarWrap}>
          {fotoPerfil ? (
            <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.backgroundTertiary }]}>
              <Ionicons name="person-outline" size={40} color={colors.iconInactive} />
            </View>
          )}
          <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera-outline" size={14} color="#fff" />
          </View>
        </Pressable>

        {/* Nombre */}
        <Section title="NOMBRE" colors={colors}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={nombre} onChangeText={setNombre}
            placeholder="Tu nombre" placeholderTextColor={colors.iconInactive}
            maxLength={50}
          />
        </Section>

        {/* Bio */}
        <Section title="BIO" colors={colors}>
          <TextInput
            style={[styles.input, styles.inputMultiline, { color: colors.textPrimary }]}
            value={bio} onChangeText={setBio}
            placeholder="Cuéntanos algo sobre ti..." placeholderTextColor={colors.iconInactive}
            multiline maxLength={150}
          />
          <Text style={[typography.caption1, { color: colors.textSecondary, textAlign: 'right', paddingBottom: 8 }]}>
            {bio.length}/150
          </Text>
        </Section>

        {/* Enlace */}
        <Section title="ENLACE" colors={colors}>
          <View style={styles.inputRow}>
            <Ionicons name="link-outline" size={18} color={colors.iconInactive} />
            <TextInput
              style={[styles.input, { flex: 1, color: colors.textPrimary }]}
              value={enlace} onChangeText={setEnlace}
              placeholder="https://tu-web.com" placeholderTextColor={colors.iconInactive}
              autoCapitalize="none" keyboardType="url"
            />
          </View>
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

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.section}>
      <Text style={[typography.caption2Bold, { color: colors.textSecondary, letterSpacing: 0.6, textTransform: 'uppercase', marginHorizontal: 20, marginBottom: 8 }]}>
        {title}
      </Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.backgroundPrimary, shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent' }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container:  { paddingVertical: 24, paddingBottom: 48, alignItems: 'center' },
  avatarWrap: { marginBottom: 32, position: 'relative' },
  avatar:     { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  section:    { width: '100%', marginBottom: 24 },
  sectionCard: { marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', paddingHorizontal: 16, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  input:      { fontSize: 16, paddingVertical: 13, minHeight: 50 },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top', paddingTop: 13 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  savedPill:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 12, elevation: 2 },
  saveBtn:    { marginHorizontal: 16, width: '90%', borderRadius: 24, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
});
