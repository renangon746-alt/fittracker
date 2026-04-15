import { useTheme } from '@/context/ThemeContext';
import { useLogin } from '@/hooks/useLogin';
import { useStreak } from '@/hooks/useStreak';
import { globalStyles } from "@/styles/global-styles";
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from "react-native";

interface UserProfile {
    id_usuario: number;
    nombre: string;
    email: string;
}

export default function Login(){
    const {colors} = useTheme();
    const styles = globalStyles(colors);
    const { email, setEmail, password, setPassword, errorMsg, handleLogin } = useLogin();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);


    //Streak
    const { streak, loading: streakLoading } = useStreak(userProfile?.id_usuario ?? null);

    if (streakLoading){
        console.log("Hi from StreakLoading method")
    }

    return (
        <View style={{flex: 1, backgroundColor: colors.backgroundPrimary, flexDirection: 'column',
            alignItems: 'center', paddingTop: 100}}>

            <Image source={require('../../assets/images/Icon__dumbell_fitTracker.png')} style={styles.principalLogoImage}/>

            <Text style={styles.tittleText}>Iniciar Sesion</Text>

            <View style={{paddingTop: 20}}>
                <Text style={[styles.principalText, {paddingLeft:10}]}>E-mail</Text>
                <TextInput style={styles.inputs} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

                <View style={{ paddingTop: 20}}>
                    <Text style={[styles.principalText, {paddingLeft:10}]}>Contrasena</Text>
                    <TextInput style={styles.inputs} value={password} onChangeText={setPassword} secureTextEntry />
                    <Pressable onPress={() => router.push('/auth/forgotPassword')}>
                        <Text style={[styles.underlineText, {paddingLeft:10}]}>Olvide mi contrasena</Text>
                    </Pressable>
                </View>

            </View>

            {errorMsg && <Text style={[styles.secondaryText, { color: 'red', paddingTop: 10 }]}>{errorMsg}</Text>}

            <View style={{padding:10}}>
                <Pressable style={styles.principalButton} onPress={handleLogin}>
                    <Text style={styles.principalText}>
                        Iniciar Sesion
                    </Text>
                </Pressable>
            </View>

            <Pressable onPress={() => router.push('/auth/register')}>
                <Text style={[styles.underlineText]}>No tengo cuenta</Text>
            </Pressable>
        </View>
    );
}
