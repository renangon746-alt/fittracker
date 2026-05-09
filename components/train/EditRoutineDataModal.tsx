import { useTheme } from '@/context/ThemeContext';
import { FOLDER_OPTIONS, FolderKey } from '@/hooks/train/useCreateRoutine';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native';

interface EditRoutineDataModalProps {
    visible: boolean;
    initialNombre: string;
    initialCarpeta: FolderKey;
    onConfirm: (nombre: string, carpeta: FolderKey) => Promise<void>;
    onCancel: () => void;
}

export default function EditRoutineDataModal({
    visible, initialNombre, initialCarpeta, onConfirm, onCancel,
}: EditRoutineDataModalProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
    const [nombre, setNombre] = useState(initialNombre);
    const [carpeta, setCarpeta] = useState<FolderKey>(initialCarpeta);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function handleSave() {
        if (!nombre.trim()) { setError('Name is required.'); return; }
        setSaving(true);
        await onConfirm(nombre.trim(), carpeta);
        setSaving(false);
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={train_styles.erdm_overlay}>
                <View style={[train_styles.erdm_card]}>
                    <Text style={[global_styles.tittleText, { marginBottom: 16 }]}>Edit Routine</Text>

                    <Text style={[global_styles.principalText, { marginBottom: 6 }]}>Name</Text>
                    <TextInput
                        style={[global_styles.inputs, { marginBottom: 16 }]}
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Routine name..."
                        placeholderTextColor={colors.textSecondary}
                        maxLength={50}
                    />

                    <Text style={[global_styles.principalText, { marginBottom: 8 }]}>Folder</Text>
                    <View style={train_styles.crm_folderOptions}>
                        {FOLDER_OPTIONS.map(opt => {
                            const selected = carpeta === opt.value;
                            return (
                                <Pressable
                                    key={opt.value}
                                    onPress={() => setCarpeta(opt.value)}
                                    style={[train_styles.crm_folderChip, {
                                        backgroundColor: selected ? colors.primary : 'transparent',
                                    }]}
                                >
                                    <Text style={[global_styles.principalText, {
                                        color: selected ? '#fff' : colors.textPrimary,
                                        fontSize: 13,
                                    }]}>
                                        {opt.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}

                    <View style={train_styles.erdm_actions}>
                        <Pressable style={[train_styles.erdm_btn, { backgroundColor: colors.backgroundPrimary }]} onPress={onCancel} disabled={saving}>
                            <Text style={global_styles.principalText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={[train_styles.erdm_btn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={saving}>
                            {saving
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={[global_styles.principalText, { color: '#fff' }]}>Save</Text>
                            }
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}


