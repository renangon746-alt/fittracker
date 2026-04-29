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
import { Alert, Dimensions, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActiveRoutine, SetsMap, useActiveRoutine } from '../_layout';

const screenWidth = Dimensions.get('window').width;
const BOTTOM_BAR_HEIGHT = 110;
const EMPTY_SETS_MAP: SetsMap = {};

function confirm(message: string): Promise<boolean> {
    if (Platform.OS === 'web') return Promise.resolve(window.confirm(message));
    return new Promise(resolve => {
        Alert.alert('Confirm', message, [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'OK', onPress: () => resolve(true) },
        ]);
    });
}

export default function Routine() {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);

    const { id, nombre, editMode: editModeParam } = useLocalSearchParams<{ id: string; nombre: string; editMode?: string }>();
    const routineId = Number(id);
    const isEditMode = editModeParam === '1';

    const {
        active, activeRef, tickSeconds, updateSetsMap, updateRecordCount,
        clearActive, setMinimized, startRest, addRestTime, stopRest,
    } = useActiveRoutine();

    const activeRoutine = active as ActiveRoutine | null;
    const isCurrentRoutine = activeRoutine?.id === id;

    const [localSeconds] = useState(() =>
        (activeRef.current?.id === id) ? activeRef.current.seconds : 0
    );
    const [running, setRunning] = useState(!isEditMode);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const elapsedRef = useRef(localSeconds);

    const restActiveRef = useRef(false);
    restActiveRef.current = isCurrentRoutine ? (activeRoutine?.restActive ?? false) : false;

    useEffect(() => {
        if (isEditMode) return; // no timer in edit mode
        if (running) {
            intervalRef.current = setInterval(() => {
                elapsedRef.current += 1;
                tickSeconds();
                if (restActiveRef.current) addRestTime(-1);
                setDisplaySeconds(s => s + 1);
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running, isEditMode]);

    const [displaySeconds, setDisplaySeconds] = useState(localSeconds);

    const restActive: boolean = isCurrentRoutine ? (activeRoutine?.restActive ?? false) : false;
    const restSeconds: number = isCurrentRoutine ? (activeRoutine?.restSeconds ?? 0) : 0;
    const restFormatted = `${Math.floor(restSeconds / 60)}:${String(restSeconds % 60).padStart(2, '0')}`;

    const setsMap: SetsMap = isCurrentRoutine ? (activeRoutine?.setsMap ?? EMPTY_SETS_MAP) : EMPTY_SETS_MAP;

    function getSets(idRutinaEjercicio: number): SetRow[] {
        return setsMap[idRutinaEjercicio] ?? [{ num: 1, kg: '', reps: '', done: false }];
    }

    function handleSetsChange(idRutinaEjercicio: number, sets: SetRow[]) {
        updateSetsMap({ ...setsMap, [idRutinaEjercicio]: sets });
    }

    const {
        exercises, addExercise, removeExercise, replaceExercise,
        reorderExercises, updateRestTime, finishRoutine,
    } = useRoutineDetail(routineId);

    const { exercises: allExercises, loading: loadingAll } = useExercises();
    const exerciseIds = exercises.map(e => e.id_ejercicio);
    const records = useRecords(exerciseIds);

    const [modalVisible, setModalVisible] = useState(false);
    const [recordVisible, setRecordVisible] = useState(false);
    const newRecordCount = isCurrentRoutine ? (activeRoutine?.newRecordCount ?? 0) : 0;

    const formatted = (() => {
        const s = displaySeconds;
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
        const message = pendingSets
            ? 'You have incomplete sets. Are you sure you want to finish?'
            : 'Save this workout?';
        const confirmed = await confirm(message);
        if (!confirmed) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        const finalSetsMap = activeRef.current?.setsMap ?? EMPTY_SETS_MAP;
        await finishRoutine(elapsedRef.current, finalSetsMap);
        clearActive();
        router.back();
    }

    async function handleDiscard() {
        const confirmed = await confirm('This workout will not be saved. Discard?');
        if (!confirmed) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearActive();
        router.back();
    }

    function handleMinimize() {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setMinimized(true);
        router.back();
    }

    const completedSets = Object.values(setsMap).flat().filter((s: SetRow) => s.done).length;

    return (
        <SafeAreaView style={[global_styles.defaultContainer, { flex: 1 }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: isEditMode ? 32 : BOTTOM_BAR_HEIGHT + 16 }}>

                <View style={train_styles.r_tittle}>
                    <Pressable onPress={isEditMode ? () => router.back() : handleMinimize}>
                        <Ionicons name={isEditMode ? 'arrow-back' : 'chevron-down'} size={20} color={colors.textPrimary} />
                    </Pressable>
                    <Text style={[global_styles.tittleText, { flex: 1, textAlign: 'center', marginHorizontal: 8 }]} numberOfLines={1}>
                        {nombre ?? 'Routine'}
                    </Text>
                    {isEditMode
                        ? <View style={{ width: 24 }} /> // spacer to keep title centered
                        : <Pressable onPress={handleDiscard}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                          </Pressable>
                    }
                </View>

                {/* Stats — only in workout mode */}
                {!isEditMode && (
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
                )}

                <View style={global_styles.separator} />

                {exercises.map(ex => (
                    <ExerciseCard
                        key={ex.id_rutina_ejercicio}
                        exercise={ex}
                        allExercises={exercises}
                        sets={getSets(ex.id_rutina_ejercicio)}
                        onSetsChange={sets => handleSetsChange(ex.id_rutina_ejercicio, sets)}
                        record={records[ex.id_ejercicio] ?? null}
                        onSetDone={secs => startRest(secs)}
                        onRestTimeChanged={secs => updateRestTime(ex.id_rutina_ejercicio, secs)}
                        onNewRecord={handleNewRecord}
                        onRemove={idRE => removeExercise(idRE)}
                        onReplace={(idRE, newId) => replaceExercise(idRE, newId)}
                        onReorder={ordered => reorderExercises(ordered)}
                        editMode={isEditMode}
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

            {/* Bottom bar — only in workout mode */}
            {!isEditMode && (
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
                            <Pressable style={[global_styles.principalButton, train_styles.r_finishBtn]} onPress={handleFinish}>
                                <Text style={[global_styles.principalText, { fontSize: 13 }]}>Finish Routine</Text>
                            </Pressable>
                        </>
                    ) : (
                        <View style={train_styles.r_normalRow}>
                            <Text style={[global_styles.principalText, { fontSize: 18, fontWeight: '600' }]}>{formatted}</Text>
                            <Pressable onPress={() => setRunning(r => !r)} style={train_styles.r_playPauseButton}>
                                <Ionicons name={running ? 'pause' : 'play'} size={24} color="#000" />
                            </Pressable>
                            <Pressable style={[global_styles.principalButton, { paddingHorizontal: 18, height: 36 }]} onPress={handleFinish}>
                                <Text style={[global_styles.principalText, { fontSize: 13 }]}>Finish</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            )}

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
