import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Octicons from '@expo/vector-icons/Octicons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

export default function Settings() {

  const router = useRouter();
  const { colors } = useTheme(); // obtenemos los colores según tema

  // Estilos dinámicos usando colors
  const styles = StyleSheet.create({
    text: {
      fontFamily: 'Inter',
      color: colors.textPrimary, // texto principal cambia según tema
    },
    pressable: {
      flexDirection: "row",
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: 24,
      gap: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border, // divider dinámico
      backgroundColor: colors.backgroundPrimary, // fondo dinámico
    },
  });

  return (
    <ScrollView style={{ backgroundColor: colors.backgroundPrimary }}>
      
      {/* Perfil */}
      <Pressable style={styles.pressable}  onPress={() => router.push("/ownProfile")}>
        <FontAwesome5 
          name="user"
          size={24}
          color={colors.iconInactive} // icono activo dinámico
        />
        <Text style={styles.text}>Profile & privacy</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          color={colors.iconInactive} // icono inactivo dinámico
          style={{ marginLeft: 'auto' }}
        />
      </Pressable>

      {/* Tema */}
      <Pressable 
        style={styles.pressable} 
        onPress={() => router.push("/themeSwitch")} // navegación a pantalla Theme
      >
        <FontAwesome
          name="moon-o"
          size={24}
          color={colors.iconInactive}
        />
        <Text style={styles.text}>Theme</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          color={colors.iconInactive}
          style={{ marginLeft: 'auto' }}
        />
      </Pressable>

      {/* Versión */}
      <Pressable style={styles.pressable}>
        <Octicons 
          name="versions"
          size={24}
          color={colors.iconInactive}
        />
        <Text style={styles.text}>Version</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          color={colors.iconInactive}
          style={{ marginLeft: 'auto' }}
        />
      </Pressable>

    </ScrollView>
  );
}
