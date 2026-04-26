import RoutineCard from '@/components/train/RoutineCard';
import { useTheme } from '@/context/ThemeContext';
import { Routine } from '@/hooks/train/useRoutines';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface RoutineFolderProps {
    title: string;
    routines: Routine[];
    loading?: boolean;
}

export default function RoutineFolder({ title, routines, loading = false }: RoutineFolderProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
    const [open, setOpen] = useState(false);

    return (
        <View style={train_styles.rf_container}>
            <Pressable style={train_styles.t_routineFolder} onPress={() => setOpen(prev => !prev)}>
                <View style={train_styles.t_routineFolderTextIcon}>
                    <Text style={global_styles.principalText}>{title}</Text>
                    <Ionicons name={open ? 'chevron-down' : 'chevron-forward'} size={14} color={colors.textPrimary} />
                </View>
                <Text style={global_styles.principalText}>
                    {loading ? '...' : routines.length}
                </Text>
            </Pressable>

            {open && (
                <View style={train_styles.t_routinesList}>
                    {loading ? (
                        <ActivityIndicator color={colors.textPrimary} style={train_styles.rf_actIndicator} />
                    ) : routines.length === 0 ? (
                        <Text style={[global_styles.secondaryText, train_styles.rf_actIndicator]}>
                            No routines yet
                        </Text>
                    ) : (
                        routines.map(routine => (
                            <RoutineCard
                                key={routine.id_rutina}
                                id={String(routine.id_rutina)}
                                title={routine.nombre}
                                lastTrained={routine.last_trained}
                            />
                        ))
                    )}
                </View>
            )}
        </View>
    );
}
