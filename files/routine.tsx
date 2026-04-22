import AddExerciseModal from '@/components/train/AddExerciseModal';
import ExerciseCard from '@/components/train/ExerciseCard';
import NewRecordOverlay from '@/components/train/NewRecordOverlay';
import { useTheme } from '@/context/ThemeContext';
import { useExercises } from '@/hooks/train/useExercises';
import { useRecords } from '@/hooks/train/useRecords';
import { useRestTimer } from '@/hooks/train/useRestTimer';
import { SetsMap, useRoutineDetail } from '@/hooks/train/useRoutineDetail';
import { useTimer } from '@/hooks/train/useTimer';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMinimizedRoutine } from '../_layout';

const screenWidth = Dimensions.get('window').width;
const BOTTOM_BAR_HEIGHT = 110;

export default function Routine() {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
    const { openMinimized, minimized, currentSeconds, tickSeconds, closeMinimized } = useMinimizedRoutine();

    const { id, nombre } = useLocalSearchParams<{ id: string; nombre: string }>();
    const routineId = Number(id);

    const { exercises, addExercise, updateRestTime, finishRoutine } = useRoutineDetail(routineId);
    const { exercises: allExercises, loading: loadingAll } = useExercises();
    const exerciseIds = exercises.map(e => e.id_ejercicio);
    const records = useRecords(exerciseIds);

    const resumeFrom = minimized?.id === id ? currentSeconds : 0;
    const { seconds, running, formatted, toggle } = useTimer(true, resumeFrom);

    useEffect(() => { if (running) tickSeconds(); }, [seconds]);

    const { active: restActive, formatted: restFormatted, startRest, addTime, stopRest } = useRestTimer();

    const [setsMap, setSetsMap] = useState<SetsMap>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [recordVisible, setRecordVisible] = useState(false);
    const [newRecordCount, setNewRecordCount] = useState(0);

    function getSets(idRutinaEjercicio: number) {
        return setsMap[idRutinaEjercicio] ?? [{ num: 1, kg: '', reps: '', done: false }];
    }

    function updateSets(idRutinaEjercicio: number, sets: SetsMap[number]) {
        setSetsMap(prev => ({ ...prev, [idRutinaEjercicio]: sets }));
    }

    async function handleAddExercise(idEjercicio: number) {
        setModalVisible(false);
        await addExercise(idEjercicio);
    }

    function handleNewRecord() {
        setNewRecordCount(c => c + 1);
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
                        await finishRoutine(seconds, setsMap);
                        closeMinimized();
                        router.back();
                    },
                },
            ]
        );
    }

    function handleDiscard() {
        Alert.alert('Discard Workout', 'This workout will not be saved. Discard?', [
            { text: 'Keep going', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => { closeMinimized(); router.back(); } },
        ]);
    }

    function handleMinimize() {
        openMinimized(id, nombre ?? 'Routine', seconds);
        router.back();
    }

    const completedSets = Object.values(setsMap).flat().filter(s => s.done).length;

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
                        onSetsChange={sets => updateSets(ex.id_rutina_ejercicio, sets)}
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
                        <Pressable onPress={toggle} style={train_styles.r_playPauseButton}>
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
