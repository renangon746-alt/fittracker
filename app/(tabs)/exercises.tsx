import { exercises } from "@/assets/data/exercises";
import MuscleList from '@/components/MuscleList';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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

  return (
    <ScrollView style={{ backgroundColor: colors.backgroundPrimary }}>
      <View style={styles.search_container}>
        <TextInput
          style={[styles.input, { 
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
          style={styles.icon}
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
  );
}

const styles = StyleSheet.create({
  search_container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    borderRadius: 30,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 44,
    borderWidth: 1,
  },
  icon: {
    position: "absolute",
    right: 24,
  },
});
