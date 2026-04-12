
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { globalStyles } from "@/styles/global-styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";

const defaultAvatar = require('../../assets/images/defaultAvatar.png');

interface UserProfile {
    id_usuario: number;
    nombre: string;
    email: string;
}

export default function EditProfile() {
const {colors} = useTheme();
    const styles = globalStyles(colors);
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');

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

    const { data } = supabase.storage.from('avatars').getPublicUrl(`${userProfile.id_usuario}/avatar.jpg`);


    return(
        <SafeAreaView style={{flex: 1, backgroundColor: colors.backgroundPrimary}}>
            {/* Return Button */}
            <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                <Pressable 
                    onPress={() => router.back()}
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 8, width: 40 }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <View style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
                
                {/* Title */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.tittleText}>Edit Profile</Text>
                </View>

                {/* Avatar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20}}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <Image
                            source={imgError ? defaultAvatar : { uri: data.publicUrl }}
                            onError={() => setImgError(true)}
                            style={styles.profileImage}
                        />
                        <Text style={styles.principalText}>Avatar</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Pressable style={[styles.icon, { width: 40, height: 40, backgroundColor: colors.textPrimary }]}>
                            <Ionicons name="cloud-upload" size={24} color={colors.backgroundPrimary} />
                        </Pressable>

                        <Pressable style={[styles.icon, { width: 40, height: 40, backgroundColor: "red" }]}>
                            <Ionicons name="trash" size={24} color={colors.textPrimary} />
                        </Pressable>
                    </View>
                </View>
                
                {/* Separator */}
                <View style={{height: 1,backgroundColor: colors.textSecondary, width: '90%', marginVertical: 10,}}/>

                {/* Username */}
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 20}}>
                    <Ionicons name="pricetags" size={24} color={colors.textPrimary} style={{paddingRight:10}}/>
                    <Text style={styles.principalText}>Username: </Text>
                </View>

                <TextInput style={styles.inputs} />

                {/* Separator */}
                <View style={{height: 1,backgroundColor: colors.textSecondary, width: '90%', marginVertical: 10,}}/>

                {/* Bio */}
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 20}}>
                    <Ionicons name="copy" size={24} color={colors.textPrimary} style={{paddingRight:10}}/>
                    <Text style={styles.principalText}>Bio: </Text>
                </View>

                <TextInput style={styles.inputs} />

                {/* Separator */}
                <View style={{height: 1,backgroundColor: colors.textSecondary, width: '90%', marginVertical: 10,}}/>

                {/* Links */}
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 20}}>
                    <Ionicons name="link" size={24} color={colors.textPrimary} style={{paddingRight:10}}/>
                    <Text style={styles.principalText}>Links: </Text>
                </View>

                <TextInput style={styles.inputs} />

                {/* Separator */}
                <View style={{height: 1,backgroundColor: colors.textSecondary, width: '90%', marginVertical: 10,}}/>

                {/* Buttons */}
                <Pressable style={[styles.principalButton, { width: '70%', height: 35 }]}>
                    <Text style={styles.principalText}>Save Changes</Text> 
                </Pressable>
                <View style={{padding: 5}}/>
                <Pressable style={[styles.secondaryButton, { width: '70%', height: 35 }]} onPress={router.back}>
                        <Text style={styles.principalText}>Go Back</Text> 
                </Pressable>
            </View>
        </SafeAreaView>
    );
}