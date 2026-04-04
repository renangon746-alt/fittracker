import StreakBadge from "@/components/StreakBadge";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { globalStyles } from "@/styles/global-styles";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Text, View } from "react-native";

const defaultAvatar = require('../assets/images/defaultAvatar.png');

export default function ProfileDescription(){
    const { id, userName, fullName, favoriteMuscle } = useLocalSearchParams();
    const {colors} = useTheme();
    const styles = globalStyles(colors);
    const { data } = supabase.storage.from('avatars').getPublicUrl(`${id}/avatar.jpg`);
    const [imgError, setImgError] = useState(false);

    return(
        <View style={{flex: 1, backgroundColor: colors.backgroundPrimary, flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'}}>

            {/* Profile and Image */}
            <View style={{ flexDirection: 'row' , alignItems: 'center', gap: 45, justifyContent: 'space-between'}}>
                    <Image
                        source={imgError ? defaultAvatar : { uri: data.publicUrl }}
                        onError={() => setImgError(true)}
                        style={styles.profileImage}
                    />
                    <Text style={styles.tittleText}>{userName}</Text>
                <StreakBadge count={15}/>
            </View>

            {/* Profile Stats */}
            <View style={{ flexDirection: 'row' , alignItems: 'center', gap: 15}}>
                <View style={{flexDirection: 'column', alignItems: 'center', gap: 5, marginTop: 10}}>
                    <Text style={styles.secondaryText}>Trainings</Text>
                    <Text style={styles.secondaryText}>103</Text>
                </View>

                <View style={{flexDirection: 'column', alignItems: 'center', gap: 5, marginTop: 10}}>
                    <Text style={styles.secondaryText}>Followers</Text>
                    <Text style={styles.secondaryText}>100</Text>
                </View>

                <View style={{flexDirection: 'column', alignItems: 'center', gap: 5, marginTop: 10}}>
                    <Text style={styles.secondaryText}>Following</Text>
                    <Text style={styles.secondaryText}>2</Text>
                </View>
            </View>
        </View>
    );
}