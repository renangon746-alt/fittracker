import { exercises } from "@/assets/data/exercises";
import MuscleList from '@/components/MuscleList';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function Exercises() { 

  const [search, setSearchText] = useState(exercises);

  function searchExercises(event:any){

    const searchText = event.target.value;

    // NUEVO ARRAY CREADO CADA VEZ QUE CAMBIA EL INPUT console.log(searchText);
    const filteredExercises = exercises.filter(exercise =>
      exercise.exerciseName
        .toLowerCase()
        .includes(searchText.toLowerCase())
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
          placeholder="Search exercises here..."
          placeholderTextColor={colors.textSecondary}
          onChange={searchExercises}
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
      <MuscleList exercises={search} />
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
