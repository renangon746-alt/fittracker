export function generateExercises(amount: number) {
  return Array.from({ length: amount }, (_, i) => ({
    id: i + 1,
    image: 1,
    exerciseName: `Exercise ${i + 1}`,
    principalMuscleName: "Chest",
  }));
}