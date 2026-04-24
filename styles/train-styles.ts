import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get('window').width;

export const trainStyles = (colors: any) =>
    StyleSheet.create({

        t_tittleAndSearch: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: 16
        },

        t_routinesTittle: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: 16
        },

        t_routinesFoldersList: {
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20
        },

        t_routineFolder: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingHorizontal: 25
        },

        t_routineFolderTextIcon: {
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 10
        },

        t_routinesList: {
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            marginTop: 20
        },

        t_buttonContainer: {
            alignItems: 'center',
            gap: 12
        },

        t_buttonPressable: {
            width: '90%',
            height: 40
        },

        r_tittle: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: 16
        },

        r_statistics: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: screenWidth < 350 ? 10 : 20
        },

        r_stat: {
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5
        },

        r_addExerciseButton: {
            alignItems: 'center',
            gap: 20,
            paddingVertical: 20
        },

        r_addExercisePressable: {
            width: '90%',
            height: 40
        },

        r_bottomBar: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingVertical: 12,
            paddingHorizontal: 20,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 10,
        },

        r_normalRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },

        r_restRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },

        r_restCenter: {
            flex: 1,
            alignItems: 'center',
        },

        r_adjustBtn: {
            paddingHorizontal: 12,
            paddingVertical: 8,
        },

        r_finishBtn: {
            alignSelf: 'center',
            marginTop: 10,
            paddingHorizontal: 32,
            height: 38,
        },

        r_playPauseButton: {
            backgroundColor: colors.primary,
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },

        r_bottomTimerBar: {
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
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },

        r_timeAdjustmentControls: {
            flexDirection: 'row',
            gap: 15,
            alignItems: 'center'
        },

        r_pauseButtonTimer:{
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap:20
        },

        rc_container: {
            width: '90%',
            height: 140,
            backgroundColor: colors.routineCard.background,
            borderRadius: 10,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.routineCard.border
        },

        rc_dayEdit: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
        },

        rc_routineTitle: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 10,
            marginTop: 10
        },

        rc_startButtonContainer: {
            alignItems: 'center',
            gap: 20,
            paddingHorizontal: 10,
            marginTop: 20
        },

        rc_startButtonPressable: {
            width: '90%',
            height: 40
        },

        rf_container: {
            width: '95%'
        },

        rf_actIndicator: {
            marginVertical: 12
        },

        rf_noRutinesYetLabel: {
            textAlign: 'center',
            paddingVertical: 12
        },

        crm_overlay: {
            flex: 1,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        },

        crm_card: {
            width: '100%',
            borderRadius: 20,
            padding: 24,
            borderWidth: 2,
            borderColor: colors.white,
            backgroundColor: colors.backgroundSecondary
        },

        crm_title: {
            marginBottom: 16,
            alignSelf: 'center'
        },

        crm_nameInputLabel: {
            marginBottom: 6
        },

        crm_input: {
            marginBottom: 16,
            alignSelf: 'center',
            width: '100%'
        },

        crm_folderSelectorLabel: {
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

        crm_folderChipLabel: {
            fontSize: 13
        },

        crm_errorMessage: {
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
        },

        ec_card: {
            borderRadius: 16,
            marginHorizontal: 16,
            marginBottom: 16,
            overflow: 'hidden',
        },

        ec_header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            gap: 10
        },

        ec_headerImage: {
            width: 48,
            height: 48,
            borderRadius: 24
        },

        ec_headerTitle: {
            flex: 1,
            fontSize: 16,
            fontWeight: '700'
        },

        ec_restRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingBottom: 10
        },

        ec_tableHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6
        },

        ec_setRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6
        },

        ec_colSet:  { 
            width: 32, 
            textAlign: 'center' 
        },

        ec_colPrev: { 
            flex: 2, 
            textAlign: 'center', 
            fontSize: 13 
        },

        ec_colKg:   { 
            flex:1,
            alignItems: 'center'
        },

        ec_colReps: { 
            alignItems: 'center' 
        },

        ec_colCheck: { 
            width: 36, 
            alignItems: 'center', 
            justifyContent: 'center' 
        },

        ec_input: {
            width: 52,
            textAlign: 'center',
            paddingVertical: 4,
            paddingHorizontal: 4,
            borderWidth: 1,
            borderRadius: 6
        },

        ec_checkBtn: {
            width: 30,
            height: 30,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center'
        },

        ec_addSetBtn: {
            paddingVertical: 14,
            borderTopWidth: 1
        },

        rtm_backdrop: {
            flex: 1,
            backgroundColor: colors.backgroundSecondary,
        },

        rtm_sheet: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingBottom: 32,
            alignItems: 'center',
        },

        rtm_handle: {
            width: 40,
            height: 4,
            borderRadius: 2,
            marginTop: 12,
            marginBottom: 8,
        },

        rtm_title: {
            marginBottom: 16,
        },

        rtm_pickerContainer: {
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
        },

        rtm_selectionBar: {
            position: 'absolute',
            left: 0,
            right: 0,
            borderRadius: 12,
            zIndex: 0,
        },

        rtm_item: {
            justifyContent: 'center',
            alignItems: 'center',
        },

        rtm_doneBtn: {
            marginTop: 20,
            width: '100%',
            height: 52,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },

        nro_overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
        },

        nro_card: {
            backgroundColor: colors.white,
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            gap: 12,
        },

        nro_logo: {
            width: 80,
            height: 80,
        },

        nro_text: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.black,
        },

        aem_overlay: {
            flex: 1,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'flex-end',
        },

        aem_card: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: '85%',
        },

        aem_searchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 12,
        },

        aem_list: {
            maxHeight: 340,
        },

        aem_row: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 8,
            borderRadius: 10,
            borderWidth: 1.5,
            marginBottom: 4,
            gap: 12,
        },

        aem_rowImage: {
            width: 44,
            height: 44,
            borderRadius: 22,
        },

        aem_actions: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 16,
        },

        aem_actionBtn: {
            flex: 1,
            height: 44,
        },

        mb_bar: {
            position: 'absolute',
            bottom: 49,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10,
            zIndex: 100,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 8,
        },

        mb_left: { 
            flex: 1 
        },

        mb_title: {
            color: colors.white, 
            fontWeight: '700', 
            fontSize: 14 
        },

        mb_sub: { 
            color: colors.white, 
            fontSize: 12 
        },

        mb_timer: { 
            color: colors.white, 
            fontWeight: '600', 
            fontSize: 16, 
            marginRight: 12 
        },

        mb_close: { 
            padding: 4 
        },

        mb_closeText: { 
            color: colors.white, 
            fontSize: 16 
        },
    });
