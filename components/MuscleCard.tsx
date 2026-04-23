import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/context/LanguageContext";
import {
  getExerciseTranslationKey,
  getMuscleTranslationKey,
} from "@/constants/translationMaps";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface MuscleCardProps {
  id: number;
  image: number;
  exerciseName: string;
  principalMuscleName: string;
}

export default function MuscleCard({ id, image, exerciseName, principalMuscleName }: MuscleCardProps){
  const { colors } = useTheme();
  const { t } = useTranslation();

  const exerciseKey = getExerciseTranslationKey(exerciseName);
  const muscleKey = getMuscleTranslationKey(principalMuscleName);
  const translatedExercise = t(exerciseKey, { defaultValue: exerciseName });
  const translatedMuscle = t(muscleKey, { defaultValue: principalMuscleName });
  
  return(
        <Pressable style={[styles.container, 
          { borderBottomColor: colors.border }]} 
          accessible
          accessibilityRole="button"
          accessibilityLabel={translatedExercise}
          accessibilityHint={t('opens_exercise_details')}
          onPress={() => router.push({ pathname: "/exercise/[id]", params: { id: id.toString() }})}>
            <Image style={styles.image} source={image} alt={translatedExercise} />
            <View style={styles.textContainer}>
                <Text style={[styles.exerciseName, { color: colors.textPrimary }]}> 
                    {translatedExercise}
                </Text>
                <Text style={[styles.muscleName, { color: colors.textSecondary }]}>
                    {translatedMuscle}
                </Text>
            </View>
            <Ionicons
                name="chevron-forward-outline"
                size={24}
                color={colors.primary} // color principal naranja
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    gap: 16,
    borderBottomWidth: 1,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  textContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  muscleName: {
    marginTop: 4,
    fontSize: 14,
  },
});
