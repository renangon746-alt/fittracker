import { exercises } from "@/assets/data/exercises";
import MuscleList from "@/components/exercises/MuscleList";
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { globalStyles } from '@/styles/global-styles';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';

export default function Exercises() { 

  const [search, setSearchText] = useState(exercises);
  const [searchValue, setSearchValue] = useState('');
  const { t } = useTranslation();

  function searchExercises(text: string){
    setSearchValue(text);
    const filteredExercises = exercises.filter(exercise =>
      exercise.exerciseName
        .toLowerCase()
        .includes(text.toLowerCase())
    );
    setSearchText(filteredExercises);
  }

  const { colors } = useTheme();
  const styles = globalStyles(colors);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.exercisesSearchContainer}>
        <TextInput
          style={[styles.exercisesInput, { 
            backgroundColor: colors.backgroundTertiary, 
            borderColor: colors.border,
            color: colors.textPrimary
          }]}
          placeholder={t('search_exercises_placeholder')}
          placeholderTextColor={colors.textSecondary}
          onChangeText={searchExercises}
          value={searchValue}
          accessibilityLabel={t('search_exercises_placeholder')}
          accessibilityHint={t('search')}
        />
        <Ionicons
          style={styles.exercisesSearchIcon}
          name="search"
          size={20}
          color={colors.iconInactive}
        />
      </View>

      {search.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }} testID="no-results">
          {t('no_exercises_found')}
        </Text>
      ) : (
        <MuscleList exercises={search} />
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
