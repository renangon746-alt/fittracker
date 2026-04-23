import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { globalStyles } from '@/styles/global-styles';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from 'expo-router';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';

type RowProps = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  isLast?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
};

function SettingsRow({ icon, label, onPress, right, isLast, colors }: RowProps) {
  const styles = globalStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsTabRow,
        { backgroundColor: colors.backgroundPrimary, opacity: pressed && onPress ? 0.5 : 1 },
        !isLast && {
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.settingsTabIconWrap}>{icon}</View>
      <Text style={[styles.settingsTabRowLabel, { color: colors.textPrimary }]}>{label}</Text>
      <View style={styles.settingsTabRowRight}>
        {right ?? (
          onPress ? (
            <Ionicons name="chevron-forward" size={17} color={colors.iconInactive} />
          ) : null
        )}
      </View>
    </Pressable>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title?: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const styles = globalStyles(colors);
  return (
    <View style={styles.settingsTabSection}>
      {title && (
        <Text style={[styles.settingsTabSectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      )}
      <View
        style={[
          styles.settingsTabSectionCard,
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

export default function Settings() {
  const router = useRouter();
  const { colors, toggleTheme, theme } = useTheme();
  const { t } = useTranslation();
  const styles = globalStyles(colors);
  const isDark = theme === 'dark';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      contentContainerStyle={styles.settingsTabContainer}
    >
      {/* ── Preferencias ── */}
      <Section title={t('preferences')} colors={colors}>
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="moon-outline" size={20} color={colors.textPrimary} />}
          label={t('dark_theme')}
          right={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          }
        />
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />}
          label={t('notifications')}
          onPress={() => router.push('/settings/notifications')}
        />
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textPrimary} />}
          label={t('privacy')}
          onPress={() => router.push('/settings/privacy')}
        />
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="globe-outline" size={20} color={colors.textPrimary} />}
          label={t('language')}
          onPress={() => router.push('../../settings/language')}
          isLast
        />
      </Section>

      {/* ── Cuenta ── */}
      <Section title={t('account')} colors={colors}>
        <SettingsRow
          colors={colors}
          icon={<FontAwesome5 name="user" size={18} color={colors.textPrimary} />}
          label={t('my_profile')}
          onPress={() => router.push('../../profile/ownProfile')}
        />
        <SettingsRow
          colors={colors}
          icon={<FontAwesome5 name="user-edit" size={18} color={colors.textPrimary} />}
          label={t('edit_profile')}
          onPress={() => router.push('/settings/editProfile')}
        />
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="settings-outline" size={20} color={colors.textPrimary} />}
          label={t('edit_account')}
          onPress={() => router.push('/settings/editAccount')}
          isLast
        />
      </Section>

      {/* ── Ayuda ── */}
      <Section title={t('help')} colors={colors}>
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="mail-outline" size={20} color={colors.textPrimary} />}
          label={t('contact')}
          onPress={() => Linking.openURL('mailto:support@fittracker.app')}
        />
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="star-outline" size={20} color={colors.textPrimary} />}
          label={t('write_review')}
          onPress={() => Linking.openURL('https://apps.apple.com')}
        />
        <SettingsRow
          colors={colors}
          icon={<FontAwesome5 name="dumbbell" size={16} color={colors.textPrimary} />}
          label={t('about_us')}
          onPress={() => router.push('/')}
          isLast
        />
      </Section>

      {/* ── Síguenos ── */}
      <Section title={t('follow_us')} colors={colors}>
        <View style={styles.settingsTabSocialRow}>
          {[
            { name: 'logo-instagram', url: 'https://instagram.com/fittracker' },
            { name: 'logo-youtube',   url: 'https://youtube.com/fittracker'   },
            { name: 'logo-facebook',  url: 'https://facebook.com/fittracker'  },
            { name: 'logo-twitter',   url: 'https://twitter.com/fittracker'   },
          ].map((s) => (
            <Pressable
              key={s.name}
              onPress={() => Linking.openURL(s.url)}
              style={({ pressed }) => [styles.settingsTabSocialBtn, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Ionicons name={s.name as any} size={26} color={colors.textPrimary} />
            </Pressable>
          ))}
        </View>
      </Section>

      {/* ── Versión ── */}
      <Section colors={colors}>
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="information-circle-outline" size={20} color={colors.textPrimary} />}
          label={t('version')}
          right={
            <Text style={[styles.settingsTabVersionText, { color: colors.textSecondary }]}>1.0.0</Text>
          }
          isLast
        />
      </Section>

      {/* ── Cerrar sesión ── */}
      <Pressable
        style={({ pressed }) => [
          styles.settingsTabLogoutBtn,
          { backgroundColor: colors.backgroundPrimary, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => { /* cerrar sesión */ }}
      >
        <Text style={styles.settingsTabLogoutText}>{t('logout')}</Text>
      </Pressable>

      <Text style={[styles.settingsTabFooter, { color: colors.textSecondary }]}> 
        {`@${t('app_name')} · ${t('all_rights')}`}
      </Text>
    </ScrollView>
  );
}
