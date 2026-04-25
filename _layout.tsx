import { UserProvider } from '@/context/UserContext';
import { SetRow } from '@/hooks/train/useRoutineDetail';
import { trainStyles } from '@/styles/train-styles';
import { useFonts } from 'expo-font';
import { Stack, router } from "expo-router";
import Head from 'expo-router/head';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// ── Types ────────────────────────────────────────────────────────────────────
export type SetsMap = Record<number, SetRow[]>;

export interface ActiveRoutine {
    id: string;
    nombre: string;
    seconds: number;       // persisted elapsed seconds
    setsMap: SetsMap;      // all set data
    newRecordCount: number;
}

interface ActiveRoutineCtx {
    active: ActiveRoutine | null;
    // Called when routine screen mounts — starts a new session or resumes existing
    startOrResume: (id: string, nombre: string) => void;
    // Called every second from routine screen to keep seconds in sync
    tickSeconds: () => void;
    // Update sets from routine screen
    updateSetsMap: (setsMap: SetsMap) => void;
    updateRecordCount: (n: number) => void;
    // Clear everything on finish/discard
    clearActive: () => void;
    // Whether the routine is minimized (screen navigated away but still active)
    minimized: boolean;
    setMinimized: (v: boolean) => void;
}

export const ActiveRoutineContext = createContext<ActiveRoutineCtx>({
    active: null,
    startOrResume: () => {},
    tickSeconds: () => {},
    updateSetsMap: () => {},
    updateRecordCount: () => {},
    clearActive: () => {},
    minimized: false,
    setMinimized: () => {},
});

export function useActiveRoutine() {
    return useContext(ActiveRoutineContext);
}

// ── Minimized bar ────────────────────────────────────────────────────────────
function MinimizedRoutineBar() {
    const { active, minimized, setMinimized } = useActiveRoutine();
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

    return (
        <Pressable
            style={[train_styles.mb_bar, { backgroundColor: colors.primary }]}
            onPress={() => {
                setMinimized(false);
                router.push({
                    pathname: '/train/routine',
                    params: { id: active.id, nombre: active.nombre },
                });
            }}
        >
            <View style={train_styles.mb_left}>
                <Text style={train_styles.mb_title} numberOfLines={1}>{active.nombre}</Text>
                <Text style={train_styles.mb_sub}>Tap to resume</Text>
            </View>
            <Text style={train_styles.mb_timer}>{formatted}</Text>
            <Pressable style={train_styles.mb_close} onPress={() => {/* discard handled in routine screen */}}>
                <Text style={train_styles.mb_closeText}>✕</Text>
            </Pressable>
        </Pressable>
    );
}

// ── Provider ─────────────────────────────────────────────────────────────────
function ActiveRoutineProvider({ children }: { children: React.ReactNode }) {
    const [active, setActive] = useState<ActiveRoutine | null>(null);
    const [minimized, setMinimized] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Timer runs here in the provider — never stops when screen unmounts
    useEffect(() => {
        if (active && !minimized) {
            // Screen is open — let the screen drive ticks via tickSeconds()
            if (timerRef.current) clearInterval(timerRef.current);
        } else if (active && minimized) {
            // Screen is minimized — provider drives the timer
            timerRef.current = setInterval(() => {
                setActive(prev => prev ? { ...prev, seconds: prev.seconds + 1 } : prev);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [minimized, active?.id]);

    function startOrResume(id: string, nombre: string) {
        setActive(prev => {
            // If same routine already active, resume it — don't reset
            if (prev && prev.id === id) return prev;
            // New routine
            return { id, nombre, seconds: 0, setsMap: {}, newRecordCount: 0 };
        });
        setMinimized(false);
    }

    function tickSeconds() {
        setActive(prev => prev ? { ...prev, seconds: prev.seconds + 1 } : prev);
    }

    function updateSetsMap(setsMap: SetsMap) {
        setActive(prev => prev ? { ...prev, setsMap } : prev);
    }

    function updateRecordCount(n: number) {
        setActive(prev => prev ? { ...prev, newRecordCount: n } : prev);
    }

    function clearActive() {
        if (timerRef.current) clearInterval(timerRef.current);
        setActive(null);
        setMinimized(false);
    }

    return (
        <ActiveRoutineContext.Provider value={{
            active, startOrResume, tickSeconds,
            updateSetsMap, updateRecordCount, clearActive,
            minimized, setMinimized,
        }}>
            {children}
        </ActiveRoutineContext.Provider>
    );
}

// ── Root layout ──────────────────────────────────────────────────────────────
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
