import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function ThemeScreen() {
  const { theme, toggleTheme, colors } = useTheme(); // hook del context
  const isDark = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      
      {/* Header automático con Expo Router */}
      <Stack.Screen
        options={{
          title: "Change theme",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: colors.backgroundPrimary },
          headerTintColor: colors.textPrimary,
        }}
      />

      {/* Contenedor del Switch como fila */}
      <View style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
        <Text style={[styles.text, { color: colors.textPrimary }]}>Dark Mode 😈</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme} // cambia tema en toda la app
          trackColor={{ false: colors.backgroundSecondary, true: colors.primary }}
          thumbColor={colors.backgroundTertiary}
          style={{ marginLeft: "auto" , transform: [{ scale: 1.2 }]}} // mueve el switch a la derecha
          
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 16,
  },
});
