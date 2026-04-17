import Cal from "@/components/Cal";
import Graph from "@/components/Graph";
import StreakBadge from "@/components/StreakBadge";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { globalStyles } from "@/styles/global-styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

const defaultAvatar = require('../../assets/images/defaultAvatar.png');
const screenWidth = Dimensions.get('window').width;

interface UserProfile {
    id_usuario: number;
    nombre: string;
    email: string;
    racha_actual?: number;
}

export default function OwnProfile(){
    const {colors} = useTheme();
    const styles = globalStyles(colors);
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [authUserId, setAuthUserId] = useState<string>('');

    useEffect(() => {
        async function loadUserProfile() {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                if (userError || !user) {
                    console.error('Error getting user:', userError);
                    router.replace('/auth/login');
                    return;
                }

                setAuthUserId(user.id);

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
                console.error('General error:', error);
                setErrorMsg('Error inesperado: ' + String(error));
            } finally {
                setLoading(false);
            }
        }

        loadUserProfile();
    }, []);

    if (loading) {
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

    const { data } = supabase.storage.from('avatars').getPublicUrl(`${authUserId}/avatar.jpg`);
    const avatarUrl = `${data.publicUrl}?t=${new Date().getTime()}`;

    return(
        <SafeAreaView style={{flex: 1, backgroundColor: colors.backgroundPrimary}}>
            <ScrollView contentContainerStyle={{paddingBottom: 20}}>
                {/* Back button */}
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

                {/* Profile header */}
                <View style={{alignItems: 'center', paddingHorizontal: 20, marginTop: 10}}>
                    {/* Avatar and username row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: screenWidth < 350 ? 15 : 30, marginBottom: 10}}>
                        <Image
                            source={imgError ? defaultAvatar : { uri: avatarUrl }}
                            onError={() => setImgError(true)}
                            style={styles.profileImage}
                        />
                        <Text style={[styles.tittleText, {fontSize: screenWidth < 350 ? 18 : 24}]} numberOfLines={1}>
                            {userProfile.nombre}
                        </Text>
                        <StreakBadge count={userProfile.racha_actual || 0} />
                    </View>

                    {/* Profile statistics */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: screenWidth < 350 ? 10 : 20, marginTop: 15}}>
                        <View style={{flexDirection: 'column', alignItems: 'center', gap: 5}}>
                            <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 12 : 14}]}>Trainings</Text>
                            <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 16 : 18}]}>103</Text>
                        </View>

                        <View style={{flexDirection: 'column', alignItems: 'center', gap: 5}}>
                            <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 12 : 14}]}>Followers</Text>
                            <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 16 : 18}]}>100</Text>
                        </View>

                        <View style={{flexDirection: 'column', alignItems: 'center', gap: 5}}>
                            <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 12 : 14}]}>Following</Text>
                            <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 16 : 18}]}>2</Text>
                        </View>
                    </View>

                    {/* User bio */}
                    <View style={{ marginTop: 20, width: '100%'}}>
                        <Text style={[styles.secondaryText, { textAlign: 'center', fontSize: screenWidth < 350 ? 12 : 14 }]}>
                            Fitness enthusiast and nutrition expert. Passionate about helping others achieve their health goals.
                        </Text>
                    </View>
                </View>
                
                {/* Charts section */}
                <View style={{paddingHorizontal: 10, marginTop: 20}}>
                    <Graph/>
                    <Cal/>
                </View>
                
            </ScrollView>
        </SafeAreaView>
    );
}