import RoutineCard from '@/components/RoutineCard';
import { useTheme } from '@/context/ThemeContext';
import { globalStyles } from '@/styles/global-styles';
import { trainStyles } from '@/styles/train-styles';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function Train() {
  const { colors } = useTheme();
  const global_styles = globalStyles(colors);
  const train_styles = trainStyles(colors);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.backgroundPrimary}}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Tittle and search */}
        <View style={train_styles.t_tittleAndSearch}>
          <Text style={global_styles.tittleText}>Fast Start</Text>     
          <Ionicons name="search" size={24} color={colors.textPrimary} />
        </View>
 
        {/* Button empty training */}
        <View style={{ alignItems: 'center', gap: 20}}>
          <Pressable style={[global_styles.principalButton, { width: '90%', height: 40}]}>
            <Text style={global_styles.principalText}>Start empty training +</Text>
          </Pressable>   
        </View>

        {/* Routines */}
        <View style={train_styles.t_routinesTittle}>
          <Text style={global_styles.tittleText}>Routines</Text>     
          <Ionicons name="folder-open" size={24} color={colors.textPrimary}/>
        </View>
          
        {/* List of routines folders*/}
        <View style={train_styles.t_routinesFoldersList}>
            <View style={train_styles.t_routineFolder}>
              <View style={train_styles.t_routineFolderTextIcon}>
                <Text style={global_styles.principalText}>Other Folders</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textPrimary}/>  
              </View>
              <Text style={global_styles.principalText}>...</Text> 
            </View>

            <View style={train_styles.t_routineFolder}>
              <View style={train_styles.t_routineFolderTextIcon}>
                <Text style={global_styles.principalText}>Other Folders</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textPrimary}/>  
              </View>
              <Text style={global_styles.principalText}>...</Text> 
            </View>

            <View style={train_styles.t_routineFolder}>
              <View style={train_styles.t_routineFolderTextIcon}>
                <Text style={global_styles.principalText}>Other Folders</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textPrimary}/>  
              </View>
              <Text style={global_styles.principalText}>...</Text> 
            </View>
        </View>
          
        {/* Routines*/}
        <View style={train_styles.t_routinesList}>
          <RoutineCard id="1" title="Chest Day" day="Monday" />
          <RoutineCard id="2" title="Back Day" day="Tuesday" />
          <RoutineCard id="3" title="Arm Day" day="Thursday" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

