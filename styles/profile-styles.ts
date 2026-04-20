import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get('window').width;

export const profileStyles = (colors: any) =>
    StyleSheet.create({
        auth_container:{
            flex: 1, 
            backgroundColor: colors.backgroundPrimary, 
            flexDirection: 'column',
            alignItems: 'center', 
            paddingTop: 100
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

        p_charts:{
            paddingHorizontal: 10, 
            marginTop: 20
        }
    });