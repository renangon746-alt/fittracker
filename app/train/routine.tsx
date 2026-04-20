import { useTheme } from "@/context/ThemeContext";
import { globalStyles } from "@/styles/global-styles";
import { trainStyles } from "@/styles/train-styles";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get('window').width;

export default function Routine() {
  const { colors } = useTheme();
  const global_styles = globalStyles(colors);
  const train_styles = trainStyles(colors);
  const [isPlaying, setIsPlaying] = useState(false);

  // Read params passed from the create modal or from RoutineCard
  const { id, nombre } = useLocalSearchParams<{ id: string; nombre: string }>();

  return (
    <SafeAreaView style={global_styles.defaultContainer}>
      <ScrollView contentContainerStyle={global_styles.defaultScroll}>

        {/* Title */}
        <View style={train_styles.r_tittle}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-down" size={14} color={colors.textPrimary} />
          </Pressable>
          <Text style={global_styles.tittleText}>{nombre ?? 'Routine'}</Text>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Statistics */}
        <View style={train_styles.r_statistics}>
          <View style={train_styles.r_stat}>
            <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 18 }]}>Duration</Text>
            <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 14 }]}>0min 00s</Text>
          </View>
          <View style={train_styles.r_stat}>
            <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 18 }]}>Records</Text>
            <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 14 }]}>0</Text>
          </View>
          <View style={train_styles.r_stat}>
            <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 18 }]}>Sets</Text>
            <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 14 }]}>0</Text>
          </View>
        </View>

        {/* Separator */}
        <View style={global_styles.separator} />

        {/* Add Exercise button */}
        <View style={train_styles.r_addExerciseButton}>
          <Pressable style={[global_styles.principalButton, train_styles.r_addExercisePressable]}>
            <Text style={global_styles.principalText}>+ Add Exercise</Text>
          </Pressable>
        </View>

      </ScrollView>

      {/* Bottom Timer Bar */}
      <View style={train_styles.r_bottomTimerBar}>
        <Text style={[global_styles.principalText, { fontSize: 18, fontWeight: '600' }]}>
          0:00
        </Text>

        <Pressable onPress={() => setIsPlaying(!isPlaying)} style={train_styles.r_playPauseButton}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#000" />
        </Pressable>

        <View style={train_styles.r_timeAdjustmentControls}>
          <Pressable style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={[global_styles.principalText, { fontSize: 14 }]}>-15s</Text>
          </Pressable>
          <Pressable style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={[global_styles.principalText, { fontSize: 14 }]}>+15s</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
