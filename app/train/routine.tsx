import AddExerciseModal from '@/components/train/AddExerciseModal';
import ExerciseCard from '@/components/train/ExerciseCard';
import NewRecordOverlay from '@/components/train/NewRecordOverlay';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useExercises } from '@/hooks/train/useExercises';
import { useRecords } from '@/hooks/train/useRecords';
import { SetRow, useRoutineDetail } from '@/hooks/train/useRoutineDetail';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActiveRoutine, SetsMap, useActiveRoutine } from '../_layout';

const screenWidth = Dimensions.get('window').width;
const BOTTOM_BAR_HEIGHT = 110;
const EMPTY_SETS_MAP: SetsMap = {};

function confirm(message: string, t: (key: string) => string): Promise<boolean> {
    if (Platform.OS === 'web') return Promise.resolve(window.confirm(message));
    return new Promise(resolve => {
        Alert.alert(t('confirm'), message, [
            { text: t('cancel'), style: 'cancel', onPress: () => resolve(false) },
            { text: 'OK', onPress: () => resolve(true) },
        ]);
    });
}

export default function Routine() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);

    const { id, nombre, editMode: editModeParam } = useLocalSearchParams<{ id: string; nombre: string; editMode?: string }>();
    const routineId = Number(id);
    const isEditMode = editModeParam === '1';

    const insets = useSafeAreaInsets();

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
        if (isEditMode) return;
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

    const restInitialRef = useRef(0);
    useEffect(() => {
        if (restActive) restInitialRef.current = restSeconds;
        else            restInitialRef.current = 0;
    }, [restActive]); // capture initial value only when rest starts/stops
    const restProgress = restInitialRef.current > 0 ? restSeconds / restInitialRef.current : 0;

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

    // ── Validation ──────────────────────────────────────────────────────────
    type CheckType = 'not_done' | 'invalid' | 'reps_zero' | 'kg_zero';
    const [validationModal, setValidationModal] = useState<{
        type: CheckType;
        byExercise: Record<number, number[]>;
        pendingMap: SetsMap;
    } | null>(null);
    const [markedInvalid, setMarkedInvalid] = useState<Record<number, Set<number>>>({});

    function findNotDone(map: SetsMap): Record<number, number[]> {
        const out: Record<number, number[]> = {};
        for (const ex of exercises) {
            const sets = map[ex.id_rutina_ejercicio] ?? [];
            const bad = sets.reduce<number[]>((acc, s, i) => { if (!s.done) acc.push(i); return acc; }, []);
            if (bad.length) out[ex.id_rutina_ejercicio] = bad;
        }
        return out;
    }

    function findInvalidSets(map: SetsMap): Record<number, number[]> {
        const out: Record<number, number[]> = {};
        for (const ex of exercises) {
            const sets = map[ex.id_rutina_ejercicio] ?? [];
            const bad = sets.reduce<number[]>((acc, s, i) => {
                const kgVal  = parseFloat(s.kg.trim());
                const repVal = parseInt(s.reps.trim());
                if (s.kg.trim() === '' || isNaN(kgVal)  || kgVal  > 999 ||
                    s.reps.trim() === '' || isNaN(repVal) || repVal > 999) acc.push(i);
                return acc;
            }, []);
            if (bad.length) out[ex.id_rutina_ejercicio] = bad;
        }
        return out;
    }

    function findRepsZero(map: SetsMap): Record<number, number[]> {
        const out: Record<number, number[]> = {};
        for (const ex of exercises) {
            const sets = map[ex.id_rutina_ejercicio] ?? [];
            const bad = sets.reduce<number[]>((acc, s, i) => {
                if (parseInt(s.reps.trim()) === 0) acc.push(i);
                return acc;
            }, []);
            if (bad.length) out[ex.id_rutina_ejercicio] = bad;
        }
        return out;
    }

    function findKgZero(map: SetsMap): Record<number, number[]> {
        const out: Record<number, number[]> = {};
        for (const ex of exercises) {
            const sets = map[ex.id_rutina_ejercicio] ?? [];
            const bad = sets.reduce<number[]>((acc, s, i) => {
                if (parseFloat(s.kg.trim()) === 0) acc.push(i);
                return acc;
            }, []);
            if (bad.length) out[ex.id_rutina_ejercicio] = bad;
        }
        return out;
    }

    function removeBadSets(map: SetsMap, byExercise: Record<number, number[]>): SetsMap {
        const result = { ...map };
        for (const [idStr, indices] of Object.entries(byExercise)) {
            const badSet = new Set(indices);
            result[Number(idStr)] = (result[Number(idStr)] ?? []).filter((_, i) => !badSet.has(i));
        }
        return result;
    }

    function runValidation(map: SetsMap) {
        const notDone = findNotDone(map);
        if (Object.keys(notDone).length > 0) {
            setValidationModal({ type: 'not_done', byExercise: notDone, pendingMap: map });
            return;
        }
        const invalid = findInvalidSets(map);
        if (Object.keys(invalid).length > 0) {
            setValidationModal({ type: 'invalid', byExercise: invalid, pendingMap: map });
            return;
        }
        const repsZero = findRepsZero(map);
        if (Object.keys(repsZero).length > 0) {
            setValidationModal({ type: 'reps_zero', byExercise: repsZero, pendingMap: map });
            return;
        }
        const kgZero = findKgZero(map);
        if (Object.keys(kgZero).length > 0) {
            setValidationModal({ type: 'kg_zero', byExercise: kgZero, pendingMap: map });
            return;
        }
        doFinishWithMap(map);
    }

    async function doFinishWithMap(map: SetsMap) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        await finishRoutine(elapsedRef.current, map);
        clearActive();
        router.back();
    }

    function handleValidationFix() {
        const vm = validationModal!;
        const marked: Record<number, Set<number>> = {};
        for (const [idStr, indices] of Object.entries(vm.byExercise))
            marked[Number(idStr)] = new Set(indices);
        setMarkedInvalid(marked);
        setValidationModal(null);
    }

    function handleValidationSave() {
        const vm = validationModal!;
        setValidationModal(null);
        setMarkedInvalid({});
        if (vm.type === 'kg_zero') {
            runValidation(vm.pendingMap); // keep kg=0 sets, continue checks
        } else {
            runValidation(removeBadSets(vm.pendingMap, vm.byExercise));
        }
    }
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
        // Find exercise data from the available list to pass nombre/image_key for empty training
        const found = allExercises.find(e => e.id_ejercicio === idEjercicio);
        await addExercise(idEjercicio, found
            ? { nombre: found.nombre, image_key: found.image_key }
            : undefined
        );
    }

    function handleNewRecord() {
        updateRecordCount(newRecordCount + 1);
        setRecordVisible(true);
        setTimeout(() => setRecordVisible(false), 2500);
    }

    function handleFinish() {
        const finalMap = activeRef.current?.setsMap ?? EMPTY_SETS_MAP;
        runValidation(finalMap);
    }

    async function handleDiscard() {
        const confirmed = await confirm(t('discard_workout'), t);
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
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={{ backgroundColor: colors.backgroundSecondary }}
                    contentContainerStyle={{ paddingBottom: isEditMode ? 32 + insets.bottom : BOTTOM_BAR_HEIGHT + 16 + insets.bottom }}
                    keyboardShouldPersistTaps="handled"
                >

                <View style={train_styles.r_tittle}>
                    <Pressable onPress={isEditMode ? () => router.back() : handleMinimize}>
                        <Ionicons name={isEditMode ? 'arrow-back' : 'chevron-down'} size={20} color={colors.textPrimary} />
                    </Pressable>
                    <Text style={[global_styles.tittleText, { flex: 1, textAlign: 'center', marginHorizontal: 8 }]} numberOfLines={1}>
                        {nombre ?? t('routine_fallback')}
                    </Text>
                    {isEditMode
                        ? <View style={{ width: 24 }} />
                        : <Pressable onPress={handleDiscard}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                          </Pressable>
                    }
                </View>

                {!isEditMode && (
                    <View style={train_styles.r_statistics}>
                        <View style={train_styles.r_stat}>
                            <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 16 }]}>{t('duration')}</Text>
                            <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>{formatted}</Text>
                        </View>
                        <View style={train_styles.r_stat}>
                            <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 16 }]}>{t('records')}</Text>
                            <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>{newRecordCount}</Text>
                        </View>
                        <View style={train_styles.r_stat}>
                            <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 16 }]}>{t('sets')}</Text>
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
                        invalidIndices={markedInvalid[ex.id_rutina_ejercicio]}
                        onClearInvalid={() => setMarkedInvalid(prev => { const n = { ...prev }; delete n[ex.id_rutina_ejercicio]; return n; })}
                    />
                ))}

                <View style={train_styles.r_addExerciseButton}>
                    <Pressable
                        style={[global_styles.principalButton, train_styles.r_addExercisePressable]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={global_styles.principalText}>{t('add_exercise')}</Text>
                    </Pressable>
                </View>

                {!isEditMode && (
                    <Pressable
                        onPress={handleFinish}
                        style={({ pressed }) => ({
                            marginHorizontal: 20,
                            marginTop: 8,
                            marginBottom: 16,
                            paddingVertical: 14,
                            borderRadius: 24,
                            alignItems: 'center',
                            backgroundColor: colors.backgroundPrimary,
                            borderWidth: 1.5,
                            borderColor: colors.primary,
                            opacity: pressed ? 0.75 : 1,
                        })}
                    >
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>{t('finish_workout')}</Text>
                    </Pressable>
                )}

            </ScrollView>
            </KeyboardAvoidingView>

            {!isEditMode && (
                <View style={[train_styles.r_bottomBar, { backgroundColor: colors.backgroundPrimary, paddingBottom: 12 + insets.bottom }]}>
                    {restActive ? (
                        <View>
                            {/* Full-width progress bar — capped at 100% if time is extended */}
                            <View style={{ height: 5, backgroundColor: colors.border, borderRadius: 4, marginHorizontal: 16, marginBottom: 10 }}>
                                <View style={{ width: `${Math.round(Math.min(restProgress, 1) * 100)}%`, height: 5, borderRadius: 4, backgroundColor: colors.primary }} />
                            </View>
                            <View style={train_styles.r_restRow}>
                                <Pressable
                                    style={[train_styles.r_adjustBtn, { backgroundColor: colors.backgroundSecondary, borderRadius: 10, borderWidth: 1.5 }]}
                                    onPress={() => addRestTime(-15)}
                                >
                                    <Text style={[global_styles.principalText, { fontSize: 14, color: '#fff' }]}>-15s</Text>
                                </Pressable>
                                <View style={train_styles.r_restCenter}>
                                    <Text style={[global_styles.tittleText, { fontSize: 28 }]}>{restFormatted}</Text>
                                    <Pressable onPress={stopRest}>
                                        <Text style={[global_styles.secondaryText, { color: colors.textSecondary, fontSize: 12 }]}>{t('skip')}</Text>
                                    </Pressable>
                                </View>
                                <Pressable
                                    style={[train_styles.r_adjustBtn, { backgroundColor: colors.backgroundSecondary, borderRadius: 10, borderWidth: 1.5}]}
                                    onPress={() => addRestTime(15)}
                                >
                                    <Text style={[global_styles.principalText, { fontSize: 14, color: '#fff' }]}>+15s</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <View style={train_styles.r_normalRow}>
                            <Text style={[global_styles.principalText, { fontSize: 18, fontWeight: '600' }]}>{formatted}</Text>
                            <Pressable onPress={() => setRunning(r => !r)} style={train_styles.r_playPauseButton}>
                                <Ionicons name={running ? 'pause' : 'play'} size={24} color="#000" />
                            </Pressable>
                        </View>
                    )}
                </View>
            )}

            {/* Validation modal */}
            <Modal visible={!!validationModal} transparent animationType="fade" onRequestClose={handleValidationFix}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <View style={{ backgroundColor: colors.backgroundPrimary, borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', gap: 12 }}>
                        <Ionicons name="warning-outline" size={36} color={colors.primary} />
                        <Text style={[global_styles.tittleText, { textAlign: 'center', fontSize: 18 }]}>
                            {validationModal?.type === 'not_done'  && t('sets_not_done')}
                            {validationModal?.type === 'invalid'   && t('sets_invalid')}
                            {validationModal?.type === 'reps_zero' && t('sets_reps_zero')}
                            {validationModal?.type === 'kg_zero'   && t('sets_kg_zero')}
                        </Text>
                        <Text style={[global_styles.secondaryText, { textAlign: 'center', lineHeight: 20 }]}>
                            {validationModal?.type === 'not_done'  && 'Hay series que no han sido marcadas como completadas. Puedes arreglarlas o guardar sin ellas.'}
                            {validationModal?.type === 'invalid'   && 'Hay series con campos vacíos o fuera de rango (0–999). Puedes arreglarlas o guardar sin ellas.'}
                            {validationModal?.type === 'reps_zero' && 'Hay series con 0 repeticiones. Puedes arreglarlas o guardar sin ellas.'}
                            {validationModal?.type === 'kg_zero'   && 'Hay series con 0 kg (posibles ejercicios sin peso). Puedes arreglarlas o guardar igualmente.'}
                        </Text>
                        <Pressable
                            onPress={handleValidationFix}
                            style={({ pressed }) => ({ width: '100%', paddingVertical: 14, borderRadius: 24, alignItems: 'center', backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1, marginTop: 4 })}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{t('fix_sets')}</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleValidationSave}
                            style={({ pressed }) => ({ width: '100%', paddingVertical: 14, borderRadius: 24, alignItems: 'center', backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.75 : 1 })}
                        >
                            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 15 }}>
                                {validationModal?.type === 'kg_zero' ? t('save_anyway') : t('save_without_them')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

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
