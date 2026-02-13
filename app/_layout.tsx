import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  //Cargamos la tipografia y estara disponible en el resto del proyecto
  const [loaded] = useFonts({
    Inter : require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    Poppins : require('../assets/fonts/Poppins-Regular.ttf')
  });

  if(!loaded){
    return null;
  }

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false}}></Stack.Screen>
      </Stack>
    </ThemeProvider>
  );
}
