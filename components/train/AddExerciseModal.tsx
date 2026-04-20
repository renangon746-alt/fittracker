import { exerciseImageMap } from '@/assets/data/exerciseImageMap';
import { useTheme } from '@/context/ThemeContext';
import { Exercise } from '@/hooks/useExercises';
import { globalStyles } from '@/styles/global-styles';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator, FlatList, Image, Modal,
    Pressable, StyleSheet, Text, TextInput, View,
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
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={[global_styles.tittleText, { marginBottom: 12 }]}>Add Exercise</Text>

                    {/* Search bar */}
                    <View style={[styles.searchRow, { backgroundColor: colors.backgroundPrimary }]}>
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
                            style={styles.list}
                            renderItem={({ item }) => {
                                const isSelected = selected === item.id_ejercicio;
                                const imgSource = item.image_key ? exerciseImageMap[item.image_key] : null;
                                return (
                                    <Pressable
                                        onPress={() => setSelected(item.id_ejercicio)}
                                        style={[
                                            styles.row,
                                            {
                                                backgroundColor: isSelected ? colors.primary + '22' : 'transparent',
                                                borderColor: isSelected ? colors.primary : 'transparent',
                                            },
                                        ]}
                                    >
                                        {imgSource ? (
                                            <Image source={imgSource} style={styles.rowImage} />
                                        ) : (
                                            <View style={[styles.rowImage, { backgroundColor: colors.backgroundPrimary }]} />
                                        )}
                                        <Text style={[global_styles.principalText, { flex: 1 }]}>{item.nombre}</Text>
                                        {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                                    </Pressable>
                                );
                            }}
                        />
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable style={[global_styles.secondaryButton, styles.actionBtn]} onPress={handleCancel}>
                            <Text style={global_styles.principalText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={[global_styles.principalButton, styles.actionBtn, { opacity: selected === null ? 0.5 : 1 }]}
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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    card: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '85%',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
    },
    list: {
        maxHeight: 340,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderWidth: 1.5,
        marginBottom: 4,
        gap: 12,
    },
    rowImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    actionBtn: {
        flex: 1,
        height: 44,
    },
});
