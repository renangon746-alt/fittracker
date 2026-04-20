import { useTheme } from '@/context/ThemeContext';
import { FOLDER_OPTIONS, FolderKey } from '@/hooks/train/useCreateRoutine';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native';

interface CreateRoutineModalProps {
    visible: boolean;
    nombre: string;
    setNombre: (v: string) => void;
    carpeta: FolderKey;
    setCarpeta: (v: FolderKey) => void;
    saving: boolean;
    errorMsg: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function CreateRoutineModal({
    visible, nombre, setNombre, carpeta, setCarpeta,
    saving, errorMsg, onConfirm, onCancel,
}: CreateRoutineModalProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={train_styles.crm_overlay}>
                <View style={[train_styles.crm_card]}>
                    <Text style={[global_styles.tittleText, train_styles.crm_title]}>New Routine</Text>

                    {/* Name input */}
                    <Text style={[global_styles.principalText, train_styles.crm_nameInputLabel]}>Name</Text>
                    <TextInput style={[global_styles.inputs, train_styles.crm_input]}
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Routine name..."
                        placeholderTextColor={colors.textSecondary}
                        maxLength={50}
                    />

                    {/* Folder selector */}
                    <Text style={[global_styles.principalText, train_styles.crm_folderSelectorLabel]}>Folder</Text>
                    <View style={train_styles.crm_folderOptions}>
                        {FOLDER_OPTIONS.map(opt => {
                            const selected = carpeta === opt.value;
                            return (
                                <Pressable
                                    key={opt.value}
                                    onPress={() => setCarpeta(opt.value)}
                                    style={[train_styles.crm_folderChip, {backgroundColor: selected ? colors.primary : colors.backgroundPrimary},
                                    ]}
                                >
                                    <Text style={[global_styles.principalText, {color: selected ? '#fff' : colors.textPrimary}, train_styles.crm_folderChipLabel]}>
                                        {opt.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Error */}
                    {errorMsg ? (
                        <Text style={[global_styles.secondaryText, train_styles.crm_errorMessage]}>{errorMsg}</Text>
                    ) : null}

                    {/* Action buttons */}
                    <View style={train_styles.crm_actions}>
                        <Pressable
                            style={[global_styles.secondaryButton, train_styles.crm_actionBtn]}
                            onPress={onCancel}
                            disabled={saving}
                        >
                            <Text style={global_styles.principalText}>Cancel</Text>
                        </Pressable>

                        <Pressable
                            style={[global_styles.principalButton, train_styles.crm_actionBtn]}
                            onPress={onConfirm}
                            disabled={saving}
                        >
                            {saving
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={global_styles.principalText}>Create</Text>
                            }
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

