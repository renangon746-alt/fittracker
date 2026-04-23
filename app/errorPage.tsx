import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { globalStyles } from "@/styles/global-styles";
import { Image, Text, View } from "react-native";

export default function ErrorPage(){
    const {colors} = useTheme();
    const { t } = useTranslation();
    const styles = globalStyles(colors);

    return (
        <View style={{flex: 1, backgroundColor: colors.backgroundPrimary, flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'}}>

            <View style={{padding:20}}>
                <Image source={require('../assets/images/Icon__dumbell_fitTracker.png')} style={styles.principalLogoImage}/>
            </View>

            <Text style={[styles.secondaryText, {color: colors.primary, fontSize: 28}]}>
                {t('error_title')}
            </Text>

            <Text style={styles.principalText}>
                {t('error_message')}
            </Text>

            <Text style={[styles.secondaryText, {color: colors.primary}]}>
                {t('error_working')}
            </Text>
        </View>
    );
}
