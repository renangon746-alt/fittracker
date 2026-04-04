import { useTheme } from '@/context/ThemeContext';
import { globalStyles } from "@/styles/global-styles";
import { Image, Text, View } from "react-native";

export default function ErrorPage(){
    const {colors} = useTheme();
    const styles = globalStyles(colors);

    return (
        <View style={{flex: 1, backgroundColor: colors.backgroundPrimary, flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'}}>

            <View style={{padding:20}}>
                <Image source={require('../assets/images/Icon__dumbell_fitTracker.png')} style={styles.principalLogoImage}/>
            </View>

            <Text style={[styles.secondaryText, {color: colors.primary, fontSize: 28}]}>
                ERROR
            </Text>

            <Text style={styles.principalText}>
                Lo sentimos, ha surgido un error desconocido
            </Text>

            <Text style={[styles.secondaryText, {color: colors.primary}]}>
                Estamos trabajando en ello
            </Text>
        </View>
    );
}
