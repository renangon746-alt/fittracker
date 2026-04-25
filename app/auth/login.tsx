import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useLogin } from '@/hooks/auth/useLogin';
import { globalStyles } from "@/styles/global-styles";
import { profileStyles } from '@/styles/profile-styles';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Login(){
    const {colors} = useTheme();
    const { t } = useTranslation();
    const global_styles = globalStyles(colors);
    const profile_styles = profileStyles(colors);
    const { email, setEmail, password, setPassword, errorMsg, handleLogin } = useLogin();


    return (
        <SafeAreaView style={global_styles.defaultContainer}>
            <ScrollView contentContainerStyle={global_styles.defaultScroll}>
                <View style={profile_styles.auth_container}>

                    <Image source={require('../../assets/images/Icon__dumbell_fitTracker.png')} style={global_styles.principalLogoImage}/>

                    <Text style={global_styles.tittleText}>{t('login_title')}</Text>

                    <View style={{paddingTop: 20}}>
                        <Text style={[global_styles.principalText, {paddingLeft:10}]}>{t('email')}</Text>
                        <TextInput style={global_styles.inputs} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

                        <View style={{ paddingTop: 20}}>
                            <Text style={[global_styles.principalText, {paddingLeft:10}]}>{t('password')}</Text>
                            <TextInput style={global_styles.inputs} value={password} onChangeText={setPassword} secureTextEntry />
                            <Pressable onPress={() => router.push('../../auth/forgotPassword')}>
                                <Text style={[global_styles.underlineText, {paddingLeft:10}]}>{t('forgot_password')}</Text>
                            </Pressable>
                        </View>

                    </View>

                    {errorMsg && <Text style={[global_styles.secondaryText, profile_styles.loadProfileErrorMessage]}>{errorMsg}</Text>}

                    <View style={profile_styles.buttonContainer}>
                        <Pressable style={global_styles.principalButton} onPress={handleLogin}>
                            <Text style={global_styles.principalText}>
                                {t('login_button')}
                            </Text>
                        </Pressable>
                    </View>

                    <Pressable onPress={() => router.push('../../auth/register')}>
                        <Text style={[global_styles.underlineText]}>{t('no_account')}</Text>
                    </Pressable>
                </View>
                </ScrollView>
        </SafeAreaView>
    );
}
