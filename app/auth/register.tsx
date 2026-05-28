import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useRegister } from '@/hooks/auth/useRegister';
import { globalStyles } from "@/styles/global-styles";
import { profileStyles } from '@/styles/profile-styles';
import { router } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Register() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const global_styles = globalStyles(colors);
    const profile_styles = profileStyles(colors);
    const { nombre, setNombre, email, setEmail, password, setPassword, imageUri, pickImage, errorMsg, handleRegister } = useRegister();

    return (
        <SafeAreaView style={global_styles.defaultContainer}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={global_styles.defaultScroll}>
                    <View style={profile_styles.auth_container}>
                        {/* Title and image */}
                        <Image source={require('../../assets/images/Icon__dumbell_fitTracker.png')} style={global_styles.principalLogoImage} />

                        <Text style={global_styles.tittleText}>{t('register_title')}</Text>

                        <Pressable onPress={pickImage}>
                            <Image
                                source={imageUri ? { uri: imageUri } : require('../../assets/images/defaultAvatar.png')}
                                style={global_styles.profileImage}
                            />
                        </Pressable>

                        {errorMsg && <Text style={[global_styles.secondaryText, profile_styles.loadProfileErrorMessage]}>{errorMsg}</Text>}

                        <View style={{ paddingTop: 20 }}>
                            <Text style={[global_styles.principalText, { paddingLeft: 10 }]}>{t('name')}</Text>
                            <TextInput style={global_styles.inputs} value={nombre} onChangeText={setNombre} />

                            <Text style={[global_styles.principalText, { paddingLeft: 10 }]}>{t('email')}</Text>
                            <TextInput style={global_styles.inputs} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

                            <Text style={[global_styles.principalText, { paddingLeft: 10 }]}>{t('password')}</Text>
                            <TextInput style={global_styles.inputs} value={password} onChangeText={setPassword} secureTextEntry />
                        </View>

                        {/* Register button */}
                        <View style={profile_styles.auth_registerButtonContainer}>
                            <Pressable style={global_styles.principalButton} onPress={handleRegister}>
                                <Text style={global_styles.principalText}>
                                    {t('register_button')}
                                </Text>
                            </Pressable>
                        </View>

                        {/* have account */}
                        <Pressable onPress={() => router.push('../../auth/login')}>
                            <Text style={[global_styles.underlineText]}>{t('have_account')}</Text>
                        </Pressable>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
