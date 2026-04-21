import { trainStyles } from '@/styles/train-styles';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useRef } from 'react';
import { Animated, Image } from 'react-native';

interface NewRecordOverlayProps {
    visible: boolean;
}

const appLogo = require('../../assets/images/Icon__dumbell_fitTracker.png');

export default function NewRecordOverlay({ visible }: NewRecordOverlayProps) {
    const { colors } = useTheme();
    const train_styles = trainStyles(colors);
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start(() => {
                setTimeout(() => {
                    Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start();
                }, 1800);
            });
        } else {
            opacity.setValue(0);
            scale.setValue(0.5);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[train_styles.nro_overlay, { opacity }]}>
            <Animated.View style={[train_styles.nro_card, { transform: [{ scale }] }]}>
                <Image source={appLogo} style={train_styles.nro_logo} resizeMode="contain" />
                <Animated.Text style={train_styles.nro_text}>🏆 New Record!</Animated.Text>
            </Animated.View>
        </Animated.View>
    );
}
