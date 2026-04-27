import { exercises } from "@/assets/data/exercises";
import MuscleList from '@/components/MuscleList';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Exercises() { 

  const [search, setSearchText] = useState(exercises);

  function searchExercises(text: string){
    const filteredExercises = exercises.filter(exercise =>
      exercise.exerciseName
        .toLowerCase()
        .includes(text.toLowerCase())
    );
    setSearchText(filteredExercises);
  }

  const { colors } = useTheme();

  return (
    <ScrollView style={{ backgroundColor: colors.backgroundSecondary }}>
      <View style={styles.search_container}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.backgroundTertiary, 
            borderColor: colors.border,
            color: colors.textPrimary
          }]}
          placeholder="Search exercises here..."
          placeholderTextColor={colors.textSecondary}
          onChangeText={searchExercises} // CORRECTO para RN
          accessibilityLabel="Search exercises"
          accessibilityHint="Type to filter exercises"
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
          No exercises found
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