import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { globalStyles } from "@/styles/global-styles";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";

const defaultAvatar = require('../../assets/images/defaultAvatar.png');

interface UserProfile {
    id_usuario: number;
    nombre: string;
    email: string;
    foto_perfil?: string;
}

export default function EditProfile() {
    const {colors} = useTheme();
    const styles = globalStyles(colors);
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

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

    async function pickAndUploadImage() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para cambiar el avatar.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (result.canceled || !result.assets[0].base64 || !userProfile) {
            return;
        }

        setUploading(true);

        try {
            // Obtener el UUID de auth
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Error', 'No se pudo obtener el usuario');
                setUploading(false);
                return;
            }

            const base64 = result.assets[0].base64;
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            // Usar UUID de auth en lugar de id_usuario
            const fileName = `${user.id}/avatar.jpg`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, bytes, { 
                    contentType: 'image/jpeg', 
                    upsert: true 
                });

            if (uploadError) {
                console.error('Error subiendo imagen:', uploadError);
                Alert.alert('Error', 'No se pudo subir la imagen: ' + uploadError.message);
                setUploading(false);
                return;
            }

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const { error: dbError } = await supabase
                .from('usuario')
                .update({ foto_perfil: urlData.publicUrl })
                .eq('id_usuario', userProfile.id_usuario);

            if (dbError) {
                console.error('Error actualizando BD:', dbError);
                Alert.alert('Error', 'No se pudo actualizar el perfil');
                setUploading(false);
                return;
            }

            setAvatarUri(result.assets[0].uri);
            setUserProfile({ ...userProfile, foto_perfil: urlData.publicUrl });
            setImgError(false);
            
            Alert.alert('¡Éxito!', 'Avatar actualizado correctamente');

        } catch (error) {
            console.error('Error general:', error);
            Alert.alert('Error', 'Ocurrió un error inesperado');
        } finally {
            setUploading(false);
        }
    }

    async function deleteAvatar() {
        if (!userProfile) return;

        Alert.alert(
            'Eliminar avatar',
            '¿Estás seguro de que quieres eliminar tu avatar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setUploading(true);

                        try {
                            // Obtener UUID de auth
                            const { data: { user } } = await supabase.auth.getUser();
                            if (!user) {
                                Alert.alert('Error', 'No se pudo obtener el usuario');
                                setUploading(false);
                                return;
                            }

                            const fileName = `${user.id}/avatar.jpg`;

                            const { error: deleteError } = await supabase.storage
                                .from('avatars')
                                .remove([fileName]);

                            if (deleteError) {
                                console.error('Error eliminando imagen:', deleteError);
                            }

                            const { error: dbError } = await supabase
                                .from('usuario')
                                .update({ foto_perfil: null })
                                .eq('id_usuario', userProfile.id_usuario);

                            if (dbError) {
                                Alert.alert('Error', 'No se pudo actualizar el perfil');
                                setUploading(false);
                                return;
                            }

                            setAvatarUri(null);
                            setUserProfile({ ...userProfile, foto_perfil: undefined });
                            setImgError(true);
                            
                            Alert.alert('¡Éxito!', 'Avatar eliminado correctamente');

                        } catch (error) {
                            console.error('Error general:', error);
                            Alert.alert('Error', 'Ocurrió un error inesperado');
                        } finally {
                            setUploading(false);
                        }
                    }
                }
            ]
        );
    }

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

    // Usar avatarUri local si existe, sino la URL de la BD
    const avatarSource = avatarUri 
        ? { uri: avatarUri }
        : (imgError || !userProfile.foto_perfil)
            ? defaultAvatar
            : { uri: userProfile.foto_perfil };

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
                            source={avatarSource}
                            onError={() => setImgError(true)}
                            style={styles.profileImage}
                        />
                        <Text style={styles.principalText}>Avatar</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Pressable 
                            style={[styles.icon, { width: 40, height: 40, backgroundColor: colors.textPrimary }]}
                            onPress={pickAndUploadImage}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color={colors.backgroundPrimary} />
                            ) : (
                                <Ionicons name="cloud-upload" size={24} color={colors.backgroundPrimary} />
                            )}
                        </Pressable>

                        <Pressable 
                            style={[styles.icon, { width: 40, height: 40, backgroundColor: "red" }]}
                            onPress={deleteAvatar}
                            disabled={uploading}
                        >
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