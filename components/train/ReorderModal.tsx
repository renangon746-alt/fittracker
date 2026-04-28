import { exerciseImageMap } from '@/assets/data/exerciseImageMap';
import { useTheme } from '@/context/ThemeContext';
import { RoutineExercise } from '@/hooks/train/useRoutineDetail';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ReorderModalProps {
    visible: boolean;
    exercises: RoutineExercise[];
    onConfirm: (ordered: RoutineExercise[]) => void;
    onCancel: () => void;
}

export default function ReorderModal({ visible, exercises, onConfirm, onCancel }: ReorderModalProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
    const [list, setList] = useState<RoutineExercise[]>([...exercises]);

    // Reset list when modal opens with fresh exercises
    if (visible && list.length !== exercises.length) {
        setList([...exercises]);
    }

    function move(index: number, direction: -1 | 1) {
        const newList = [...list];
        const target = index + direction;
        if (target < 0 || target >= newList.length) return;
        [newList[index], newList[target]] = [newList[target], newList[index]];
        setList(newList);
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
            <View style={train_styles.rm_overlay}>
                <View style={[train_styles.rm_card, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={[global_styles.tittleText, { marginBottom: 16 }]}>Reorder Exercises</Text>

                    <ScrollView style={train_styles.rm_list} showsVerticalScrollIndicator={false}>
                        {list.map((ex, i) => {
                            const img = ex.image_key ? exerciseImageMap[ex.image_key] : null;
                            return (
                                <View key={ex.id_rutina_ejercicio} style={[train_styles.rm_row, { backgroundColor: colors.backgroundPrimary }]}>
                                    {img
                                        ? <Image source={img} style={train_styles.rm_img} />
                                        : <View style={[train_styles.rm_img, { backgroundColor: colors.backgroundSecondary }]} />
                                    }
                                    <Text style={[global_styles.principalText, { flex: 1, marginHorizontal: 10 }]} numberOfLines={1}>
                                        {ex.nombre}
                                    </Text>
                                    <Pressable onPress={() => move(i, -1)} disabled={i === 0} style={train_styles.rm_arrowBtn}>
                                        <Ionicons name="chevron-up" size={20} color={i === 0 ? colors.textSecondary : colors.textPrimary} />
                                    </Pressable>
                                    <Pressable onPress={() => move(i, 1)} disabled={i === list.length - 1} style={train_styles.rm_arrowBtn}>
                                        <Ionicons name="chevron-down" size={20} color={i === list.length - 1 ? colors.textSecondary : colors.textPrimary} />
                                    </Pressable>
                                </View>
                            );
                        })}
                    </ScrollView>

                    <View style={train_styles.rm_actions}>
                        <Pressable style={[train_styles.rm_btn]} onPress={onCancel}>
                            <Text style={global_styles.principalText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={[train_styles.rm_btn]} onPress={() => onConfirm(list)}>
                            <Text style={[global_styles.principalText, { color: '#fff' }]}>Save</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    
});
