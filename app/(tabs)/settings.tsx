import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from 'expo-router';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

type RowProps = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  isLast?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
};

// ─── Reusable row ─────────────────────────────────────────────────────────────

function SettingsRow({ icon, label, onPress, right, isLast, colors }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.backgroundPrimary, opacity: pressed && onPress ? 0.5 : 1 },
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Icon — same color as text, no background */}
      <View style={styles.iconWrap}>{icon}</View>

      <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>

      <View style={styles.rowRight}>
        {right ?? (
          onPress ? (
            <Ionicons name="chevron-forward" size={17} color={colors.iconInactive} />
          ) : null
        )}
      </View>
    </Pressable>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  title,
  children,
  colors,
}: {
  title?: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={styles.section}>
      {title && (
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {title}
        </Text>
      )}
      {/* Card contrasts against the page background */}
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

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function Settings() {
  const router = useRouter();
  const { colors, toggleTheme, theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    // Page background = backgroundSecondary → cards use backgroundPrimary → contrast
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      contentContainerStyle={styles.container}
    >

      {/* ── Preferencias ── */}
      <Section title="PREFERENCIAS" colors={colors}>
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="moon-outline" size={20} color={colors.textPrimary} />}
          label="Tema oscuro"
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
          label="Notificaciones"
          onPress={() => router.push('/settings/notifications')}
        />
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textPrimary} />}
          label="Privacidad"
          onPress={() => router.push('/settings/privacy')}
          isLast
        />
      </Section>

      {/* ── Cuenta ── */}
      <Section title="CUENTA" colors={colors}>
        <SettingsRow
          colors={colors}
          icon={<FontAwesome5 name="user-edit" size={18} color={colors.textPrimary} />}
          label="Editar perfil"
          onPress={() => router.push('/settings/editProfile')}
        />
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="settings-outline" size={20} color={colors.textPrimary} />}
          label="Editar cuenta"
          onPress={() => router.push('/settings/editAccount')}
          isLast
        />
      </Section>

      {/* ── Ayuda ── */}
      <Section title="AYUDA" colors={colors}>
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="mail-outline" size={20} color={colors.textPrimary} />}
          label="Ponte en contacto"
          onPress={() => Linking.openURL('mailto:support@fittracker.app')}
        />
        <SettingsRow
          colors={colors}
          icon={<Ionicons name="star-outline" size={20} color={colors.textPrimary} />}
          label="Escribir reseña"
          onPress={() => Linking.openURL('https://apps.apple.com')}
        />
        <SettingsRow
          colors={colors}
          icon={<FontAwesome5 name="dumbbell" size={16} color={colors.textPrimary} />}
          label="Acerca de nosotros"
          onPress={() => router.push('/')}
          isLast
        />
      </Section>

      {/* ── Síguenos ── */}
      <Section title="SÍGUENOS" colors={colors}>
        <View style={styles.socialRow}>
          {[
            { name: 'logo-instagram', url: 'https://instagram.com/fittracker' },
            { name: 'logo-youtube',   url: 'https://youtube.com/fittracker'   },
            { name: 'logo-facebook',  url: 'https://facebook.com/fittracker'  },
            { name: 'logo-twitter',   url: 'https://twitter.com/fittracker'   },
          ].map((s) => (
            <Pressable
              key={s.name}
              onPress={() => Linking.openURL(s.url)}
              style={({ pressed }) => [styles.socialBtn, { opacity: pressed ? 0.5 : 1 }]}
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
          label="Versión"
          right={
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>1.0.0</Text>
          }
          isLast
        />
      </Section>

      {/* ── Cerrar sesión ── card style, danger text, no bg color */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutBtn,
          { backgroundColor: colors.backgroundPrimary, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => { /* cerrar sesión */ }}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>

      <Text style={[styles.footer, { color: colors.textSecondary }]}>
        @FitTracker · Todos los derechos reservados
      </Text>

    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingBottom: 48,
  },

  // Section
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  sectionCard: {
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
    paddingVertical: 13,
    paddingHorizontal: 16,
    minHeight: 50,
    gap: 14,
  },
  iconWrap: {
    width: 24,
    alignItems: 'center',
  },
  rowLabel: { flex: 1, fontSize: 16 },
  rowRight: { alignItems: 'flex-end' },

  // Social
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  socialBtn: { padding: 8 },

  // Version
  versionText: { fontSize: 15 },

  // Logout — card style, danger text color only
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 32,
    paddingVertical: 15,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },

  // Footer
  footer: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});