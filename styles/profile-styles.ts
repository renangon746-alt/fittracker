import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get('window').width;

export const profileStyles = (colors: any) =>
    StyleSheet.create({
        auth_container:{
            flex: 1, 
            backgroundColor: colors.backgroundSecondary, 
            flexDirection: 'column',
            alignItems: 'center', 
            paddingTop: 100
        },

        loadProfileContainer:{
            flex: 1, 
            backgroundColor: colors.backgroundPrimary, 
            justifyContent: 'center', 
            alignItems: 'center' 
        },

        loadProfileLabel:{
            marginTop: 10
        },

        loadProfileErrorContainer:{
            flex: 1, backgroundColor: colors.backgroundPrimary, justifyContent: 'center', alignItems: 'center', padding: 20
        },

        loadProfileErrorLabel:{
            color: 'red', 
            marginBottom: 10
        },

        loadProfileErrorMessage:{
            textAlign: 'center' 
        },

        loadProfileErrorReturn:{
            marginTop: 20
        },

        loadProfileSuccesMessage:{
            color: 'green', 
            paddingTop: 10
        },
 
        p_headerContainer:{
            alignItems: 'center', 
            paddingHorizontal: 20, 
            marginTop: 10
        },

        p_avatarUsernameContainer:{
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: screenWidth < 350 ? 15 : 30, marginBottom: 10
        },

        p_profileStatsContainer:{
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: screenWidth < 350 ? 10 : 20, 
            marginTop: 15
        },

        p_stat:{
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 5
        },

        p_charts:{
            paddingHorizontal: 10, 
            marginTop: 20
        },
        
        p_bio:{
            textAlign: 'center'
        },

        p_link:{
            textAlign: 'center',
            color: colors.primary
        },

        op_bio:{
            marginTop: 20, 
            width: '100%'
        },

        pd_bioFollowButton:{
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: 15, width: '100%', 
            marginTop: 20 
        },

        pd_followPressable:{
            width: 100, 
            height: 35
        },

        auth_inputContainer:{
            paddingTop: 20
        },

        auth_inputLabel:{
            paddingLeft: 10
        },

        auth_registerButtonContainer:{
            padding: 10
        },

        l_passwordContainer:{
            paddingTop: 20
        },

        buttonContainer:{
            padding:10
        }
    });