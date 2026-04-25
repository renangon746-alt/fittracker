import { useTheme } from '@/context/ThemeContext';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { useEffect, useRef, useState } from 'react';
import {
    Modal, NativeScrollEvent, NativeSyntheticEvent,
    Pressable, ScrollView, Text, View,
} from 'react-native';

interface RestTimerModalProps {
    visible: boolean;
    initialSeconds: number;
    onConfirm: (seconds: number) => void;
    onCancel: () => void;
}

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;

const TIME_OPTIONS: number[] = [];
for (let s = 0; s <= 600; s += 15) TIME_OPTIONS.push(s);

function formatOption(s: number): string {
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
    const scrollRef = useRef<ScrollView>(null);
    const [selected, setSelected] = useState(initialSeconds);
    const nearest = Math.round(initialSeconds / 15) * 15;

    useEffect(() => {
        if (visible) {
            const idx = TIME_OPTIONS.indexOf(nearest) !== -1 ? TIME_OPTIONS.indexOf(nearest) : 0;
            setSelected(TIME_OPTIONS[idx]);
            setTimeout(() => {
                scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
            }, 50);
        }
    }, [visible]);

    function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
        const y = e.nativeEvent.contentOffset.y;
        const idx = Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), TIME_OPTIONS.length - 1));
        setSelected(TIME_OPTIONS[idx]);
        scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
    }

    const visibleHeight = ITEM_HEIGHT * VISIBLE_ITEMS;
    const padding = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
            <Pressable style={train_styles.rtm_backdrop} onPress={onCancel} />
            <View style={[train_styles.rtm_sheet, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={[train_styles.rtm_handle, { backgroundColor: colors.border }]} />
                <Text style={[global_styles.tittleText, train_styles.rtm_title]}>Rest Timer</Text>

                <View style={[train_styles.rtm_pickerContainer, { height: visibleHeight }]}>
                    <View style={[
                        train_styles.rtm_selectionBar,
                        {
                            top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                            height: ITEM_HEIGHT,
                            backgroundColor: colors.backgroundPrimary,
                        }
                    ]} />
                    <ScrollView
                        ref={scrollRef}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        onMomentumScrollEnd={handleScrollEnd}
                        scrollEventThrottle={16}
                        contentContainerStyle={{ paddingVertical: padding }}
                    >
                        {TIME_OPTIONS.map((t) => {
                            const isSelected = t === selected;
                            return (
                                <View key={t} style={[train_styles.rtm_item, { height: ITEM_HEIGHT }]}>
                                    <Text style={{
                                        color: isSelected ? colors.textPrimary : colors.textSecondary,
                                        fontSize: isSelected ? 20 : 16,
                                        fontWeight: isSelected ? '700' : '400',
                                        zIndex: 1,
                                    }}>
                                        {formatOption(t)}
                                    </Text>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>

                <Pressable
                    style={[train_styles.rtm_doneBtn, { backgroundColor: colors.primary }]}
                    onPress={() => onConfirm(selected)}
                >
                    <Text style={[global_styles.principalText, { color: '#fff', fontSize: 16 }]}>Done</Text>
                </Pressable>
            </View>
        </Modal>
    );
}
