import { exercises } from "@/assets/data/exercises";
import {
  getExerciseDescriptionTranslationKey,
  getExerciseTranslationKey,
  getMuscleTranslationKey,
} from "@/constants/translationMaps";
import { useTranslation } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { globalStyles } from "@/styles/global-styles";
import { Stack, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, Text, View } from "react-native";

export default function ExerciseDetail(){
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = globalStyles(colors);

    const { id } = useLocalSearchParams();
    //Lo paso a String porque id del router es en string
    const exercise = exercises.find((item) => item.id.toString() === id);
    
    if(!exercise) {
        return(
            <View>
                <Text>{t('exercise_not_found')}</Text>
            </View>
        );
    }

    const exerciseKey = getExerciseTranslationKey(exercise.exerciseName);
    const muscleKey = getMuscleTranslationKey(exercise.principalMuscleName);
    const descriptionKey = getExerciseDescriptionTranslationKey(exercise.exerciseName);
    const translatedExercise = t(exerciseKey, { defaultValue: exercise.exerciseName });
    const translatedMuscle = t(muscleKey, { defaultValue: exercise.principalMuscleName });
    const translatedDescription = t(descriptionKey, { defaultValue: '' });

    return(
        <ScrollView
            style={{ backgroundColor: colors.backgroundPrimary }}
            //Para que funcione en web Scroll view y los estilos
            contentContainerStyle={styles.exerciseDetailContainer} 
        >
            <Stack.Screen
                    options={{
                    title: translatedExercise,
                    headerStyle: {
                    backgroundColor: colors.backgroundPrimary,
                    },
                    headerTintColor: colors.textPrimary,
                }}
            />

            {/* Title */}
            <Text style={[styles.exerciseDetailTitle, { color: colors.textPrimary }]}> 
            {translatedExercise}
            </Text>
            {/* Contenedor blanco para fondo de la imagen en modo oscuro */}
            <View style={styles.exerciseDetailImageContainer}>
                {/* Image */}
                <Image
                source={exercise.image}
                style={styles.exerciseDetailImage}
                resizeMode="contain"
                accessible
                accessibilityLabel={translatedExercise}
                />
            </View>
            {/* Info */}
            <View
                style={[
                    styles.exerciseDetailInfoContainer,
                    { backgroundColor: colors.backgroundSecondary }
                ]}
            >

                <Text style={[styles.exerciseDetailLabel, { color: colors.textSecondary }]}> 
                    {t('main_muscle')}
                </Text>

                <Text style={[styles.exerciseDetailValue, { color: colors.textPrimary }]}> 
                    {translatedMuscle}
                </Text>

                {!!translatedDescription && (
                  <>
                    <Text style={[styles.exerciseDetailLabel, { color: colors.textSecondary, marginTop: 14 }]}> 
                      {t('description')}
                    </Text>

                    <Text style={[styles.exerciseDetailDescriptionValue, { color: colors.textPrimary }]}> 
                      {translatedDescription}
                    </Text>
                  </>
                )}

            </View>
        </ScrollView>
    );
}
