import { StyleSheet } from "react-native";

export const globalStyles = (colors: any) =>
    StyleSheet.create({

    defaultContainer:{
        flex: 1, 
        backgroundColor: colors.backgroundPrimary
    },

    tittleText:{
        fontSize: 28,
        fontFamily: 'Inter',
        padding: 15,
        color: colors.textPrimary
    },

    principalText: {
        fontSize: 15,
        fontFamily: 'Inter',
        color: colors.textPrimary
    },

    secondaryText: {
        fontSize: 12,
        fontFamily: 'Poppins',
        color: colors.textSecondary
    },

    underlineText:{
        fontSize: 12,
        fontFamily: 'Inter',
        color: colors.primary,
        textDecorationLine: 'underline'
    },

    inputs: {
        margin: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
        color: colors.textPrimary,
        backgroundColor: colors.backgroundSecondary,
        width: 300
    },

    principalLogoImage: {
        width: 150,
        height: 150
    },

    principalButton:{
        backgroundColor: colors.primary,
        borderRadius: 50,
        width: 250,
        height:40,
        alignItems: 'center' as const,
        justifyContent: 'center' as const
    },

    secondaryButton:{
        backgroundColor: colors.textSecondary,
        borderRadius: 50,
        width: 250,
        height:40,
        alignItems: 'center' as const,
        justifyContent: 'center' as const
    },

    tertiaryButton:{
        backgroundColor: colors.textPrimary,
        borderRadius: 50,
        width: 250,
        height:40,
        alignItems: 'center' as const,
        justifyContent: 'center' as const
    },

    profileImage:{
        borderRadius: 50,
        width: 50,
        height: 50
    },

    streakContainer:{
        alignItems: "center",
        justifyContent: "center"
    },

    streakNumber: {
        position: "absolute",
        color: colors.textPrimary,
        fontSize: 30,
        fontFamily: "Inter",
        fontWeight: "bold",
        top: 11,
        textShadowColor: 'black',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 2,
    },

    calendarContainer: {
        padding: 10,
        borderRadius: 16,
        marginVertical: 8,
        alignItems: 'center',
    },

    calendarRadius:{
        borderRadius: 16
    },

    graphContainer: {
        marginVertical: 8,
        borderRadius: 16,
    },

    icon:{
        backgroundColor: colors.primary,
        borderRadius: 50,
        width: 250,
        height:40,
        alignItems: 'center' as const,
        justifyContent: 'center' as const
    },

    backArrowContainer:{
        paddingHorizontal: 20, 
        paddingTop: 10
    },

    backArrowPressable:{
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 8,
        width: 40
    },

    // Exercises tab
    exercisesSearchContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    exercisesInput: {
        borderRadius: 30,
        paddingVertical: 10,
        paddingLeft: 16,
        paddingRight: 44,
        borderWidth: 1,
    },
    exercisesSearchIcon: {
        position: 'absolute',
        right: 24,
    },

    // Social tab
    socialSearchContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    socialInput: {
        borderRadius: 30,
        paddingVertical: 10,
        paddingLeft: 16,
        paddingRight: 44,
        borderWidth: 1,
    },
    socialSearchIcon: {
        position: 'absolute',
        right: 24,
    },
    socialEmptyText: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 8,
    },
    socialLoader: {
        marginTop: 24,
    },

    // Settings tab
    settingsTabContainer: { paddingVertical: 24, paddingBottom: 48 },
    settingsTabSection: { marginBottom: 28 },
    settingsTabSectionTitle: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginHorizontal: 20,
        marginBottom: 8,
    },
    settingsTabSectionCard: {
        marginHorizontal: 16,
        borderRadius: 14,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
    },
    settingsTabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 16,
        minHeight: 50,
        gap: 14,
    },
    settingsTabIconWrap: { width: 24, alignItems: 'center' },
    settingsTabRowLabel: { flex: 1, fontSize: 16 },
    settingsTabRowRight: { alignItems: 'flex-end' },
    settingsTabSocialRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    settingsTabSocialBtn: { padding: 8 },
    settingsTabVersionText: { fontSize: 15 },
    settingsTabLogoutBtn: {
        marginHorizontal: 16,
        marginTop: 4,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
    },
    settingsTabLogoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
    settingsTabFooter: { textAlign: 'center', fontSize: 12, marginTop: 24 },

    // Language settings
    languageContainer: { paddingVertical: 24, paddingBottom: 48 },
    languageCard: {
        marginHorizontal: 16,
        borderRadius: 14,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
    },
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 50,
        gap: 14,
    },
    languageBadge: {
        width: 34,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    languageBadgeText: { fontSize: 11, fontWeight: '700' },
    languageLabel: { flex: 1, fontSize: 16 },

    // Settings cards shared
    settingsCentered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    settingsContainer: { paddingVertical: 24, paddingBottom: 48 },
    settingsCard: {
        marginHorizontal: 16,
        borderRadius: 14,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
        paddingHorizontal: 16,
        minHeight: 50,
    },
    settingsRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    settingsRowLabel: { fontSize: 16 },
    settingsDescription: {
        fontSize: 13,
        marginHorizontal: 20,
        marginTop: 10,
        lineHeight: 18,
    },

    // Edit profile
    editProfileContainer: { paddingVertical: 24, paddingBottom: 48, alignItems: 'center' },
    editProfileAvatarWrap: { marginBottom: 32, position: 'relative' },
    editProfileAvatar: { width: 90, height: 90, borderRadius: 45 },
    editProfileAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    editProfileAvatarBadge: {
        position: 'absolute', bottom: 0, right: 0,
        width: 26, height: 26, borderRadius: 13,
        alignItems: 'center', justifyContent: 'center',
    },
    editProfileSection: { width: '100%', marginBottom: 24 },
    editProfileSectionTitle: {
        fontSize: 11, fontWeight: '600', letterSpacing: 0.6,
        textTransform: 'uppercase', marginHorizontal: 20, marginBottom: 8,
    },
    editProfileSectionCard: {
        marginHorizontal: 16, borderRadius: 32, overflow: 'hidden',
        paddingHorizontal: 16, shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
    },
    editProfileInput: { fontSize: 16, paddingVertical: 13, minHeight: 50 },
    editProfileInputMultiline: { minHeight: 80, textAlignVertical: 'top', paddingTop: 13 },
    editProfileInputFlex: { flex: 1 },
    editProfileInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    editProfileCharCount: { fontSize: 12, textAlign: 'right', paddingBottom: 8 },
    editProfileSaveBtn: {
        marginHorizontal: 16, width: '90%', borderRadius: 32,
        paddingVertical: 15, alignItems: 'center', marginTop: 8,
    },
    editProfileSaveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

    // Edit account
    editAccountSection: { marginBottom: 8 },
    editAccountSectionTitle: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginHorizontal: 20,
        marginBottom: 8,
    },
    editAccountSectionCard: {
        marginHorizontal: 16,
        borderRadius: 32,
        overflow: 'hidden',
        paddingHorizontal: 16,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
    },
    editAccountInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    editAccountInput: {
        fontSize: 16,
        paddingVertical: 13,
        minHeight: 50,
        outlineWidth: 0,
    },
    editAccountInputFlex: { flex: 1 },
    editAccountForgotWrap: { marginHorizontal: 20, marginTop: 8, marginBottom: 24 },
    editAccountForgotText: { fontSize: 13 },
    editAccountDeleteRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
    editAccountDeleteText: { fontSize: 16, color: '#FF3B30', fontWeight: '500' },
    editAccountSaveBtn: {
        marginHorizontal: 16,
        borderRadius: 32,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 16,
    },
    editAccountSaveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

    // Exercise detail
    exerciseDetailContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20,
    },
    exerciseDetailTitle: { fontSize: 26, fontFamily: 'Poppins', marginBottom: 16 },
    exerciseDetailImageContainer: {
        width: '100%',
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 20,
    },
    exerciseDetailImage: { width: '100%', height: 220 },
    exerciseDetailInfoContainer: { width: '90%', padding: 16, borderRadius: 12 },
    exerciseDetailLabel: { fontSize: 14, opacity: 0.7 },
    exerciseDetailValue: { fontSize: 18, fontWeight: '600' },
    exerciseDetailDescriptionValue: { fontSize: 15, lineHeight: 22, marginTop: 4 },

    // Cards
    muscleCardContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        gap: 16,
        borderBottomWidth: 1,
    },
    muscleCardImage: { width: 64, height: 64, borderRadius: 32 },
    muscleCardTextContainer: { flex: 1 },
    muscleCardExerciseName: { fontSize: 16, fontWeight: '600' },
    muscleCardMuscleName: { marginTop: 4, fontSize: 14 },

    userCardContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        gap: 16,
        borderBottomWidth: 1,
    },
    userCardAvatarContainer: { width: 64, height: 64, borderRadius: 32 },
    userCardAvatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userCardAvatar: { width: 64, height: 64, borderRadius: 32 },
    userCardTextContainer: { flex: 1 },
    userCardUserName: { fontSize: 16, fontWeight: '600' },
    userCardFullName: { marginTop: 4, fontSize: 14 },

    // Misc screens
    trainContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    themeSwitchContainer: { flex: 1 },
    themeSwitchItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
    },
    themeSwitchText: { fontSize: 16 },
    themeSwitchControl: { marginLeft: 'auto', transform: [{ scale: 1.2 }] }


});
