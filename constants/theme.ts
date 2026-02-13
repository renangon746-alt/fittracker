
// Colores para modo oscuro (default)
export const darkColors = {
  backgroundPrimary: '#0A0A0A',    // Fondo general
  backgroundSecondary: '#121212',  // Tarjetas, contenedores
  backgroundTertiary: '#1E1E1E',   // Inputs, elementos secundarios
  primary: '#FF6B00',               // Acciones principales
  primaryActive: '#FF7F26',         // Hover/Pressed
  textPrimary: '#FFFFFF',           // Titulares y textos sobre fondo oscuro
  textSecondary: '#B5B5B5',         // Descripciones y menor jerarquía
  textDisabled: '#6F6F6F',          // Elementos inactivos
  border: '#1A1A1A',                // Divisores y bordes
  iconActive: '#FF6B00',            // Iconografía activa
  iconInactive: '#6F6F6F',          // Iconografía inactiva
};

// Colores para modo claro (accesible)
export const lightColors = {
  backgroundPrimary: '#FFFFFF',     // Fondo general
  backgroundSecondary: '#F2F2F2',   // Tarjetas, contenedores
  backgroundTertiary: '#E0E0E0',    // Inputs, elementos secundarios
  primary: '#FF6B00',               // Acciones principales (mismo naranja)
  primaryActive: '#FF7F26',         // Hover/Pressed
  textPrimary: '#121212',           // Titulares y textos sobre fondo claro
  textSecondary: '#555555',         // Descripciones y menor jerarquía
  textDisabled: '#A0A0A0',          // Elementos inactivos
  border: '#CCCCCC',                // Divisores y bordes
  iconActive: '#FF6B00',            // Iconografía activa
  iconInactive: '#A0A0A0',          // Iconografía inactiva
};

// Export helper: devuelve colores según el esquema actual
import { useColorScheme } from 'react-native';

export const useThemeColors = () => {
  const scheme = useColorScheme(); // 'dark' | 'light'
  return scheme === 'dark' ? darkColors : lightColors;
};
