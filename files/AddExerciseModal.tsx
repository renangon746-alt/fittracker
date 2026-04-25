import { useTheme } from '@/context/ThemeContext';
import { Exercise } from '@/hooks/train/useExercises';
import { exerciseImageMap } from '@/assets/data/exerciseImageMap';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator, FlatList, Image, Modal,
    Pressable, Text, TextInput, View,
} from 'react-native';

interface AddExerciseModalProps {
    visible: boolean;
    exercises: Exercise[];
    loadingExercises: boolean;
    onAdd: (id: number) => void;
    onCancel: () => void;
}

export default function AddExerciseModal({
    visible, exercises, loadingExercises, onAdd, onCancel,
}: AddExerciseModalProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<number | null>(null);

    const filtered = useMemo(() =>
        exercises.filter(e => e.nombre.toLowerCase().includes(query.toLowerCase())),
        [exercises, query]
    );

    function handleConfirm() {
        if (selected === null) return;
        onAdd(selected);
        setSelected(null);
        setQuery('');
    }

    function handleCancel() {
        setSelected(null);
        setQuery('');
        onCancel();
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
            <View style={train_styles.aem_overlay}>
                <View style={[train_styles.aem_card, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={[global_styles.tittleText, { marginBottom: 12 }]}>Add Exercise</Text>

                    {/* Search bar */}
                    <View style={[train_styles.aem_searchRow, { backgroundColor: colors.backgroundPrimary }]}>
                        <Ionicons name="search" size={18} color={colors.textSecondary} />
                        <TextInput
                            style={[global_styles.principalText, { flex: 1, marginLeft: 8 }]}
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search exercise..."
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    {/* List */}
                    {loadingExercises ? (
                        <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
                    ) : (
                        <FlatList
                            data={filtered}
                            keyExtractor={item => String(item.id_ejercicio)}
                            style={train_styles.aem_list}
                            renderItem={({ item }) => {
                                const isSelected = selected === item.id_ejercicio;
                                const imgSource = item.image_key ? exerciseImageMap[item.image_key] : null;
                                return (
                                    <Pressable
                                        onPress={() => setSelected(item.id_ejercicio)}
                                        style={[
                                            train_styles.aem_row,
                                            {
                                                backgroundColor: isSelected ? colors.primary + '22' : 'transparent',
                                                borderColor: isSelected ? colors.primary : 'transparent',
                                            },
                                        ]}
                                    >
                                        {imgSource
                                            ? <Image source={imgSource} style={train_styles.aem_rowImage} />
                                            : <View style={[train_styles.aem_rowImage, { backgroundColor: colors.backgroundPrimary }]} />
                                        }
                                        <Text style={[global_styles.principalText, { flex: 1 }]}>{item.nombre}</Text>
                                        {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                                    </Pressable>
                                );
                            }}
                        />
                    )}

                    {/* Actions */}
                    <View style={train_styles.aem_actions}>
                        <Pressable style={[global_styles.secondaryButton, train_styles.aem_actionBtn]} onPress={handleCancel}>
                            <Text style={global_styles.principalText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={[global_styles.principalButton, train_styles.aem_actionBtn, { opacity: selected === null ? 0.5 : 1 }]}
                            onPress={handleConfirm}
                            disabled={selected === null}
                        >
                            <Text style={global_styles.principalText}>Add</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
