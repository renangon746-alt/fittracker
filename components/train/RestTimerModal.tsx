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

function snapIndex(y: number): number {
    return Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), TIME_OPTIONS.length - 1));
}

export default function RestTimerModal({ visible, initialSeconds, onConfirm, onCancel }: RestTimerModalProps) {
    const { colors } = useTheme();
    const global_styles = globalStyles(colors);
    const train_styles = trainStyles(colors);
    const scrollRef = useRef<ScrollView>(null);

    const nearest = Math.round(initialSeconds / 15) * 15;
    const initialIdx = TIME_OPTIONS.indexOf(nearest) !== -1 ? TIME_OPTIONS.indexOf(nearest) : 0;

    const [selectedIdx, setSelectedIdx] = useState(initialIdx);
    // Ref always holds the latest index — used in onConfirm to avoid stale closure
    const selectedIdxRef = useRef(initialIdx);

    useEffect(() => {
        if (visible) {
            const idx = TIME_OPTIONS.indexOf(nearest) !== -1 ? TIME_OPTIONS.indexOf(nearest) : 0;
            setSelectedIdx(idx);
            selectedIdxRef.current = idx;
            setTimeout(() => {
                scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
            }, 80);
        }
    }, [visible]);

    function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
        const y = e.nativeEvent.contentOffset.y;
        const idx = snapIndex(y);
        if (idx !== selectedIdxRef.current) {
            selectedIdxRef.current = idx;
            setSelectedIdx(idx);
        }
    }

    function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
        const y = e.nativeEvent.contentOffset.y;
        const idx = snapIndex(y);
        selectedIdxRef.current = idx;
        setSelectedIdx(idx);
        scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
    }

    const visibleHeight = ITEM_HEIGHT * VISIBLE_ITEMS;
    const padding = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
            <Pressable
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
                onPress={onCancel}
            />
            <View style={[train_styles.rtm_sheet, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={[train_styles.rtm_handle, { backgroundColor: colors.border }]} />
                <Text style={[global_styles.tittleText, train_styles.rtm_title]}>Rest Timer</Text>

                {/* Selected preview */}
                <Text style={[global_styles.tittleText, { fontSize: 22, marginBottom: 8, color: colors.primary }]}>
                    {formatOption(TIME_OPTIONS[selectedIdx])}
                </Text>

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
                        onScroll={handleScroll}
                        onMomentumScrollEnd={handleScrollEnd}
                        onScrollEndDrag={handleScrollEnd}
                        scrollEventThrottle={16}
                        contentContainerStyle={{ paddingVertical: padding }}
                    >
                        {TIME_OPTIONS.map((t, i) => {
                            const isSelected = i === selectedIdx;
                            return (
                                <Pressable
                                    key={t}
                                    style={[train_styles.rtm_item, { height: ITEM_HEIGHT }]}
                                    onPress={() => {
                                        selectedIdxRef.current = i;
                                        setSelectedIdx(i);
                                        scrollRef.current?.scrollTo({ y: i * ITEM_HEIGHT, animated: true });
                                    }}
                                >
                                    <Text style={{
                                        color: isSelected ? colors.textPrimary : colors.textSecondary,
                                        fontSize: isSelected ? 20 : 16,
                                        fontWeight: isSelected ? '700' : '400',
                                    }}>
                                        {formatOption(t)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                <Pressable
                    style={[train_styles.rtm_doneBtn, { backgroundColor: colors.primary }]}
                    onPress={() => onConfirm(TIME_OPTIONS[selectedIdxRef.current])}
                >
                    <Text style={[global_styles.principalText, { color: '#fff', fontSize: 16 }]}>Done</Text>
                </Pressable>
            </View>
        </Modal>
    );
}
