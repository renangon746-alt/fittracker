import { LanguageProvider } from '@/context/LanguageContext';
import { UserProvider } from '@/context/UserContext';
import { SetRow } from '@/hooks/train/useRoutineDetail';
import { trainStyles } from '@/styles/train-styles';
import { useFonts } from 'expo-font';
import { Stack, router } from "expo-router";
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
    // Reactive state for UI components that need to re-render (MinimizedBar, stats)
    active: ActiveRoutine | null;
    // Stable ref — Routine reads this on mount without causing setState-during-render
    activeRef: React.MutableRefObject<ActiveRoutine | null>;
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

const stubRef = { current: null } as React.MutableRefObject<ActiveRoutine | null>;

export const ActiveRoutineContext = createContext<ActiveRoutineCtx>({
    active: null,
    activeRef: stubRef,
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
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // This ref is passed directly into context — stable across renders
    const activeRef = useRef<ActiveRoutine | null>(null);

    useEffect(() => {
        if (active && minimized) {
            timerRef.current = setInterval(() => {
                const prev = activeRef.current;
                if (!prev) return;
                const newRest = prev.restActive && prev.restSeconds > 0 ? prev.restSeconds - 1 : prev.restSeconds;
                const next = {
                    ...prev,
                    seconds: prev.seconds + 1,
                    restSeconds: newRest,
                    restActive: newRest > 0 && prev.restActive,
                };
                activeRef.current = next;
                setActive(next);
            }, 1000);
        } else {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [minimized, active?.id]);

    const navigateToRoutine = useCallback((id: string, nombre: string) => {
        const existing = activeRef.current;
        const next: ActiveRoutine = (existing && existing.id === id)
            ? existing
            : { id, nombre, seconds: 0, setsMap: {}, newRecordCount: 0, restSeconds: 0, restActive: false };
        // Write to ref synchronously — Routine will read this on its first render
        activeRef.current = next;
        // Schedule the state update separately so it doesn't race with navigation
        setActive(next);
        setMinimized(false);
        router.push({ pathname: '/train/routine', params: { id, nombre } });
    }, []);

    const tickSeconds = useCallback(() => {
        const prev = activeRef.current;
        if (!prev) return;
        const next = { ...prev, seconds: prev.seconds + 1 };
        activeRef.current = next;
        setActive(next);
    }, []);

    const updateSetsMap = useCallback((setsMap: SetsMap) => {
        const prev = activeRef.current;
        if (!prev) return;
        const next = { ...prev, setsMap };
        activeRef.current = next;
        setActive(next);
    }, []);

    const updateRecordCount = useCallback((n: number) => {
        const prev = activeRef.current;
        if (!prev) return;
        const next = { ...prev, newRecordCount: n };
        activeRef.current = next;
        setActive(next);
    }, []);

    const startRest = useCallback((seconds: number) => {
        const prev = activeRef.current;
        if (!prev) return;
        const next = { ...prev, restSeconds: seconds, restActive: true };
        activeRef.current = next;
        setActive(next);
    }, []);

    const addRestTime = useCallback((delta: number) => {
        const prev = activeRef.current;
        if (!prev) return;
        const newRest = Math.max(0, prev.restSeconds + delta);
        const next = { ...prev, restSeconds: newRest, restActive: newRest > 0 };
        activeRef.current = next;
        setActive(next);
    }, []);

    const stopRest = useCallback(() => {
        const prev = activeRef.current;
        if (!prev) return;
        const next = { ...prev, restSeconds: 0, restActive: false };
        activeRef.current = next;
        setActive(next);
    }, []);

    const clearActive = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        activeRef.current = null;
        setActive(null);
        setMinimized(false);
    }, []);

    return (
        <ActiveRoutineContext.Provider value={{
            active, activeRef, navigateToRoutine, tickSeconds,
            updateSetsMap, updateRecordCount, clearActive,
            minimized, setMinimized,
            startRest, addRestTime, stopRest,
        }}>
            {children}
        </ActiveRoutineContext.Provider>
    );
}

function AppStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
    const [loaded] = useFonts({
        Inter: require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
        Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
    });

    if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <ActiveRoutineProvider>
              <AppStatusBar />
              <Head>
                <title>FitTracker</title>
                <meta name="description" content="App de seguimiento de ejercicios FitTracker" />
              </Head>
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
                <Stack.Screen name="settings" options={{ headerShown: false }} />
                <Stack.Screen name="train/routine" options={{ headerShown: false }} />
              </Stack>
              <MinimizedRoutineBar />
            </ActiveRoutineProvider>
          </UserProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
