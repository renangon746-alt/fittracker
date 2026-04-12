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
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="auth/forgotPassword" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
        <Stack.Screen name="errorPage" options={{ headerShown: false }} />
        <Stack.Screen name="profile/profileDescription" options={{ headerShown: false }} />
        <Stack.Screen name="profile/ownProfile" options={{ headerShown: false }} />
        <Stack.Screen name="profile/editProfile" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
