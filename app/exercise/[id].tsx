import { exercises } from "@/assets/data/exercises";
import { useTheme } from "@/context/ThemeContext";
import { Stack, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ExerciseDetail(){
    const { colors } = useTheme();

    const { id } = useLocalSearchParams();
    //Lo paso a String porque id del router es en string
    const exercise = exercises.find((item) => item.id.toString() === id);
    
    if(!exercise) {
        return(
            <View>
                <Text>Exercise not found.</Text>
            </View>
        );
    }

    return(
        <ScrollView
            style={{ backgroundColor: colors.backgroundPrimary }}
            //Para que funcione en web Scroll view y los estilos
            contentContainerStyle={styles.container} 
        >
            <Stack.Screen
                    options={{
                    title: exercise.exerciseName,
                    headerStyle: {
                    backgroundColor: colors.backgroundPrimary,
                    },
                    headerTintColor: colors.textPrimary,
                }}
            />

            {/* Title */}
            <Text style={[styles.title, { color: colors.textPrimary }]}>
            {exercise.exerciseName}
            </Text>
            {/* Contenedor blanco para fondo de la imagen en modo oscuro */}
            <View style={styles.imageContainer}>
                {/* Image */}
                <Image
                source={exercise.image}
                style={styles.image}
                resizeMode="contain"
                accessible
                accessibilityLabel={'Image of ${exercise.exerciseName}'}
                />
            </View>
            {/* Info */}
            <View
                style={[
                    styles.infoContainer,
                    { backgroundColor: colors.backgroundSecondary }
                ]}
            >

                <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Main muscle
                </Text>

                <Text style={[styles.value, { color: colors.textPrimary }]}>
                    {exercise.principalMuscleName}
                </Text>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },

  title: {
    fontSize: 26,
    fontFamily: "Poppins",
    marginBottom: 16,
  },

  imageContainer: {
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 20,
    },

  image: {
    width: "100%",
    height: 220,
  },

  infoContainer: {
    width: "90%",
    padding: 16,
    borderRadius: 12,
  },

  label: {
    fontSize: 14,
    opacity: 0.7,
  },

  value: {
    fontSize: 18,
    fontWeight: "600",
  },
});
