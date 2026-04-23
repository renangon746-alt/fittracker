import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/context/LanguageContext";
import { globalStyles } from "@/styles/global-styles";
import {
  getExerciseTranslationKey,
  getMuscleTranslationKey,
} from "@/constants/translationMaps";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

interface MuscleCardProps {
  id: number;
  image: number;
  exerciseName: string;
  principalMuscleName: string;
}

export default function MuscleCard({ id, image, exerciseName, principalMuscleName }: MuscleCardProps){
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = globalStyles(colors);

  const exerciseKey = getExerciseTranslationKey(exerciseName);
  const muscleKey = getMuscleTranslationKey(principalMuscleName);
  const translatedExercise = t(exerciseKey, { defaultValue: exerciseName });
  const translatedMuscle = t(muscleKey, { defaultValue: principalMuscleName });
  
  return(
        <Pressable style={[styles.muscleCardContainer, 
          { borderBottomColor: colors.border }]} 
          accessible
          accessibilityRole="button"
          accessibilityLabel={translatedExercise}
          accessibilityHint={t('opens_exercise_details')}
          onPress={() => router.push({ pathname: "/exercise/[id]", params: { id: id.toString() }})}>
            <Image style={styles.muscleCardImage} source={image} alt={translatedExercise} />
            <View style={styles.muscleCardTextContainer}>
                <Text style={[styles.muscleCardExerciseName, { color: colors.textPrimary }]}> 
                    {translatedExercise}
                </Text>
                <Text style={[styles.muscleCardMuscleName, { color: colors.textSecondary }]}>
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
