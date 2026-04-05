import Cal from "@/components/Cal";
import Graph from "@/components/Graph";
import StreakBadge from "@/components/StreakBadge";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { globalStyles } from "@/styles/global-styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, SafeAreaView, Text, View } from "react-native";

const defaultAvatar = require('../assets/images/defaultAvatar.png');

interface UserProfile {
    id: string;
    user_name: string;
    full_name: string;
    favorite_muscle?: string;
    bio?: string;
}

export default function OwnProfile(){
    const {colors} = useTheme();
    const styles = globalStyles(colors);
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        async function loadUserProfile() {
            try {
                // Obtener el usuario actual
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    router.replace('/auth/login');
                    return;
                }

                // Obtener los datos del perfil desde la tabla profiles
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error loading profile:', error);
                } else {
                    setUserProfile(profile);
                }
            } catch (error) {
                console.error('Error:', error);
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
            </SafeAreaView>
        );
    }

    if (!userProfile) {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.backgroundPrimary, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={styles.principalText}>No se pudo cargar el perfil</Text>
            </SafeAreaView>
        );
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(`${userProfile.id}/avatar.jpg`);

    return(
        <SafeAreaView style={{flex: 1, backgroundColor: colors.backgroundPrimary}}>
            {/* Botón de volver atrás */}
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
                    <Text style={styles.tittleText}>{userProfile.user_name}</Text>
                    <StreakBadge count={15}/>
                </View>

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
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.secondaryText, { textAlign: 'left' }]}>
                            {userProfile.bio || 'Fitness enthusiast and nutrition expert. Passionate about helping others achieve their health goals.'}
                        </Text>
                    </View>
                </View>
                
                <View style={{padding:5}}>
                    {/* Graph */}
                    <Graph/>

                    {/* Calendar */}
                    <Cal/>
                </View>
                
            </View>
        </SafeAreaView>
    );
}