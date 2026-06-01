import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { FOLDER_OPTIONS, FolderKey } from '@/hooks/train/useCreateRoutine';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

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
    const { t } = useTranslation();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <KeyboardAvoidingView
                style={train_styles.crm_overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={[train_styles.crm_card]}>
                        <Text style={[global_styles.tittleText, train_styles.crm_title]}>{t('new_routine')}</Text>

                        {/* Name input */}
                        <Text style={[global_styles.principalText, train_styles.crm_nameInputLabel]}>{t('name')}</Text>
                        <TextInput style={[global_styles.inputs, train_styles.crm_input]}
                            value={nombre}
                            onChangeText={setNombre}
                            placeholder={t('routine_name_placeholder')}
                            placeholderTextColor={colors.textSecondary}
                            maxLength={50}
                        />

                        {/* Folder selector */}
                        <Text style={[global_styles.principalText, train_styles.crm_folderSelectorLabel]}>{t('folder')}</Text>
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
                                <Text style={global_styles.principalText}>{t('cancel')}</Text>
                            </Pressable>

                            <Pressable
                                style={[global_styles.principalButton, train_styles.crm_actionBtn]}
                                onPress={onConfirm}
                                disabled={saving}
                            >
                                {saving
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={global_styles.principalText}>{t('create')}</Text>
                                }
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

