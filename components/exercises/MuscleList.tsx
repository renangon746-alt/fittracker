import { View } from "react-native";
import MuscleCard from "./MuscleCard";

interface ExerciseItem {
  id: number;
  image: number;
  exerciseName: string;
  principalMuscleName: string;
}

interface MuscleListProps {
  exercises: ExerciseItem[];
}

export default function MuscleList({ exercises }: MuscleListProps) {
  return (
    <View>
      {exercises.map(exercise => (
        <MuscleCard
          key={exercise.id}
          id={exercise.id}
          image={exercise.image}
          exerciseName={exercise.exerciseName}
          principalMuscleName={exercise.principalMuscleName}
        />
      ))}
    </View>
  );
}
