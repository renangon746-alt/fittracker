import Cal from "@/components/Cal";
import Graph from "@/components/Graph";
import StreakBadge from "@/components/StreakBadge";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { globalStyles } from "@/styles/global-styles";
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
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

export default function ProfileDescription(){
    const {colors} = useTheme();
    const styles = globalStyles(colors);
    const { id } = useLocalSearchParams<{ id?: string }>();
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        async function loadUserProfile() {
            try {
                const selectedUserId = Number(id);

                if (!id || Number.isNaN(selectedUserId)) {
                    setErrorMsg('ID de usuario no valido.');
                    return;
                }
                
                // Get profile data
                const { data: profile, error } = await supabase
                    .from('usuario')
                    .select('*')
                    .eq('id_usuario', selectedUserId)
                    .single();

                if (error) {
                    console.error('Error loading profile:', error);
                    setErrorMsg('Error cargando perfil: ' + error.message);
                } else if (profile) {
                    setUserProfile(profile);
                    
                    // Find auth user UUID by email
                    if (profile.email) {
                        try {
                            const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
                            
                            if (!authError && authUsers) {
                                const authUser = authUsers.find(u => u.email === profile.email);
                                
                                if (authUser) {
                                    const { data } = supabase.storage
                                        .from('avatars')
                                        .getPublicUrl(`${authUser.id}/avatar.jpg`);
                                    
                                    setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
                                }
                            }
                        } catch (authError) {
                            console.error('Error fetching auth user:', authError);
                        }
                    }
                } else {
                    setErrorMsg('No se encontro ningun perfil para ese usuario.');
                }
            } catch (error) {
                console.error('Error general:', error);
                setErrorMsg('Error inesperado: ' + String(error));
            } finally {
                setLoading(false);
            }
        }

        loadUserProfile();
    }, [id]);

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

            <View style={{alignItems: 'center', paddingHorizontal: 20}}>
                {/* Profile header */}
                <View style={{ flexDirection: 'row' , alignItems: 'center', gap: screenWidth < 350 ? 15 : 30, marginBottom: 10}}>
                    <Image
                        source={imgError || !avatarUrl ? defaultAvatar : { uri: avatarUrl }}
                        onError={() => setImgError(true)}
                        style={styles.profileImage}
                    />
                    <Text style={[styles.tittleText, {fontSize: screenWidth < 350 ? 18 : 24}]} numberOfLines={1}>
                        {userProfile.nombre}
                    </Text>
                    <StreakBadge count={userProfile.racha_actual || 0} />
                </View>

                {/* Separator */}
                <View style={{height: 1,backgroundColor: colors.textSecondary, width: '90%', marginVertical: 10,}}/>

                {/* Profile Stats */}
                <View style={{ flexDirection: 'row' , alignItems: 'center', gap: screenWidth < 350 ? 10 : 20}}>
                    <View style={{flexDirection: 'column', alignItems: 'center', gap: 5, marginTop: 10}}>
                        <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 12 : 14}]}>Trainings</Text>
                        <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 16 : 18}]}>103</Text>
                    </View>

                    <View style={{flexDirection: 'column', alignItems: 'center', gap: 5, marginTop: 10}}>
                        <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 12 : 14}]}>Followers</Text>
                        <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 16 : 18}]}>100</Text>
                    </View>

                    <View style={{flexDirection: 'column', alignItems: 'center', gap: 5, marginTop: 10}}>
                        <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 12 : 14}]}>Following</Text>
                        <Text style={[styles.principalText, {fontSize: screenWidth < 350 ? 16 : 18}]}>2</Text>
                    </View>
                </View>

                {/* Bio and Follow Button */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, width: '100%', marginTop: 20 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.secondaryText, { textAlign: 'center', fontSize: screenWidth < 350 ? 12 : 14 }]}>
                            Fitness enthusiast and nutrition expert. Passionate about helping others achieve their health goals.
                        </Text>
                    </View>

                    <Pressable style={[styles.principalButton, { width: 100, height: 35 }]}>
                        <Text style={styles.principalText}>Follow</Text>
                    </Pressable>
                </View>
            </View>
            
            <View style={{paddingHorizontal: 10, marginTop: 20}}>
                {/* Graph */}
                <Graph/>

                {/* Calendar */}
                <Cal/>
            </View>
            
        </ScrollView>
        </SafeAreaView>
    );
}