import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get('window').width;

export const trainStyles = (colors: any) =>
    StyleSheet.create({
        
        t_tittleAndSearch:{
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '100%', 
        padding: 16
        },

        t_routinesTittle:{
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%', 
            padding: 16
        },

        t_routinesFoldersList:{
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 20
        },

        t_routineFolder:{
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%', 
            paddingHorizontal: 25
        },

        t_routineFolderTextIcon:{
            flexDirection: 'row', 
            alignItems: 'baseline', 
            gap: 10
        },

        t_routinesList:{
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 20,
            marginTop: 20
        },

        r_tittle:{
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%', 
            padding: 16
        },

        r_statistics:{
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: screenWidth < 350 ? 10 : 20
        },

        r_stat:{
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 5
        },

        r_AddEmptyRoutineButton:{
            alignItems: 'center', 
            gap: 20, 
            paddingVertical: 20
        },

        r_bottomTimerBar:{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.backgroundSecondary || '#2a2a2a',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingVertical: 12,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },

        r_playPauseButton:{
            backgroundColor: '#FF9500',
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },

        r_timeAdjustmentControls:{
            flexDirection: 'row', 
            gap: 15, 
            alignItems: 'center'
        }

    });
