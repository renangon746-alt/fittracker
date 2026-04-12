import { useTheme } from '@/context/ThemeContext';
import { useLogin } from '@/hooks/useLogin';
import { useStreak } from '@/hooks/useStreak';
import { supabase } from '@/lib/supabase';
import { globalStyles } from "@/styles/global-styles";
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";

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
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);


    // HookStreak
    const { streak, loading: streakLoading } = useStreak(userProfile?.id_usuario ?? null);

    useEffect(() => {
            async function loadUserProfile() {
                try {
                    const { data: { user }, error: userError } = await supabase.auth.getUser();
                    
                    if (userError || !user) {
                        console.error('Error obteniendo usuario:', userError);
                        router.replace('/auth/login');
                        return;
                    }
    
                    const { data: profiles, error } = await supabase
                        .from('usuario')
                        .select('*')
                        .eq('email', user.email);
    
                    
                } catch (error) {
                    console.error('Error general:', error);
                    
                } finally {
                    setLoading(false);
                }
            }
    
            loadUserProfile();
        }, []);
    
        if (loading || streakLoading) {
            return (
                <SafeAreaView style={{flex: 1, backgroundColor: colors.backgroundPrimary, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color={colors.textPrimary} />
                    <Text style={[styles.secondaryText, {marginTop: 10}]}>Cargando perfil...</Text>
                </SafeAreaView>
            );
        }
    
        if (!userProfile) {
            return (
                <SafeAreaView style={{flex: 1, backgroundColor: colors.backgroundPrimary, justifyContent: 'center', alignItems: 'center', padding: 20}}>
                    <Text style={[styles.principalText, {color: 'red', marginBottom: 10}]}>No se pudo cargar el perfil</Text>
                    <Text style={[styles.secondaryText, {textAlign: 'center'}]}>{errorMsg}</Text>
                    <Pressable 
                        style={[styles.principalButton, {marginTop: 20}]} 
                        onPress={() => router.back()}
                    >
                        <Text style={styles.principalText}>Volver</Text>
                    </Pressable>
                </SafeAreaView>
            );
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
