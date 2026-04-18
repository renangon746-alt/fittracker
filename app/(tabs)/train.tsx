import RoutineCard from '@/components/RoutineCard';
import { useTheme } from '@/context/ThemeContext';
import { globalStyles } from '@/styles/global-styles';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function Train() {
  const { colors } = useTheme();
  const styles = globalStyles(colors);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.backgroundPrimary}}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Tittle and search */}
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 16}}>
          <Text style={styles.tittleText}>Fast Start</Text>     
          <Ionicons name="search" size={24} color={colors.textPrimary} />
        </View>

        {/* Button empty training */}
        <View style={{ alignItems: 'center', gap: 20}}>
          <Pressable style={[styles.principalButton, { width: '90%', height: 40}]}>
            <Text style={styles.principalText}>Start empty training +</Text>
          </Pressable>   
        </View>

        {/* Routines */}
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 16}}>
          <Text style={styles.tittleText}>Routines</Text>     
          <Ionicons name="folder-open" size={24} color={colors.textPrimary}/>
        </View>
          
        {/* List of routines folders*/}
        <View style={{flexDirection: 'column', alignItems: 'center', gap: 20}}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 25}}>
              <View style={{flexDirection: 'row', alignItems: 'baseline', gap: 10}}>
                <Text style={styles.principalText}>Other Folders</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textPrimary}/>  
              </View>
              <Text style={styles.principalText}>...</Text> 
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 25}}>
              <View style={{flexDirection: 'row', alignItems: 'baseline', gap: 10}}>
                <Text style={styles.principalText}>Other Folders</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textPrimary}/>  
              </View>
              <Text style={styles.principalText}>...</Text> 
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 25}}>
              <View style={{flexDirection: 'row', alignItems: 'baseline', gap: 10}}>
                <Text style={styles.principalText}>Other Folders</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textPrimary}/>  
              </View>
              <Text style={styles.principalText}>...</Text> 
            </View>
        </View>
          
        {/* Routines*/}
        <View style={{flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: 20}}>
          <RoutineCard id="1" title="Chest Day" day="Monday" />
          <RoutineCard id="2" title="Back Day" day="Tuesday" />
          <RoutineCard id="3" title="Arm Day" day="Thursday" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

