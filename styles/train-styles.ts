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
        
        t_buttonContainer:{
            alignItems: 'center',
            gap: 12 
        },

        t_buttonPressable:{
            width: '90%', 
            height: 40 
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

        r_addExerciseButton:{
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
        },

        r_addExercisePressable:{
            width: '90%', 
            height: 40
        },

        rc_container:{
            width: '90%', 
            height: 140, 
            backgroundColor: colors.routineCard.background, 
            borderRadius: 10, 
            padding: 16, 
            borderWidth: 1, 
            borderColor: colors.routineCard.border
        },

        rc_dayEdit:{
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%'
        },

        rc_routineTitle:{
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingHorizontal: 10, 
            marginTop: 10
        },

        rc_startButtonContainer:{
            alignItems: 'center', 
            gap: 20, 
            paddingHorizontal: 10, 
            marginTop: 20
        },

        rc_startButtonPressable:{
            width: '90%', 
            height: 40
        },

        rf_container:{
            width:'95%'
        },

        rf_actIndicator:{
            marginVertical: 12
        },

        rf_noRutinesYetLabel:{
            textAlign: 'center', paddingVertical: 12 
        },

        crm_overlay:{
            flex: 1,
            backgroundColor: colors,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        },

        crm_card: {
            width: '100%',
            borderRadius: 20,
            padding: 24,
            borderWidth: 2,        
            borderColor: '#fff', 
            backgroundColor: colors.backgroundSecondary  
        },

        crm_title:{
            marginBottom: 16, 
            alignSelf: 'center'
        },

        crm_nameInputLabel:{
            marginBottom: 6 
        },

        crm_input:{
            marginBottom: 16, 
            alignSelf: 'center', 
            width: '100%'
        },

        crm_folderSelectorLabel:{
            marginBottom: 8 
        },

        crm_folderOptions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
        },

        crm_folderChip: {
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: colors.primary,
        },

        crm_folderChipLabel:{
            fontSize: 13
        },

        crm_errorMessage:{
            color: 'red', 
            marginTop: 8 
        },

        crm_actions: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 8,
        },

        crm_actionBtn: {
            flex: 1,
            height: 44,
        }
    });
