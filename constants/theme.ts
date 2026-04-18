// Colores para modo oscuro (default)
export const darkColors = {
  backgroundPrimary: '#121212',
  backgroundSecondary: '#0A0A0A',
  backgroundTertiary: '#1E1E1E',
  primary: '#FF6B00',
  primaryActive: '#FF7F26',
  textPrimary: '#FFFFFF',
  textSecondary: '#B5B5B5',
  textDisabled: '#6F6F6F',
  border: '#1A1A1A',
  iconActive: '#FF6B00',
  iconInactive: '#6F6F6F',
  
  // Colores del calendario
  calendar: {
    background: '#1E2923',
    containerBg: '#08130D',
    textSection: '#FFFFFF',
    selectedDay: '#FF6B00',        
    selectedDayText: '#FFFFFF',
    today: '#FF6B00',              
    dayText: '#FFFFFF',
    disabledText: '#6F6F6F',      
    dot: '#FF6B00',               
    selectedDot: '#FFFFFF',
    arrow: '#FF6B00',             
    monthText: '#FFFFFF',
  },

  routineCard: {
    background: '#1E2923',
    title: '#FFFFFF',
    day: '#B5B5B5',
    border: '#988f8f'
  }
};

// Colores para modo claro (accesible)
export const lightColors = {
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F2F2F2',
  backgroundTertiary: '#E0E0E0',
  primary: '#FF6B00',
  primaryActive: '#FF7F26',
  textPrimary: '#121212',
  textSecondary: '#555555',
  textDisabled: '#A0A0A0',
  border: '#CCCCCC',
  iconActive: '#FF6B00',
  iconInactive: '#A0A0A0',
  
  // Colores del calendario para modo claro
  calendar: {
    background: '#FFFFFF',
    containerBg: '#F2F2F2',
    textSection: '#121212',
    selectedDay: '#FF6B00',
    selectedDayText: '#FFFFFF',
    today: '#FF6B00',
    dayText: '#121212',
    disabledText: '#A0A0A0',
    dot: '#FF6B00',
    selectedDot: '#FFFFFF',
    arrow: '#FF6B00',
    monthText: '#121212',
  },
  routineCard: {
    background: '#FFFFFF',
    title: '#121212',
    day: '#555555',
    border: '#988f8f'
  }
};

// Export helper: devuelve colores según el esquema actual
import { useColorScheme } from 'react-native';

export const useThemeColors = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
};