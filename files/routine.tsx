import AddExerciseModal from '@/components/train/AddExerciseModal';
import ExerciseCard from '@/components/train/ExerciseCard';
import NewRecordOverlay from '@/components/train/NewRecordOverlay';
import { useTheme } from '@/context/ThemeContext';
import { useExercises } from '@/hooks/train/useExercises';
import { useRecords } from '@/hooks/train/useRecords';
import { SetRow, useRoutineDetail } from '@/hooks/train/useRoutineDetail';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import the full ActiveRoutine type so TS knows about restActive/restSeconds
import { ActiveRoutine, SetsMap, useActiveRoutine } from '../_layout';

const screenWidth = Dimensions.get('window').width;
const BOTTOM_BAR_HEIGHT = 110;

export default function Routine() {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);

    const { id, nombre } = useLocalSearchParams<{ id: string; nombre: string }>();
    const routineId = Number(id);

    const {
        active,
        startOrResume,
        tickSeconds,
        updateSetsMap,
        updateRecordCount,
        clearActive,
        setMinimized,
        startRest,
        addRestTime,
        stopRest,
    } = useActiveRoutine();

    // Cast to full type so TS sees restActive/restSeconds
    const activeRoutine = active as ActiveRoutine | null;
    const isCurrentRoutine = activeRoutine?.id === id;

    // On mount: start new session or resume existing
    useEffect(() => {
        startOrResume(id, nombre ?? 'Routine');
    }, [id]);

    // Local timer
    const [localSeconds, setLocalSeconds] = useState(0);
    const [running, setRunning] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const initialSyncDone = useRef(false);

    // Sync from context once on mount (resume case)
    useEffect(() => {
        if (isCurrentRoutine && !initialSyncDone.current && activeRoutine) {
            setLocalSeconds(activeRoutine.seconds);
            initialSyncDone.current = true;
        }
    }, [activeRoutine?.id]);

    // Ref so interval closure always reads latest restActive without recreating
    const restActiveRef = useRef(false);
    restActiveRef.current = isCurrentRoutine ? (activeRoutine?.restActive ?? false) : false;

    // Main timer interval — also drives rest countdown while screen is open
    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setLocalSeconds(s => { tickSeconds(); return s + 1; });
                if (restActiveRef.current) addRestTime(-1);
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running]);

    // Rest state from context
    const restActive: boolean = isCurrentRoutine ? (activeRoutine?.restActive ?? false) : false;
    const restSeconds: number = isCurrentRoutine ? (activeRoutine?.restSeconds ?? 0) : 0;
    const restFormatted = `${Math.floor(restSeconds / 60)}:${String(restSeconds % 60).padStart(2, '0')}`;

    // setsMap from context
    const setsMap: SetsMap = isCurrentRoutine ? (activeRoutine?.setsMap ?? {}) : {};

    function getSets(idRutinaEjercicio: number): SetRow[] {
        return setsMap[idRutinaEjercicio] ?? [{ num: 1, kg: '', reps: '', done: false }];
    }

    function handleSetsChange(idRutinaEjercicio: number, sets: SetRow[]) {
        updateSetsMap({ ...setsMap, [idRutinaEjercicio]: sets });
    }

    const { exercises, addExercise, updateRestTime, finishRoutine } = useRoutineDetail(routineId);
    const { exercises: allExercises, loading: loadingAll } = useExercises();
    const exerciseIds = exercises.map(e => e.id_ejercicio);
    const records = useRecords(exerciseIds);

    const [modalVisible, setModalVisible] = useState(false);
    const [recordVisible, setRecordVisible] = useState(false);
    const newRecordCount = isCurrentRoutine ? (activeRoutine?.newRecordCount ?? 0) : 0;

    const formatted = (() => {
        const s = localSeconds;
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        return `${m}:${String(sec).padStart(2, '0')}`;
    })();

    async function handleAddExercise(idEjercicio: number) {
        setModalVisible(false);
        await addExercise(idEjercicio);
    }

    function handleNewRecord() {
        updateRecordCount(newRecordCount + 1);
        setRecordVisible(true);
        setTimeout(() => setRecordVisible(false), 2500);
    }

    function allSetsDone(): boolean {
        return exercises.every(ex => {
            const sets = getSets(ex.id_rutina_ejercicio);
            return sets.length > 0 && sets.every(s => s.done);
        });
    }

    async function handleFinish() {
        const pendingSets = !allSetsDone();
        Alert.alert(
            'Finish Routine',
            pendingSets ? 'You have incomplete sets. Are you sure?' : 'Great job! Save this workout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Finish',
                    style: pendingSets ? 'destructive' : 'default',
                    onPress: async () => {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        // Read setsMap fresh from context at the moment of saving
                        const currentSetsMap = (active as ActiveRoutine | null)?.setsMap ?? {};
                        await finishRoutine(localSeconds, currentSetsMap);
                        clearActive();
                        router.back();
                    },
                },
            ]
        );
    }

    function handleDiscard() {
        Alert.alert('Discard Workout', 'This workout will not be saved. Discard?', [
            { text: 'Keep going', style: 'cancel' },
            {
                text: 'Discard', style: 'destructive', onPress: () => {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    clearActive();
                    router.back();
                },
            },
        ]);
    }

    function handleMinimize() {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setMinimized(true);
        router.back();
    }

    const completedSets = Object.values(setsMap).flat().filter((s: SetRow) => s.done).length;

    return (
        <SafeAreaView style={[global_styles.defaultContainer, { flex: 1 }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: BOTTOM_BAR_HEIGHT + 16 }}>

                <View style={train_styles.r_tittle}>
                    <Pressable onPress={handleMinimize}>
                        <Ionicons name="chevron-down" size={20} color={colors.textPrimary} />
                    </Pressable>
                    <Text style={global_styles.tittleText}>{nombre ?? 'Routine'}</Text>
                    <Pressable onPress={handleDiscard}>
                        <Ionicons name="close" size={24} color={colors.textPrimary} />
                    </Pressable>
                </View>

                <View style={train_styles.r_statistics}>
                    <View style={train_styles.r_stat}>
                        <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 16 }]}>Duration</Text>
                        <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>{formatted}</Text>
                    </View>
                    <View style={train_styles.r_stat}>
                        <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 16 }]}>Records</Text>
                        <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>{newRecordCount}</Text>
                    </View>
                    <View style={train_styles.r_stat}>
                        <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 16 }]}>Sets</Text>
                        <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>{completedSets}</Text>
                    </View>
                </View>

                <View style={global_styles.separator} />

                {exercises.map(ex => (
                    <ExerciseCard
                        key={ex.id_rutina_ejercicio}
                        exercise={ex}
                        sets={getSets(ex.id_rutina_ejercicio)}
                        onSetsChange={sets => handleSetsChange(ex.id_rutina_ejercicio, sets)}
                        record={records[ex.id_ejercicio] ?? null}
                        onSetDone={secs => startRest(secs)}
                        onRestTimeChanged={secs => updateRestTime(ex.id_rutina_ejercicio, secs)}
                        onNewRecord={handleNewRecord}
                    />
                ))}

                <View style={train_styles.r_addExerciseButton}>
                    <Pressable
                        style={[global_styles.principalButton, train_styles.r_addExercisePressable]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={global_styles.principalText}>+ Add Exercise</Text>
                    </Pressable>
                </View>

            </ScrollView>

            {/* Bottom bar */}
            <View style={[train_styles.r_bottomBar, { backgroundColor: colors.backgroundSecondary }]}>
                {restActive ? (
                    <>
                        <View style={train_styles.r_restRow}>
                            <Pressable style={train_styles.r_adjustBtn} onPress={() => addRestTime(-15)}>
                                <Text style={[global_styles.principalText, { fontSize: 14 }]}>-15s</Text>
                            </Pressable>
                            <View style={train_styles.r_restCenter}>
                                <Text style={[global_styles.secondaryText, { color: colors.primary, marginBottom: 2 }]}>Rest</Text>
                                <Text style={[global_styles.tittleText, { fontSize: 28 }]}>{restFormatted}</Text>
                                <Pressable onPress={stopRest}>
                                    <Text style={[global_styles.secondaryText, { color: colors.textSecondary, fontSize: 12 }]}>Skip</Text>
                                </Pressable>
                            </View>
                            <Pressable style={train_styles.r_adjustBtn} onPress={() => addRestTime(15)}>
                                <Text style={[global_styles.principalText, { fontSize: 14 }]}>+15s</Text>
                            </Pressable>
                        </View>
                        <Pressable
                            style={[global_styles.principalButton, train_styles.r_finishBtn]}
                            onPress={handleFinish}
                        >
                            <Text style={[global_styles.principalText, { fontSize: 13 }]}>Finish Routine</Text>
                        </Pressable>
                    </>
                ) : (
                    <View style={train_styles.r_normalRow}>
                        <Text style={[global_styles.principalText, { fontSize: 18, fontWeight: '600' }]}>{formatted}</Text>
                        <Pressable onPress={() => setRunning(r => !r)} style={train_styles.r_playPauseButton}>
                            <Ionicons name={running ? 'pause' : 'play'} size={24} color="#000" />
                        </Pressable>
                        <Pressable
                            style={[global_styles.principalButton, { paddingHorizontal: 18, height: 36 }]}
                            onPress={handleFinish}
                        >
                            <Text style={[global_styles.principalText, { fontSize: 13 }]}>Finish</Text>
                        </Pressable>
                    </View>
                )}
            </View>

            <NewRecordOverlay visible={recordVisible} />
            <AddExerciseModal
                visible={modalVisible}
                exercises={allExercises}
                loadingExercises={loadingAll}
                onAdd={handleAddExercise}
                onCancel={() => setModalVisible(false)}
            />
        </SafeAreaView>
    );
}
