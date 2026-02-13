import { useTheme } from "@/context/ThemeContext";
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function Home() {
//estilo claro/oscuro:
  const colorScheme = useColorScheme();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <Text style={{color: colors.textPrimary}}>Tab Home</Text>
      <Text style={{color: colors.textPrimary}}>{colorScheme}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
});
