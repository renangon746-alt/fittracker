import { useActiveRoutine } from '@/app/_layout';
import CreateRoutineModal from '@/components/train/CreateRoutineModal';
import RoutineFolder from '@/components/train/RoutineFolder';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useCreateRoutine } from '@/hooks/train/useCreateRoutine';
import { useRoutines } from '@/hooks/train/useRoutines';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function Train() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const global_styles = globalStyles(colors);
  const train_styles = trainStyles(colors);

  const { routinesByFolder, loading, refresh } = useRoutines();
  const { navigateToRoutine } = useActiveRoutine();

  useFocusEffect(useCallback(() => { refresh(); }, []));

  const { visible, openModal, closeModal, nombre, setNombre, carpeta, setCarpeta, saving, errorMsg, handleCreate } = useCreateRoutine(refresh);

  function handleEmptyTraining() {
    navigateToRoutine('empty', 'Empty Workout');
  }

  return (
    <SafeAreaView style={global_styles.defaultContainer}>
      <ScrollView contentContainerStyle={global_styles.defaultScroll} style={{backgroundColor: colors.backgroundSecondary}}>

        <View style={train_styles.t_tittleAndSearch}>
          <Text style={global_styles.tittleText}>{t('fast_start')}</Text>
        </View>

        <View style={train_styles.t_buttonContainer}>
          <Pressable style={[global_styles.principalButton, train_styles.t_buttonPressable]} onPress={openModal}>
            <Text style={global_styles.principalText}>{t('create_new_routine')}</Text>
          </Pressable>
          <Pressable style={[global_styles.secondaryButton, train_styles.t_buttonPressable]} onPress={handleEmptyTraining}>
            <Text style={global_styles.principalText}>{t('start_empty_training')}</Text>
          </Pressable>
        </View>

        <View style={train_styles.t_routinesTittle}>
          <Text style={global_styles.tittleText}>{t('routines')}</Text>
          <Ionicons name="folder-open" size={24} color={colors.textPrimary} />
        </View>

        
        <View style={train_styles.t_routinesFoldersList}>
          <RoutineFolder title={t('my_routines')} routines={routinesByFolder.my_routines} loading={loading} onRefresh={refresh} />
          <RoutineFolder title={t('routines_saved')} routines={routinesByFolder.saved} loading={loading} onRefresh={refresh} />
          <RoutineFolder title={t('other_folders')} routines={routinesByFolder.other} loading={loading} onRefresh={refresh} />
        </View>

      </ScrollView>

      <CreateRoutineModal
        visible={visible}
        nombre={nombre}
        setNombre={setNombre}
        carpeta={carpeta}
        setCarpeta={setCarpeta}
        saving={saving}
        errorMsg={errorMsg}
        onConfirm={handleCreate}
        onCancel={closeModal}
      />
    </SafeAreaView>
  );
}
