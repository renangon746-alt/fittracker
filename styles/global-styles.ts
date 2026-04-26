import { typography } from '@/constants/typography';
import { Platform, StyleSheet } from 'react-native';

export const globalStyles = (colors: any) =>
  StyleSheet.create({

    // ── Text ─────────────────────────────────────────────────────────────────
    largeTitle: {
      ...typography.largeTitle,
      color: colors.textPrimary,
    },
    tittleText: {
      ...typography.title1,
      color: colors.textPrimary,
    },
    title2: {
      ...typography.title2,
      color: colors.textPrimary,
    },
    headline: {
      ...typography.headline,
      color: colors.textPrimary,
    },
    principalText: {
      ...typography.callout,
      color: colors.textPrimary,
    },
    secondaryText: {
      ...typography.footnote,
      color: colors.textSecondary,
    },
    captionText: {
      ...typography.caption1,
      color: colors.textSecondary,
    },
    underlineText: {
      ...typography.footnote,
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    sectionLabel: {
      ...typography.caption2Bold,
      color: colors.textSecondary,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },

    // ── Inputs ───────────────────────────────────────────────────────────────
    inputs: {
      ...typography.callout,
      margin: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 24,
      color: colors.textPrimary,
      backgroundColor: colors.backgroundSecondary,
      width: 300,
    },

    // ── Buttons ──────────────────────────────────────────────────────────────
    principalButton: {
      backgroundColor: colors.primary,
      borderRadius: 50,
      width: 250,
      height: 44,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    secondaryButton: {
      backgroundColor: colors.backgroundPrimary,
      borderRadius: 50,
      width: 250,
      height: 44,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    tertiaryButton: {
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 50,
      width: 250,
      height: 44,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },

    // ── Images ───────────────────────────────────────────────────────────────
    principalLogoImage: {
      width: 150,
      height: 150,
    },
    profileImage: {
      borderRadius: 50,
      width: 50,
      height: 50,
    },

    // ── Cards ────────────────────────────────────────────────────────────────
    card: {
      backgroundColor: colors.backgroundPrimary,
      borderRadius: 24,
      padding: 16,
      ...(Platform.OS === 'ios'
        ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 }
        : { elevation: 2 }),
    },
    sectionCard: {
      backgroundColor: colors.backgroundPrimary,
      borderRadius: 24,
      overflow: 'hidden' as const,
      ...(Platform.OS === 'ios'
        ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 }
        : { elevation: 2 }),
    },

    // ── Legacy compat (streak/calendar) ──────────────────────────────────────
    streakContainer: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    streakNumber: {
      ...typography.title2,
      position: 'absolute' as const,
      color: colors.textPrimary,
      top: 11,
    },
    calendarContainer: {
      padding: 10,
      borderRadius: 16,
      marginVertical: 8,
      alignItems: 'center' as const,
    },
    graphContainer: {
      marginVertical: 8,
      borderRadius: 16,
    },
  });
