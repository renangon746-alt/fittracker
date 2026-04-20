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
    }


});
