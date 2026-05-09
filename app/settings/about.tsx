import { typography } from '@/constants/typography';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

const SHADOW = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  android: { elevation: 2 },
  default: {},
}) as object;

function InfoRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.row}>
      <Text style={[typography.subhead, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[typography.subheadBold, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

export default function About() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      contentContainerStyle={styles.container}
    >
      {/* Logo / brand */}
      <View style={styles.brandWrap}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
          <FontAwesome5 name="dumbbell" size={32} color="#fff" />
        </View>
        <Text style={[typography.title1, { color: colors.textPrimary, marginTop: 16 }]}>{t('app_name')}</Text>
        <Text style={[typography.footnote, { color: colors.textSecondary, marginTop: 4 }]}>
          {t('about_tagline')}
        </Text>
      </View>

      {/* Info card */}
      <View style={[styles.card, { backgroundColor: colors.backgroundPrimary }, SHADOW]}>
        <InfoRow label={t('version')} value="1.0.0" colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <InfoRow label={t('about_developers_label')} value="Renan · Alex · Héctor" colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <InfoRow label={t('about_year_label')} value="2025" colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <InfoRow label={t('about_platform_label')} value="iOS · Android" colors={colors} />
      </View>

      <Text style={[typography.caption1, { color: colors.textSecondary, textAlign: 'center', marginTop: 32 }]}>
        © 2025 {t('app_name')} · {t('all_rights')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { paddingVertical: 32, paddingBottom: 48, alignItems: 'center' },
  brandWrap:  { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '100%',
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    marginLeft: 16,
    marginRight: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  divider: { height: StyleSheet.hairlineWidth },
});
