import { exerciseImageMap } from '@/assets/data/exerciseImageMap';
import AddExerciseModal from '@/components/train/AddExerciseModal';
import ReorderModal from '@/components/train/ReorderModal';
import RestTimerModal from '@/components/train/RestTimerModal';
import { useTheme } from '@/context/ThemeContext';
import { useExercises } from '@/hooks/train/useExercises';
import { RoutineExercise, SetRow } from '@/hooks/train/useRoutineDetail';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, Pressable, Text, TextInput, View } from 'react-native';

interface ExerciseCardProps {
    exercise: RoutineExercise;
    allExercises: RoutineExercise[];
    sets: SetRow[];
    onSetsChange: (sets: SetRow[]) => void;
    record: { kg: number; reps: number } | null;
    onSetDone: (restSeconds: number) => void;
    onRestTimeChanged: (seconds: number) => void;
    onNewRecord: () => void;
    onRemove: (idRutinaEjercicio: number) => void;
    onReplace: (idRutinaEjercicio: number, newIdEjercicio: number) => void;
    onReorder: (ordered: RoutineExercise[]) => void;
    editMode?: boolean;
}

const COL_SET = 36;
const COL_PREV = 100;
const COL_INPUT = 60;
const COL_CHECK = 40;

export default function ExerciseCard({
    exercise, allExercises, sets, onSetsChange,
    record, onSetDone, onRestTimeChanged, onNewRecord,
    onRemove, onReplace, onReorder,
    editMode = false,
}: ExerciseCardProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
    const imgSource = exercise.image_key ? exerciseImageMap[exercise.image_key] : null;
    const { exercises: availableExercises, loading: loadingExercises } = useExercises();

    const [restModalVisible, setRestModalVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [replaceVisible, setReplaceVisible] = useState(false);
    const [reorderVisible, setReorderVisible] = useState(false);

    function updateSet(index: number, field: keyof SetRow, value: string | boolean) {
        onSetsChange(sets.map((s, i) => i === index ? { ...s, [field]: value } : s));
    }

    function addSet() {
        onSetsChange([...sets, { num: sets.length + 1, kg: '', reps: '', done: false }]);
    }

    function handleTick(index: number) {
        const set = sets[index];
        const nowDone = !set.done;
        updateSet(index, 'done', nowDone);
        if (nowDone) {
            const kg = parseFloat(set.kg) || 0;
            const reps = parseInt(set.reps) || 0;
            if (record && kg * reps > record.kg * record.reps) onNewRecord();
            const restSecs = exercise.descanso_seg ?? 0;
            if (restSecs > 0) onSetDone(restSecs);
        }
    }

    function sanitizeNumber(v: string) {
        return v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    }

    const recordLabel = record ? `${record.kg}kg x ${record.reps}` : '—';

    return (
        <View style={[train_styles.ec_card, { backgroundColor: colors.backgroundSecondary }]}>

            {/* Header */}
            <View style={train_styles.ec_header}>
                {imgSource
                    ? <Image source={imgSource} style={train_styles.ec_headerImage} />
                    : <View style={[train_styles.ec_headerImage, { backgroundColor: colors.backgroundPrimary }]} />
                }
                <Text style={[global_styles.principalText, train_styles.ec_headerTitle, { color: colors.primary }]}>
                    {exercise.nombre}
                </Text>
                <Pressable onPress={() => setMenuVisible(true)}>
                    <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                </Pressable>
            </View>

            {/* Rest timer — hidden in edit mode */}
            {!editMode && (
                <Pressable style={train_styles.ec_restRow} onPress={() => setRestModalVisible(true)}>
                    <Ionicons name="timer-outline" size={16} color={colors.primary} />
                    <Text style={[global_styles.secondaryText, { color: colors.primary, marginLeft: 6 }]}>
                        Rest Timer: {exercise.descanso_seg
                            ? `${Math.floor(exercise.descanso_seg / 60)}min ${exercise.descanso_seg % 60}s`
                            : 'Not set — tap to set'}
                    </Text>
                </Pressable>
            )}

            {/* Table — hidden in edit mode */}
            {!editMode && (
                <>
                    <View style={[train_styles.ec_rowOption, { paddingHorizontal: 12, paddingVertical: 6 }]}>
                        <Text style={[{ width: COL_SET, textAlign: 'center' }, global_styles.secondaryText]}>SET</Text>
                        <Text style={[{ width: COL_PREV, textAlign: 'center', fontSize: 13 }, global_styles.secondaryText]}>PREVIOUS</Text>
                        <Text style={[{ width: COL_INPUT, textAlign: 'center' }, global_styles.secondaryText]}>KG</Text>
                        <Text style={[{ width: COL_INPUT, textAlign: 'center' }, global_styles.secondaryText]}>REPS</Text>
                        <View style={{ width: COL_CHECK }} />
                    </View>

                    {sets.map((set, i) => (
                        <View key={i} style={[train_styles.ec_rowOption, { paddingHorizontal: 12, paddingVertical: 6 },
                            set.done && { backgroundColor: colors.primary + '18' }]}>
                            <Text style={[{ width: COL_SET, textAlign: 'center', fontWeight: '700' }, global_styles.principalText]}>
                                {set.num}
                            </Text>
                            <Text style={[{ width: COL_PREV, textAlign: 'center', fontSize: 13 }, global_styles.secondaryText]} numberOfLines={1}>
                                {recordLabel}
                            </Text>
                            <TextInput
                                style={[{ width: COL_INPUT, textAlign: 'center', borderWidth: 1, borderRadius: 6, paddingVertical: 4 },
                                    global_styles.principalText, { borderColor: colors.border, color: colors.textPrimary }]}
                                value={set.kg}
                                onChangeText={v => updateSet(i, 'kg', sanitizeNumber(v))}
                                keyboardType="decimal-pad"
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                maxLength={6}
                            />
                            <TextInput
                                style={[{ width: COL_INPUT, textAlign: 'center', borderWidth: 1, borderRadius: 6, paddingVertical: 4 },
                                    global_styles.principalText, { borderColor: colors.border, color: colors.textPrimary }]}
                                value={set.reps}
                                onChangeText={v => updateSet(i, 'reps', v.replace(/[^0-9]/g, ''))}
                                keyboardType="number-pad"
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                maxLength={4}
                            />
                            <Pressable
                                style={[{ width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
                                    { backgroundColor: set.done ? colors.primary : colors.backgroundPrimary }]}
                                onPress={() => handleTick(i)}
                            >
                                <Ionicons name="checkmark" size={16} color={set.done ? '#fff' : colors.textSecondary} />
                            </Pressable>
                        </View>
                    ))}

                    <Pressable style={[train_styles.ec_addSetBtn, { borderTopColor: colors.border }]} onPress={addSet}>
                        <Text style={[global_styles.principalText, { textAlign: 'center' }]}>+ Add Set</Text>
                    </Pressable>
                </>
            )}

            {/* 3-dot menu */}
            <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
                <Pressable style={train_styles.ec_menuOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={[train_styles.ec_menuCard, { backgroundColor: colors.backgroundSecondary }]}>
                        <Pressable style={train_styles.ec_menuItem} onPress={() => { setMenuVisible(false); onRemove(exercise.id_rutina_ejercicio); }}>
                            <Ionicons name="trash-outline" size={18} color="red" />
                            <Text style={[global_styles.principalText, { color: 'red', marginLeft: 10 }]}>Remove exercise</Text>
                        </Pressable>
                        <Pressable style={train_styles.ec_menuItem} onPress={() => { setMenuVisible(false); setReplaceVisible(true); }}>
                            <Ionicons name="swap-horizontal-outline" size={18} color={colors.textPrimary} />
                            <Text style={[global_styles.principalText, { marginLeft: 10 }]}>Replace exercise</Text>
                        </Pressable>
                        <Pressable style={train_styles.ec_menuItem} onPress={() => { setMenuVisible(false); setReorderVisible(true); }}>
                            <Ionicons name="reorder-three-outline" size={18} color={colors.textPrimary} />
                            <Text style={[global_styles.principalText, { marginLeft: 10 }]}>Reorder exercises</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            {/* Replace */}
            <AddExerciseModal
                visible={replaceVisible}
                exercises={availableExercises}
                loadingExercises={loadingExercises}
                onAdd={(newId) => { setReplaceVisible(false); onReplace(exercise.id_rutina_ejercicio, newId); }}
                onCancel={() => setReplaceVisible(false)}
            />

            {/* Reorder */}
            <ReorderModal
                visible={reorderVisible}
                exercises={allExercises}
                onConfirm={(ordered) => { setReorderVisible(false); onReorder(ordered); }}
                onCancel={() => setReorderVisible(false)}
            />

            {/* Rest timer */}
            <RestTimerModal
                visible={restModalVisible}
                initialSeconds={exercise.descanso_seg ?? 0}
                onConfirm={(secs) => { setRestModalVisible(false); onRestTimeChanged(secs); }}
                onCancel={() => setRestModalVisible(false)}
            />
        </View>
    );
}

