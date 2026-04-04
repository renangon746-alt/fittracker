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
        <View style={{ flexDirection: 'row' , alignItems: 'center', gap: 15}}>
            <Image
                source={imgError ? defaultAvatar : { uri: data.publicUrl }}
                onError={() => setImgError(true)}
                style={styles.profileImage}
            />
            <Text style={styles.tittleText}>{userName}</Text>
        </View>
    );
}