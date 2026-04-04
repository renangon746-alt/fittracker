import { StyleSheet } from "react-native";

export const globalStyles = (colors: any) =>
    StyleSheet.create({

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

    profileImage:{
        borderRadius: 50,
        width: 50,
        height: 50
    }

});
