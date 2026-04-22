import AddExerciseModal from '@/components/train/AddExerciseModal';
import ExerciseCard from '@/components/train/ExerciseCard';
import NewRecordOverlay from '@/components/train/NewRecordOverlay';
import { useTheme } from '@/context/ThemeContext';
import { useExercises } from '@/hooks/train/useExercises';
import { useRecords } from '@/hooks/train/useRecords';
import { useRestTimer } from '@/hooks/train/useRestTimer';
import { SetRow, useRoutineDetail } from '@/hooks/train/useRoutineDetail';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetsMap, useActiveRoutine } from '../_layout';

const screenWidth = Dimensions.get('window').width;
const BOTTOM_BAR_HEIGHT = 110;

export default function Routine() {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);

    const { id, nombre } = useLocalSearchParams<{ id: string; nombre: string }>();
    const routineId = Number(id);

    const {
        active, startOrResume, tickSeconds,
        updateSetsMap, updateRecordCount, clearActive, setMinimized,
    } = useActiveRoutine();

    // On mount: start new session or resume existing one
    useEffect(() => {
        startOrResume(id, nombre ?? 'Routine');
    }, [id]);

    // Local timer — driven by interval, syncs to context every second
    const [localSeconds, setLocalSeconds] = useState(active?.id === id ? active.seconds : 0);
    const [running, setRunning] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Sync local seconds from context when resuming
        if (active?.id === id) setLocalSeconds(active.seconds);
    }, []); // only on mount

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setLocalSeconds(s => {
                    const next = s + 1;
                    tickSeconds(); // keep context in sync
                    return next;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running]);

    // setsMap lives in context — read it from there, write back on change
    const setsMap: SetsMap = active?.id === id ? (active.setsMap ?? {}) : {};

    function getSets(idRutinaEjercicio: number): SetRow[] {
        return setsMap[idRutinaEjercicio] ?? [{ num: 1, kg: '', reps: '', done: false }];
    }

    function handleSetsChange(idRutinaEjercicio: number, sets: SetRow[]) {
        const updated = { ...setsMap, [idRutinaEjercicio]: sets };
        updateSetsMap(updated);
    }

    const { exercises, addExercise, updateRestTime, finishRoutine } = useRoutineDetail(routineId);
    const { exercises: allExercises, loading: loadingAll } = useExercises();
    const exerciseIds = exercises.map(e => e.id_ejercicio);
    const records = useRecords(exerciseIds);
    const { active: restActive, formatted: restFormatted, startRest, addTime, stopRest } = useRestTimer();

    const [modalVisible, setModalVisible] = useState(false);
    const [recordVisible, setRecordVisible] = useState(false);
    const newRecordCount = active?.id === id ? (active.newRecordCount ?? 0) : 0;

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
        const next = newRecordCount + 1;
        updateRecordCount(next);
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
                        await finishRoutine(localSeconds, setsMap);
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
        // Stop local interval — context timer takes over
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
                        onSetDone={restSecs => startRest(restSecs)}
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
                            <Pressable style={train_styles.r_adjustBtn} onPress={() => addTime(-15)}>
                                <Text style={[global_styles.principalText, { fontSize: 14 }]}>-15s</Text>
                            </Pressable>
                            <View style={train_styles.r_restCenter}>
                                <Text style={[global_styles.secondaryText, { color: colors.primary, marginBottom: 2 }]}>Rest</Text>
                                <Text style={[global_styles.tittleText, { fontSize: 28 }]}>{restFormatted}</Text>
                                <Pressable onPress={stopRest}>
                                    <Text style={[global_styles.secondaryText, { color: colors.textSecondary, fontSize: 12 }]}>Skip</Text>
                                </Pressable>
                            </View>
                            <Pressable style={train_styles.r_adjustBtn} onPress={() => addTime(15)}>
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
