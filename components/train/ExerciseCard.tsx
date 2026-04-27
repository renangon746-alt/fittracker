import { exerciseImageMap } from '@/assets/data/exerciseImageMap';
import { useTheme } from '@/context/ThemeContext';
import { RoutineExercise, SetRow } from '@/hooks/train/useRoutineDetail';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import RestTimerModal from './RestTimerModal';

interface ExerciseCardProps {
    exercise: RoutineExercise;
    sets: SetRow[];
    onSetsChange: (sets: SetRow[]) => void;
    record: { kg: number; reps: number } | null;
    onSetDone: (restSeconds: number) => void;
    onRestTimeChanged: (seconds: number) => void;
    onNewRecord: () => void;
}


export default function ExerciseCard({
    exercise, sets, onSetsChange,
    record, onSetDone, onRestTimeChanged, onNewRecord,
}: ExerciseCardProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
    const imgSource = exercise.image_key ? exerciseImageMap[exercise.image_key] : null;
    const [restModalVisible, setRestModalVisible] = useState(false);

    function updateSet(index: number, field: keyof SetRow, value: string | boolean) {
        const updated = sets.map((s, i) => i === index ? { ...s, [field]: value } : s);
        onSetsChange(updated);
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

    // Only allow digits and one optional decimal point
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
                <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
            </View>

            {/* Rest timer */}
            <Pressable style={train_styles.ec_restRow} onPress={() => setRestModalVisible(true)}>
                <Ionicons name="timer-outline" size={16} color={colors.primary} />
                <Text style={[global_styles.secondaryText, { color: colors.primary, marginLeft: 6 }]}>
                    Rest Timer: {exercise.descanso_seg
                        ? `${Math.floor(exercise.descanso_seg / 60)}min ${exercise.descanso_seg % 60}s`
                        : 'Not set — tap to set'}
                </Text>
            </Pressable>

            {/* Column headers */}
            <View style={train_styles.ec_row}>
                <Text style={[train_styles.ec_colSet,  global_styles.secondaryText]}>SET</Text>
                <Text style={[train_styles.ec_colPrev, global_styles.secondaryText]}>PREVIOUS</Text>
                <Text style={[train_styles.ec_colInput, global_styles.secondaryText]}>KG</Text>
                <Text style={[train_styles.ec_colInput, global_styles.secondaryText]}>REPS</Text>
                <View style={train_styles.ec_colCheck} />
            </View>

            {/* Set rows */}
            {sets.map((set, i) => (
                <View
                    key={i}
                    style={[train_styles.ec_row, train_styles.ec_setRow, set.done && { backgroundColor: colors.primary + '18' }]}
                >
                    <Text style={[train_styles.ec_colSet, global_styles.principalText, { fontWeight: '700' }]}>
                        {set.num}
                    </Text>

                    <Text style={[train_styles.ec_colPrev, global_styles.secondaryText]} numberOfLines={1}>
                        {recordLabel}
                    </Text>

                    <TextInput
                        style={[train_styles.ec_colInput, train_styles.ec_input, global_styles.principalText, { borderColor: colors.border, color: colors.textPrimary }]}
                        value={set.kg}
                        onChangeText={v => updateSet(i, 'kg', sanitizeNumber(v))}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={colors.textSecondary}
                        maxLength={6}
                    />

                    <TextInput
                        style={[train_styles.ec_colInput,train_styles.ec_input, global_styles.principalText, { borderColor: colors.border, color: colors.textPrimary }]}
                        value={set.reps}
                        onChangeText={v => updateSet(i, 'reps', v.replace(/[^0-9]/g, ''))}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={colors.textSecondary}
                        maxLength={4}
                    />

                    <Pressable
                        style={[train_styles.ec_colCheck, train_styles.ec_checkBtn, { backgroundColor: set.done ? colors.primary : colors.backgroundPrimary }]}
                        onPress={() => handleTick(i)}
                    >
                        <Ionicons name="checkmark" size={16} color={set.done ? '#fff' : colors.textSecondary} />
                    </Pressable>
                </View>
            ))}

            {/* Add set */}
            <Pressable style={[train_styles.ec_addSetBtn, { borderTopColor: colors.border }]} onPress={addSet}>
                <Text style={[global_styles.principalText, { textAlign: 'center' }]}>+ Add Set</Text>
            </Pressable>

            <RestTimerModal
                visible={restModalVisible}
                initialSeconds={exercise.descanso_seg ?? 0}
                onConfirm={(secs) => { setRestModalVisible(false); onRestTimeChanged(secs); }}
                onCancel={() => setRestModalVisible(false)}
            />
        </View>
    );
}

