import Cal from "@/components/Cal";
import Graph from "@/components/Graph";
import StreakBadge from "@/components/StreakBadge";
import { useTheme } from "@/context/ThemeContext";
import { useStreak } from "@/hooks/useStreak";
import { supabase } from "@/lib/supabase";
import { globalStyles } from "@/styles/global-styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

const defaultAvatar = require('../../assets/images/defaultAvatar.png');

interface UserProfile {
    id_usuario: number;
    nombre: string;
    email: string;
}

export default function OwnProfile(){
    const {colors} = useTheme();
    const styles = globalStyles(colors);
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');

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

                if (error) {
                    console.error('Error loading profile:', error);
                    setErrorMsg('Error cargando perfil: ' + error.message);
                } else if (profiles && profiles.length > 0) {
                    setUserProfile(profiles[0]);
                } else {
                    setErrorMsg('No se encontró ningún perfil con el email: ' + user.email);
                }
            } catch (error) {
                console.error('Error general:', error);
                setErrorMsg('Error inesperado: ' + String(error));
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

    const { data } = supabase.storage.from('avatars').getPublicUrl(`${userProfile.id_usuario}/avatar.jpg`);

    return(
        <SafeAreaView style={{flex: 1, backgroundColor: colors.backgroundPrimary}}>
        <ScrollView>
            <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                <Pressable 
                    onPress={() => router.back()}
                    style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        padding: 8,
                        width: 40
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                {/* Profile and Image */}
                <View style={{ flexDirection: 'row' , alignItems: 'center',gap: 45,  justifyContent: 'space-between'}}>
                    <Image
                        source={imgError ? defaultAvatar : { uri: data.publicUrl }}
                        onError={() => setImgError(true)}
                        style={styles.profileImage}
                    />
                    <Text style={styles.tittleText}>{userProfile.nombre}</Text>
                    <StreakBadge count={streak} />
                </View>
                {/* Separator */}
                <View style={{height: 1,backgroundColor: colors.textSecondary, width: '90%', marginVertical: 10,}}/>

                {/* Profile Stats */}
                <View style={{ flexDirection: 'row' , alignItems: 'center', gap: 15}}>
                    <View style={{flexDirection: 'column', alignItems: 'center', gap: 5, marginTop: 10}}>
                        <Text style={styles.principalText}>Trainings</Text>
                        <Text style={styles.principalText}>103</Text>
                    </View>

                    <View style={{flexDirection: 'column', alignItems: 'center', gap: 5, marginTop: 10}}>
                        <Text style={styles.principalText}>Followers</Text>
                        <Text style={styles.principalText}>100</Text>
                    </View>

                    <View style={{flexDirection: 'column', alignItems: 'center', gap: 5, marginTop: 10}}>
                        <Text style={styles.principalText}>Following</Text>
                        <Text style={styles.principalText}>2</Text>
                    </View>
                </View>

                {/* Short Bio */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, paddingHorizontal: 20, marginTop: 20 }}>
                    <Text style={[styles.secondaryText, { textAlign: 'left' }]}>
                        Fitness enthusiast and nutrition expert. Passionate about helping others achieve their health goals.
                    </Text>

                    <Pressable style={[styles.tertiaryButton, { width: 100, height: 35 }]} onPress={() => router.push("/settings/editProfile")}>
                        <Text style={{color: colors.backgroundPrimary}}>Edit</Text>
                    </Pressable>
                </View>
                
                <View style={{padding:5}}>
                    <Graph/>
                    <Cal/>
                </View>
                
            </View>
        </ScrollView>
        </SafeAreaView>
    );
}