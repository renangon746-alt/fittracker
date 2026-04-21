import { UserProvider } from '@/context/UserContext';
import { trainStyles } from '@/styles/train-styles';
import { useFonts } from 'expo-font';
import { Stack, router } from "expo-router";
import Head from 'expo-router/head';
import { createContext, useContext, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// ── Minimized routine context ────────────────────────────────────────────────
export interface MinimizedRoutine {
    id: string;
    nombre: string;
    seconds: number;
}

interface MinimizedCtx {
    minimized: MinimizedRoutine | null;
    openMinimized: (id: string, nombre: string, seconds: number) => void;
    closeMinimized: () => void;
    tickSeconds: () => void;
    currentSeconds: number;
}

export const MinimizedRoutineContext = createContext<MinimizedCtx>({
    minimized: null,
    openMinimized: () => {},
    closeMinimized: () => {},
    tickSeconds: () => {},
    currentSeconds: 0,
});

export function useMinimizedRoutine() {
    return useContext(MinimizedRoutineContext);
}

function MinimizedRoutineBar() {
    const { minimized, closeMinimized, currentSeconds } = useMinimizedRoutine();
    const { colors } = useTheme();
    const train_styles = trainStyles(colors);

    if (!minimized) return null;

    const h = Math.floor(currentSeconds / 3600);
    const m = Math.floor((currentSeconds % 3600) / 60);
    const s = currentSeconds % 60;
    const formatted = h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${m}:${String(s).padStart(2, '0')}`;

    return (
        <Pressable
            style={[train_styles.mb_bar, { backgroundColor: colors.primary }]}
            onPress={() => router.push({
                pathname: '/train/routine',
                params: { id: minimized.id, nombre: minimized.nombre },
            })}
        >
            <View style={train_styles.mb_left}>
                <Text style={train_styles.mb_title} numberOfLines={1}>{minimized.nombre}</Text>
                <Text style={train_styles.mb_sub}>Tap to resume</Text>
            </View>
            <Text style={train_styles.mb_timer}>{formatted}</Text>
            <Pressable style={train_styles.mb_close} onPress={closeMinimized}>
                <Text style={train_styles.mb_closeText}>✕</Text>
            </Pressable>
        </Pressable>
    );
}

export default function RootLayout() {
    const [loaded] = useFonts({
        Inter: require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
        Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
    });

    const [minimized, setMinimized] = useState<MinimizedRoutine | null>(null);
    const [currentSeconds, setCurrentSeconds] = useState(0);

    function openMinimized(id: string, nombre: string, seconds: number) {
        setMinimized({ id, nombre, seconds });
        setCurrentSeconds(seconds);
    }

    function closeMinimized() {
        setMinimized(null);
        setCurrentSeconds(0);
    }

    function tickSeconds() {
        setCurrentSeconds(s => s + 1);
    }

    if (!loaded) return null;

    return (
        <ThemeProvider>
            <UserProvider>
                <MinimizedRoutineContext.Provider value={{ minimized, openMinimized, closeMinimized, tickSeconds, currentSeconds }}>
                    <Head>
                        <title>FitTracker</title>
                        <meta name="description" content="App de seguimiento de ejercicios FitTracker" />
                    </Head>
                    <Stack>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/forgotPassword" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="errorPage" options={{ headerShown: false }} />
                        <Stack.Screen name="profile/profileDescription" options={{ headerShown: false }} />
                        <Stack.Screen name="profile/ownProfile" options={{ headerShown: false }} />
                        <Stack.Screen name="profile/editProfile" options={{ headerShown: false }} />
                        <Stack.Screen name="settings" options={{ headerShown: false }} />
                        <Stack.Screen name="train/routine" options={{ headerShown: false }} />
                    </Stack>
                    <MinimizedRoutineBar />
                </MinimizedRoutineContext.Provider>
            </UserProvider>
        </ThemeProvider>
    );
}
