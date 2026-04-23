function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function toSnakeCase(value: string) {
  return normalize(value).replace(/\s+/g, "_");
}

const exerciseTranslationKeyByName: Record<string, string> = {
  [normalize("Chest Fly")]: "exercise_chest_fly",
  [normalize("Bench Press")]: "exercise_bench_press",
  [normalize("Incline Bench Press")]: "exercise_incline_bench_press",
  [normalize("Pull Up")]: "exercise_pull_up",
  [normalize("Pull Ups")]: "exercise_pull_up",
  [normalize("Seated Row")]: "exercise_seated_row",
  [normalize("Lat Pulldown")]: "exercise_lat_pulldown",
  [normalize("Face Pull")]: "exercise_face_pull",
  [normalize("Shoulder Press")]: "exercise_shoulder_press",
  [normalize("Arnold Press")]: "exercise_arnold_press",
  [normalize("Lateral Raise")]: "exercise_lateral_raise",
  [normalize("Bicep Curl")]: "exercise_bicep_curl",
  [normalize("Bicep Curls")]: "exercise_bicep_curl",
  [normalize("Hammer Curl")]: "exercise_hammer_curl",
  [normalize("Concentration Curl")]: "exercise_concentration_curl",
  [normalize("Tricep Extension")]: "exercise_tricep_extension",
  [normalize("Skull Crushers")]: "exercise_skull_crushers",
  [normalize("Leg Press")]: "exercise_leg_press",
  [normalize("Bulgarian Split Squat")]: "exercise_bulgarian_split_squat",
  [normalize("Barbell Squat")]: "exercise_barbell_squat",
  [normalize("Hip Thrust")]: "exercise_hip_thrust",
  [normalize("Glute Bridge")]: "exercise_glute_bridge",
  [normalize("Hamstring Curl")]: "exercise_hamstring_curl",
  [normalize("Romanian Deadlift")]: "exercise_romanian_deadlift",
  [normalize("Calf Raise")]: "exercise_calf_raise",
  [normalize("Back Extension")]: "exercise_back_extension",
  [normalize("Hanging Leg Raise")]: "exercise_hanging_leg_raise",
};

const muscleTranslationKeyByName: Record<string, string> = {
  [normalize("Chest")]: "muscle_chest",
  [normalize("Back")]: "muscle_back",
  [normalize("Deltoids")]: "muscle_deltoids",
  [normalize("Biceps")]: "muscle_biceps",
  [normalize("Triceps")]: "muscle_triceps",
  [normalize("Quadriceps")]: "muscle_quadriceps",
  [normalize("Glutes")]: "muscle_glutes",
  [normalize("Hamstrings")]: "muscle_hamstrings",
  [normalize("Calves")]: "muscle_calves",
  [normalize("Lower Back")]: "muscle_lower_back",
  [normalize("Abs")]: "muscle_abs",
};

const exerciseDescriptionTranslationKeyByName: Record<string, string> = {
  [normalize("Chest Fly")]: "chest_fly_desc",
  [normalize("Bench Press")]: "bench_press_desc",
  [normalize("Incline Bench Press")]: "incline_bench_press_desc",
  [normalize("Pull Up")]: "pull_up_desc",
  [normalize("Pull Ups")]: "pull_up_desc",
  [normalize("Seated Row")]: "seated_row_desc",
  [normalize("Lat Pulldown")]: "lat_pulldown_desc",
  [normalize("Face Pull")]: "face_pull_desc",
  [normalize("Shoulder Press")]: "shoulder_press_desc",
  [normalize("Arnold Press")]: "arnold_press_desc",
  [normalize("Lateral Raise")]: "lateral_raise_desc",
  [normalize("Bicep Curl")]: "bicep_curl_desc",
  [normalize("Bicep Curls")]: "bicep_curl_desc",
  [normalize("Hammer Curl")]: "hammer_curl_desc",
  [normalize("Concentration Curl")]: "concentration_curl_desc",
  [normalize("Tricep Extension")]: "tricep_extension_desc",
  [normalize("Skull Crushers")]: "skull_crushers_desc",
  [normalize("Leg Press")]: "leg_press_desc",
  [normalize("Bulgarian Split Squat")]: "bulgarian_split_squat_desc",
  [normalize("Barbell Squat")]: "barbell_squat_desc",
  [normalize("Hip Thrust")]: "hip_thrust_desc",
  [normalize("Glute Bridge")]: "glute_bridge_desc",
  [normalize("Hamstring Curl")]: "hamstring_curl_desc",
  [normalize("Romanian Deadlift")]: "romanian_deadlift_desc",
  [normalize("Calf Raise")]: "calf_raise_desc",
  [normalize("Back Extension")]: "back_extension_desc",
  [normalize("Hanging Leg Raise")]: "hanging_leg_raise_desc",
};

export function getExerciseTranslationKey(name: string) {
  return exerciseTranslationKeyByName[normalize(name)] ?? `exercise_${toSnakeCase(name)}`;
}

export function getMuscleTranslationKey(name: string) {
  return muscleTranslationKeyByName[normalize(name)] ?? `muscle_${toSnakeCase(name)}`;
}

export function getExerciseDescriptionTranslationKey(name: string) {
  return exerciseDescriptionTranslationKeyByName[normalize(name)] ?? `${toSnakeCase(name)}_desc`;
}
