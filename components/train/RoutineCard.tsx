import { useActiveRoutine } from "@/app/_layout";
import EditRoutineDataModal from "@/components/train/EditRoutineDataModal";
import { useTheme } from "@/context/ThemeContext";
import { FolderKey } from "@/hooks/train/useCreateRoutine";
import { useRoutineDetail } from "@/hooks/train/useRoutineDetail";
import { globalStyles } from "@/styles/global-styles";
import { trainStyles } from "@/styles/train-styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface RoutineCardProps {
    id: string;
    title: string;
    lastTrained?: string | null;
    carpeta?: FolderKey;
    onDeleted?: () => void;
    onUpdated?: () => void;
}

function formatLastTrained(iso: string | null | undefined): string {
    if (!iso) return 'Never trained';
    const date = new Date(iso);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = date.getDate();
    const suffix =
        day === 1 || day === 21 || day === 31 ? 'st' :
        day === 2 || day === 22 ? 'nd' :
        day === 3 || day === 23 ? 'rd' : 'th';
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${weekday} ${day}${suffix} ${month} ${year}`;
}

function confirm(message: string): Promise<boolean> {
    if (Platform.OS === 'web') return Promise.resolve(window.confirm(message));
    return new Promise(resolve => {
        Alert.alert('Confirm', message, [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'OK', style: 'destructive', onPress: () => resolve(true) },
        ]);
    });
}

export default function RoutineCard({ id, title, lastTrained, carpeta = 'my_routines', onDeleted, onUpdated }: RoutineCardProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
    const { navigateToRoutine } = useActiveRoutine();
    const { deleteRoutine, updateRoutineData } = useRoutineDetail(Number(id));

    const [menuVisible, setMenuVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);

    async function handleDelete() {
        setMenuVisible(false);
        const confirmed = await confirm(`Delete "${title}"? This cannot be undone.`);
        if (!confirmed) return;
        await deleteRoutine();
        onDeleted?.();
    }

    function handleEditExercises() {
        setMenuVisible(false);
        // Navigate to routine in edit mode (no timer)
        router.push({ pathname: '/train/routine', params: { id, nombre: title, editMode: '1' } });
    }

    async function handleSaveData(newNombre: string, newCarpeta: FolderKey) {
        await updateRoutineData(newNombre, newCarpeta);
        setEditModalVisible(false);
        onUpdated?.();
    }

    return (
        <View style={train_styles.rc_container}>
            <View style={train_styles.rc_dayEdit}>
                <Text style={{ ...global_styles.secondaryText, color: colors.routineCard.day }}>
                    {formatLastTrained(lastTrained)}
                </Text>
                {/* 3-dot menu trigger */}
                <Pressable onPress={() => setMenuVisible(true)}>
                    <Text style={{ ...global_styles.principalText, color: colors.routineCard.day }}>...</Text>
                </Pressable>
            </View>

            <View style={train_styles.rc_routineTitle}>
                <Text style={{ ...global_styles.principalText, color: colors.routineCard.title }} numberOfLines={1}>
                    {title}
                </Text>
            </View>

            <View style={train_styles.rc_startButtonContainer}>
                <Pressable
                    style={[global_styles.principalButton, train_styles.rc_startButtonPressable]}
                    onPress={() => navigateToRoutine(id, title)}
                >
                    <Text style={global_styles.principalText}>Start routine</Text>
                </Pressable>
            </View>

            {/* 3-dot menu */}
            <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
                <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={[styles.menuCard, { backgroundColor: colors.backgroundSecondary }]}>
                        <Pressable style={styles.menuItem} onPress={handleDelete}>
                            <Ionicons name="trash-outline" size={18} color="red" />
                            <Text style={[global_styles.principalText, { color: 'red', marginLeft: 10 }]}>Delete routine</Text>
                        </Pressable>
                        <Pressable style={styles.menuItem} onPress={handleEditExercises}>
                            <Ionicons name="barbell-outline" size={18} color={colors.textPrimary} />
                            <Text style={[global_styles.principalText, { marginLeft: 10 }]}>Edit exercises</Text>
                        </Pressable>
                        <Pressable style={styles.menuItem} onPress={() => { setMenuVisible(false); setEditModalVisible(true); }}>
                            <Ionicons name="create-outline" size={18} color={colors.textPrimary} />
                            <Text style={[global_styles.principalText, { marginLeft: 10 }]}>Edit data</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            {/* Edit data modal */}
            <EditRoutineDataModal
                visible={editModalVisible}
                initialNombre={title}
                initialCarpeta={carpeta}
                onConfirm={handleSaveData}
                onCancel={() => setEditModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 32 },
    menuCard: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(128,128,128,0.2)' },
});
