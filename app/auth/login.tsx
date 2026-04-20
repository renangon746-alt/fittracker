import { useTheme } from '@/context/ThemeContext';
import { useLogin } from '@/hooks/auth/useLogin';
import { globalStyles } from "@/styles/global-styles";
import { profileStyles } from '@/styles/profile-styles';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Login(){
    const {colors} = useTheme();
    const global_styles = globalStyles(colors);
    const profile_styles = profileStyles(colors);
    const { email, setEmail, password, setPassword, errorMsg, handleLogin } = useLogin();


    return (
        <SafeAreaView style={global_styles.defaultContainer}>
            <ScrollView contentContainerStyle={global_styles.defaultScroll}>
                <View style={profile_styles.auth_container}>

                    <Image source={require('../../assets/images/Icon__dumbell_fitTracker.png')} style={global_styles.principalLogoImage}/>

                    <Text style={global_styles.tittleText}>Login</Text>

                    <View style={profile_styles.auth_inputContainer}>
                        <Text style={[global_styles.principalText, profile_styles.auth_inputLabel]}>E-mail</Text>
                        <TextInput style={global_styles.inputs} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

                        <View style={profile_styles.l_passwordContainer}>
                            <Text style={[global_styles.principalText, profile_styles.auth_inputLabel]}>Password</Text>
                            <TextInput style={global_styles.inputs} value={password} onChangeText={setPassword} secureTextEntry />
                            <Pressable onPress={() => router.push('../../auth/forgotPassword')}>
                                <Text style={[global_styles.underlineText, profile_styles.auth_inputLabel]}>Forgot password</Text>
                            </Pressable>
                        </View>

                    </View>

                    {errorMsg && <Text style={[global_styles.secondaryText, profile_styles.loadProfileErrorMessage]}>{errorMsg}</Text>}

                    <View style={profile_styles.buttonContainer}>
                        <Pressable style={global_styles.principalButton} onPress={handleLogin}>
                            <Text style={global_styles.principalText}>
                                Login
                            </Text>
                        </Pressable>
                    </View>

                    <Pressable onPress={() => router.push('../../auth/register')}>
                        <Text style={[global_styles.underlineText]}>I don't have account</Text>
                    </Pressable>
                </View>
                </ScrollView>
        </SafeAreaView>
    );
}
