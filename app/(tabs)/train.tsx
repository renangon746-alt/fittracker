import CreateRoutineModal from '@/components/train/CreateRoutineModal';
import RoutineFolder from '@/components/train/RoutineFolder';

import { useTheme } from '@/context/ThemeContext';
import { useCreateRoutine } from '@/hooks/train/useCreateRoutine';
import { useRoutines } from '@/hooks/train/useRoutines';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function Train() {
  const { colors } = useTheme();
  const global_styles = globalStyles(colors);
  const train_styles = trainStyles(colors);

  const { routinesByFolder, loading, refresh } = useRoutines();

  const {visible, openModal, closeModal, nombre, setNombre, carpeta, setCarpeta, saving, errorMsg, handleCreate} = useCreateRoutine(refresh);

  return (
    <SafeAreaView style={global_styles.defaultContainer}>
      <ScrollView contentContainerStyle={global_styles.defaultScroll}>

        {/* Title and search */}
        <View style={train_styles.t_tittleAndSearch}>
          <Text style={global_styles.tittleText}>Fast Start</Text>
          <Ionicons name="search" size={24} color={colors.textPrimary} />
        </View>

        {/* Buttons*/}
        <View style={train_styles.t_buttonContainer}>
          <Pressable style={[global_styles.principalButton, train_styles.t_buttonPressable]} onPress={openModal}>
            <Text style={global_styles.principalText}>Create new routine</Text>
          </Pressable>

          <Pressable style={[global_styles.secondaryButton, train_styles.t_buttonPressable]}>
            <Text style={global_styles.principalText}>Start empty training +</Text>
          </Pressable>
        </View>

        {/* Routines title */}
        <View style={train_styles.t_routinesTittle}>
          <Text style={global_styles.tittleText}>Routines</Text>
          <Ionicons name="folder-open" size={24} color={colors.textPrimary} />
        </View>

        {/* Collapsible folders */}
        <View style={train_styles.t_routinesFoldersList}>
          <RoutineFolder title="My Routines" routines={routinesByFolder.my_routines} loading={loading} />
          <RoutineFolder title="Routines Saved" routines={routinesByFolder.saved} loading={loading} />
          <RoutineFolder title="Other Folders" routines={routinesByFolder.other} loading={loading} />
        </View>

      </ScrollView>

      {/* Create routine modal */}
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
