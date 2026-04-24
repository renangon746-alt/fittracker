import { UserProvider } from '@/context/UserContext';
import { SetRow } from '@/hooks/train/useRoutineDetail';
import { trainStyles } from '@/styles/train-styles';
import { useFonts } from 'expo-font';
import { Stack, router } from "expo-router";
import Head from 'expo-router/head';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Pressable, Text, View } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

export type SetsMap = Record<number, SetRow[]>;

export interface ActiveRoutine {
    id: string;
    nombre: string;
    seconds: number;
    setsMap: SetsMap;
    newRecordCount: number;
    restSeconds: number;
    restActive: boolean;
}

interface ActiveRoutineCtx {
    active: ActiveRoutine | null;
    navigateToRoutine: (id: string, nombre: string) => void;
    tickSeconds: () => void;
    updateSetsMap: (setsMap: SetsMap) => void;
    updateRecordCount: (n: number) => void;
    clearActive: () => void;
    minimized: boolean;
    setMinimized: (v: boolean) => void;
    startRest: (seconds: number) => void;
    addRestTime: (delta: number) => void;
    stopRest: () => void;
}

export const ActiveRoutineContext = createContext<ActiveRoutineCtx>({
    active: null,
    navigateToRoutine: () => {},
    tickSeconds: () => {},
    updateSetsMap: () => {},
    updateRecordCount: () => {},
    clearActive: () => {},
    minimized: false,
    setMinimized: () => {},
    startRest: () => {},
    addRestTime: () => {},
    stopRest: () => {},
});

export function useActiveRoutine() {
    return useContext(ActiveRoutineContext);
}

function MinimizedRoutineBar() {
    const { active, minimized, setMinimized, navigateToRoutine } = useActiveRoutine();
    const { colors } = useTheme();
    const train_styles = trainStyles(colors);

    if (!active || !minimized) return null;

    const s = active.seconds;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const formatted = h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
        : `${m}:${String(sec).padStart(2, '0')}`;

    const restLabel = active.restActive && active.restSeconds > 0
        ? ` · Rest ${Math.floor(active.restSeconds / 60)}:${String(active.restSeconds % 60).padStart(2, '0')}`
        : '';

    return (
        <Pressable
            style={[train_styles.mb_bar, { backgroundColor: colors.primary }]}
            onPress={() => {
                setMinimized(false);
                navigateToRoutine(active.id, active.nombre);
            }}
        >
            <View style={train_styles.mb_left}>
                <Text style={train_styles.mb_title} numberOfLines={1}>{active.nombre}{restLabel}</Text>
                <Text style={train_styles.mb_sub}>Tap to resume</Text>
            </View>
            <Text style={train_styles.mb_timer}>{formatted}</Text>
        </Pressable>
    );
}

function ActiveRoutineProvider({ children }: { children: React.ReactNode }) {
    const [active, setActive] = useState<ActiveRoutine | null>(null);
    const [minimized, setMinimized] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (active && minimized) {
            intervalRef.current = setInterval(() => {
                setActive(prev => {
                    if (!prev) return prev;
                    const newRest = prev.restActive && prev.restSeconds > 0 ? prev.restSeconds - 1 : prev.restSeconds;
                    return {
                        ...prev,
                        seconds: prev.seconds + 1,
                        restSeconds: newRest,
                        restActive: newRest > 0 && prev.restActive,
                    };
                });
            }, 1000);
        } else {
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [minimized, active?.id]);

    const navigateToRoutine = useCallback((id: string, nombre: string) => {
        // flushSync ensures setActive completes BEFORE router.push causes Routine to render
        flushSync(() => {
            setActive(prev => {
                if (prev && prev.id === id) return prev;
                return { id, nombre, seconds: 0, setsMap: {}, newRecordCount: 0, restSeconds: 0, restActive: false };
            });
            setMinimized(false);
        });
        router.push({ pathname: '/train/routine', params: { id, nombre } });
    }, []);

    const tickSeconds = useCallback(() => {
        setActive(prev => prev ? { ...prev, seconds: prev.seconds + 1 } : prev);
    }, []);

    const updateSetsMap = useCallback((setsMap: SetsMap) => {
        setActive(prev => prev ? { ...prev, setsMap } : prev);
    }, []);

    const updateRecordCount = useCallback((n: number) => {
        setActive(prev => prev ? { ...prev, newRecordCount: n } : prev);
    }, []);

    const startRest = useCallback((seconds: number) => {
        setActive(prev => prev ? { ...prev, restSeconds: seconds, restActive: true } : prev);
    }, []);

    const addRestTime = useCallback((delta: number) => {
        setActive(prev => {
            if (!prev) return prev;
            const next = Math.max(0, prev.restSeconds + delta);
            return { ...prev, restSeconds: next, restActive: next > 0 };
        });
    }, []);

    const stopRest = useCallback(() => {
        setActive(prev => prev ? { ...prev, restSeconds: 0, restActive: false } : prev);
    }, []);

    const clearActive = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setActive(null);
        setMinimized(false);
    }, []);

    return (
        <ActiveRoutineContext.Provider value={{
            active, navigateToRoutine, tickSeconds,
            updateSetsMap, updateRecordCount, clearActive,
            minimized, setMinimized,
            startRest, addRestTime, stopRest,
        }}>
            {children}
        </ActiveRoutineContext.Provider>
    );
}

export default function RootLayout() {
    const [loaded] = useFonts({
        Inter: require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
        Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
    });

    if (!loaded) return null;

    return (
        <ThemeProvider>
            <UserProvider>
                <ActiveRoutineProvider>
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
                </ActiveRoutineProvider>
            </UserProvider>
        </ThemeProvider>
    );
}
