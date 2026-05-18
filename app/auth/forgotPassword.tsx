import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';
import { globalStyles } from "@/styles/global-styles";
import { profileStyles } from '@/styles/profile-styles';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPassword() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const global_styles = globalStyles(colors);
    const profile_styles = profileStyles(colors);
    const { email, setEmail, errorMsg, successMsg, handleForgotPassword } = useForgotPassword();
    const { from } = useLocalSearchParams();
    
    return (
        <SafeAreaView style={global_styles.defaultContainer}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={global_styles.defaultScroll}>
                    <View style={profile_styles.auth_container}>

                        <Image source={require('../../assets/images/Icon__dumbell_fitTracker.png')} style={global_styles.principalLogoImage} />

                        <Text style={global_styles.tittleText}>{t('forgot_title')}</Text>

                        <View style={{ paddingTop: 20 }}>
                            <Text style={[global_styles.principalText, { paddingLeft: 10 }]}>{t('email')}</Text>
                            <TextInput style={global_styles.inputs} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        </View>

                        {errorMsg && <Text style={[global_styles.secondaryText, profile_styles.loadProfileErrorMessage]}>{errorMsg}</Text>}
                        {successMsg && <Text style={[global_styles.secondaryText, profile_styles.loadProfileSuccesMessage]}>{successMsg}</Text>}

                        <View style={profile_styles.buttonContainer}>
                            <Pressable style={global_styles.principalButton} onPress={handleForgotPassword}>
                                <Text style={global_styles.principalText}>
                                    {t('send_email')}
                                </Text>
                            </Pressable>
                        </View>

                        <Pressable onPress={() => from === 'settings' ? router.back() : router.replace('../../auth/login')}>
                            <Text style={global_styles.underlineText}>
                                {t('back')}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
