import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { useEditProfile } from '@/hooks/useEditProfile';
import { globalStyles } from '@/styles/global-styles';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function EditProfile() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = globalStyles(colors);
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
        contentContainerStyle={styles.editProfileContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={handlePickImage} style={styles.editProfileAvatarWrap}>
          {displayImage ? (
            <Image
              source={{ uri: displayImage }}
              style={styles.editProfileAvatar}
              key={displayImage}
            />
          ) : (
            <View style={[styles.editProfileAvatar, styles.editProfileAvatarPlaceholder, { backgroundColor: colors.backgroundTertiary }]}> 
              <Ionicons name="person-outline" size={40} color={colors.iconInactive} />
            </View>
          )}
          <View style={[styles.editProfileAvatarBadge, { backgroundColor: colors.primary }]}> 
            <Ionicons name="camera-outline" size={14} color="#fff" />
          </View>
        </Pressable>

        <Section title={t('name_section')} colors={colors}>
          <TextInput
            style={[styles.editProfileInput, { color: colors.textPrimary }]}
            value={nombre}
            onChangeText={setNombre}
            placeholder={t('your_name')}
            placeholderTextColor={colors.iconInactive}
            maxLength={50}
          />
        </Section>

        <Section title={t('bio_section')} colors={colors}>
          <TextInput
            style={[styles.editProfileInput, styles.editProfileInputMultiline, { color: colors.textPrimary }]}
            value={bio}
            onChangeText={setBio}
            placeholder={t('tell_about_you')}
            placeholderTextColor={colors.iconInactive}
            multiline
            maxLength={150}
          />
          <Text style={[styles.editProfileCharCount, { color: colors.textSecondary }]}> 
            {bio.length}/150
          </Text>
        </Section>

        <Section title={t('link_section')} colors={colors}>
          <View style={styles.editProfileInputRow}>
            <Ionicons name="link-outline" size={18} color={colors.iconInactive} />
            <TextInput
              style={[styles.editProfileInput, styles.editProfileInputFlex, { color: colors.textPrimary }]}
              value={enlace}
              onChangeText={setEnlace}
              placeholder={t('your_website')}
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
            styles.editProfileSaveBtn,
            { backgroundColor: colors.primary, opacity: pressed || saving ? 0.7 : 1 },
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.editProfileSaveBtnText}>{t('save_changes')}</Text>
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
  const styles = globalStyles(colors);
  return (
    <View style={styles.editProfileSection}>
      <Text style={[styles.editProfileSectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View
        style={[
          styles.editProfileSectionCard,
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
