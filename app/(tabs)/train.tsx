import { useTheme } from '@/context/ThemeContext';
import { StyleSheet, Text, View } from 'react-native';

export default function Train() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <Text style={{color: colors.textPrimary}}>Tab Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
