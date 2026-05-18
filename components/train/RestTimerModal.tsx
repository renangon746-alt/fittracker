import { useTheme } from '@/context/ThemeContext';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

interface RestTimerModalProps {
    visible: boolean;
    initialSeconds: number;
    onConfirm: (seconds: number) => void;
    onCancel: () => void;
}

function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m === 0) return `${sec}s`;
    if (sec === 0) return `${m}min`;
    return `${m}min ${sec}s`;
}

export default function RestTimerModal({ visible, initialSeconds, onConfirm, onCancel }: RestTimerModalProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);

    const nearest = Math.round(initialSeconds / 15) * 15;
    const [seconds, setSeconds] = useState(nearest);

    function adjust(delta: number) {
        setSeconds(prev => Math.max(0, Math.min(prev + delta, 600)));
    }

    const presets = [30, 60, 90, 120, 180, 300];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onCancel}
        >
            <Pressable
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
                onPress={onCancel}
            />
            <View style={[train_styles.rtm_sheet, { backgroundColor: colors.backgroundSecondary }]}>
                {/* Handle */}
                <View style={[train_styles.rtm_handle, { backgroundColor: colors.border }]} />

                <Text style={[global_styles.tittleText, train_styles.rtm_title]}>Rest Timer</Text>

                {/* Main +/- controls */}
                <View style={train_styles.rtm_controls}>
                    <Pressable
                        style={[train_styles.rtm_adjBtn, { backgroundColor: colors.backgroundPrimary }]}
                        onPress={() => adjust(-15)}
                    >
                        <Text style={[global_styles.tittleText, { fontSize: 24 }]}>−</Text>
                    </Pressable>

                    <View style={train_styles.rtm_display}>
                        <Text style={[global_styles.tittleText, { fontSize: 36, color: colors.primary }]}>
                            {formatTime(seconds)}
                        </Text>
                    </View>

                    <Pressable
                        style={[train_styles.rtm_adjBtn, { backgroundColor: colors.backgroundPrimary }]}
                        onPress={() => adjust(15)}
                    >
                        <Text style={[global_styles.tittleText, { fontSize: 24 }]}>+</Text>
                    </Pressable>
                </View>

                {/* Preset chips */}
                <View style={train_styles.rtm_presets}>
                    {presets.map(p => (
                        <Pressable
                            key={p}
                            style={[
                                train_styles.rtm_chip,
                                {
                                    backgroundColor: seconds === p ? colors.primary : colors.backgroundPrimary,
                                    borderColor: colors.primary,
                                }
                            ]}
                            onPress={() => setSeconds(p)}
                        >
                            <Text style={[
                                global_styles.secondaryText,
                                { fontSize: 12, color: seconds === p ? '#fff' : colors.textSecondary }
                            ]}>
                                {formatTime(p)}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Done button */}
                <Pressable
                    style={[train_styles.rtm_doneBtn, { backgroundColor: colors.primary }]}
                    onPress={() => onConfirm(seconds)}
                >
                    <Text style={[global_styles.principalText, { color: '#fff', fontSize: 16 }]}>Done</Text>
                </Pressable>
            </View>
        </Modal>
    );
}
