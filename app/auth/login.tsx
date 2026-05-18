import { useLanguage, useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useLogin } from '@/hooks/auth/useLogin';
import { globalStyles } from "@/styles/global-styles";
import { profileStyles } from '@/styles/profile-styles';
import { router } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Login(){
    const {colors} = useTheme();
    const { t } = useTranslation();
    const { language, setLanguage } = useLanguage();
    const global_styles = globalStyles(colors);
    const profile_styles = profileStyles(colors);
    const { email, setEmail, password, setPassword, errorMsg, handleLogin } = useLogin();

    // Twemoji renders consistently on every platform (Windows, iOS, Android, web),
    // unlike system flag emojis which fall back to letters on Windows.
    const languages: { code: 'es' | 'en'; flag: string; label: string }[] = [
        { code: 'es', flag: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f1ea-1f1f8.png', label: 'ES' },
        { code: 'en', flag: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f1ec-1f1e7.png', label: 'EN' },
    ];


    return (
        <SafeAreaView style={global_styles.defaultContainer}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={global_styles.defaultScroll}>
                    
                    <View style={profile_styles.auth_container}>

                        <Image source={require('../../assets/images/Icon__dumbell_fitTracker.png')} style={global_styles.principalLogoImage}/>

                        <Text style={global_styles.tittleText}>{t('login_title')}</Text>

                        {/* Language switcher */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 12,
                            marginTop: 16,
                            marginBottom: 8,
                        }}>
                            {languages.map(lang => {
                                const active = language === lang.code;
                                return (
                                    <Pressable
                                        key={lang.code}
                                        onPress={() => setLanguage(lang.code)}
                                        accessibilityRole="button"
                                        accessibilityLabel={lang.label}
                                        accessibilityState={{ selected: active }}
                                        style={({ pressed }) => ({
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 6,
                                            paddingHorizontal: 14,
                                            paddingVertical: 8,
                                            borderRadius: 24,
                                            borderWidth: 1.5,
                                            borderColor: active ? colors.primary : colors.border,
                                            backgroundColor: active ? colors.primary + '22' : colors.backgroundPrimary,
                                            opacity: pressed ? 0.6 : 1,
                                        })}
                                    >
                                        <Image
                                            source={{ uri: lang.flag }}
                                            style={{ width: 20, height: 20 }}
                                            accessibilityIgnoresInvertColors
                                        />
                                        <Text style={{
                                            fontSize: 13,
                                            fontWeight: '700',
                                            color: active ? colors.primary : colors.textSecondary,
                                        }}>
                                            {lang.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

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
                </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
