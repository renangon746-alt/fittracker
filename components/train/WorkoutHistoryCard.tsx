import { exerciseImageMap } from '@/assets/data/exerciseImageMap';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { WorkoutHistoryItem } from '@/hooks/auth/useProfileStats';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';

interface Props {
    item: WorkoutHistoryItem;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const day = d.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st'
        : day === 2 || day === 22 ? 'nd'
        : day === 3 || day === 23 ? 'rd' : 'th';
    const month = d.toLocaleDateString('en-US', { month: 'long' });
    const year = d.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
}

export default function WorkoutHistoryCard({ item }: Props) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
    const [previewVisible, setPreviewVisible] = useState(false);

    // Group series by exercise — keep image_key from first occurrence
    const byExercise = item.series.reduce<Record<string, { series: typeof item.series; image_key: string | null }>>((acc, s) => {
        if (!acc[s.ejercicio]) acc[s.ejercicio] = { series: [], image_key: s.image_key };
        acc[s.ejercicio].series.push(s);
        return acc;
    }, {});

    return (
        <>
            <Pressable
                style={[train_styles.whc_card, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => setPreviewVisible(true)}
            >
                <View style={train_styles.whc_cardHeader}>
                    <View style={train_styles.whc_iconWrap}>
                        <Ionicons name="barbell-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[global_styles.principalText, { fontWeight: '700' }]} numberOfLines={1}>
                            {item.rutina_nombre}
                        </Text>
                        <Text style={[global_styles.secondaryText, { fontSize: 12 }]}>
                            {formatDate(item.fecha_inicio)}
                            {item.duracion_min ? ` · ${item.duracion_min} min` : ''}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </View>

                {/* Exercise preview — up to 3 */}
                {Object.keys(byExercise).slice(0, 3).map(ex => (
                    <Text key={ex} style={[global_styles.secondaryText, { fontSize: 12, marginTop: 2, marginLeft: 44 }]} numberOfLines={1}>
                        {ex} · {byExercise[ex].series.length} {t('sets')}
                    </Text>
                ))}
                {Object.keys(byExercise).length > 3 && (
                    <Text style={[global_styles.secondaryText, { fontSize: 12, marginTop: 2, marginLeft: 44 }]}>
                        +{Object.keys(byExercise).length - 3} {t('more')}
                    </Text>
                )}
            </Pressable>

            {/* Preview modal */}
            <Modal visible={previewVisible} transparent animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
                <Pressable style={train_styles.whc_modalBackdrop} onPress={() => setPreviewVisible(false)} />
                <View style={[train_styles.whc_modalSheet, { backgroundColor: colors.backgroundSecondary }]}>
                    <View style={[train_styles.whc_handle, { backgroundColor: colors.border }]} />

                    <Text style={[global_styles.tittleText, { marginBottom: 4 }]}>{item.rutina_nombre}</Text>
                    <Text style={[global_styles.secondaryText, { marginBottom: 16, fontSize: 13 }]}>
                        {formatDate(item.fecha_inicio)}
                        {item.duracion_min ? ` · ${item.duracion_min} min` : ''}
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                        {Object.entries(byExercise).map(([ex, { series, image_key }]) => {
                            const imgSource = image_key ? exerciseImageMap[image_key] : null;
                            return (
                                <View key={ex} style={[train_styles.whc_exerciseBlock, { borderTopColor: colors.border }]}>
                                    {/* Exercise header with image */}
                                    <View style={train_styles.whc_exHeader}>
                                        {imgSource
                                            ? <Image source={imgSource} style={train_styles.whc_exImg} />
                                            : <View style={[train_styles.whc_exImg, { backgroundColor: colors.backgroundPrimary, borderRadius: 20 }]} />
                                        }
                                        <Text style={[global_styles.principalText, { color: colors.primary, fontWeight: '700', flex: 1 }]}>
                                            {ex}
                                        </Text>
                                    </View>

                                    {/* Column headers */}
                                    <View style={train_styles.whc_tableRow}>
                                        <Text style={[train_styles.whc_colSet, global_styles.secondaryText]}>{t('set')}</Text>
                                        <Text style={[train_styles.whc_colKg, global_styles.secondaryText]}>{t('kg')}</Text>
                                        <Text style={[train_styles.whc_colReps, global_styles.secondaryText]}>{t('reps')}</Text>
                                    </View>
                                    {series.map((s, i) => (
                                        <View key={i} style={train_styles.whc_tableRow}>
                                            <Text style={[train_styles.whc_colSet, global_styles.principalText, { fontWeight: '700' }]}>
                                                {s.num_serie}
                                            </Text>
                                            <Text style={[train_styles.whc_colKg, global_styles.principalText]}>{s.peso_kg}</Text>
                                            <Text style={[train_styles.whc_colReps, global_styles.principalText]}>{s.repeticiones}</Text>
                                        </View>
                                    ))}
                                </View>
                            );
                        })}

                        {item.series.length === 0 && (
                            <Text style={[global_styles.secondaryText, { textAlign: 'center', marginVertical: 24 }]}>
                                {t('no_sets_recorded')}
                            </Text>
                        )}
                    </ScrollView>

                    <Pressable
                        style={[train_styles.whc_closeBtn, { backgroundColor: colors.backgroundPrimary }]}
                        onPress={() => setPreviewVisible(false)}
                    >
                        <Text style={global_styles.principalText}>{t('close')}</Text>
                    </Pressable>
                </View>
            </Modal>
        </>
    );
}
