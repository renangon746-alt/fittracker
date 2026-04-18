import { useTheme } from "@/context/ThemeContext";
import { globalStyles } from "@/styles/global-styles";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RoutineProps {
  id: string;
}
const screenWidth = Dimensions.get('window').width;

export default function routine(id: RoutineProps) {
  const { colors } = useTheme();
  const styles = globalStyles(colors);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.backgroundPrimary}}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Tittle */}
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 16}}>
          <Ionicons name="chevron-down" size={14} color={colors.textPrimary}/> 
          <Text style={styles.tittleText}>Entrenamiento</Text>     
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </View>

        {/* Statistics */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: screenWidth < 350 ? 10 : 20}}>
          <View style={{flexDirection: 'column', alignItems: 'center', gap: 5}}>
            <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 12 : 18}]}>Duration</Text>
            <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 16 : 14}]}>0min 00s</Text>
          </View>

          <View style={{flexDirection: 'column', alignItems: 'center', gap: 5}}>
            <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 12 : 18}]}>Records</Text>
            <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 16 : 14}]}>0</Text>
          </View>

          <View style={{flexDirection: 'column', alignItems: 'center', gap: 5}}>
              <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 12 : 18}]}>Sets</Text>
              <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 16 : 14}]}>0</Text>
          </View>
        </View>

        {/* Separator*/}
        <View style={{ width: '90%', height: 1, backgroundColor: colors.textPrimary, marginTop: 15, alignSelf: 'center'}} />

        {/* Button empty training */}
        <View style={{ alignItems: 'center', gap: 20, paddingVertical: 20}}>
          <Pressable style={[styles.principalButton, { width: '90%', height: 40}]}>
            <Text style={styles.principalText}>+ Add Exercise</Text>
          </Pressable>   
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}