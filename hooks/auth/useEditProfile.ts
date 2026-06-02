import { useUser } from '@/context/UserContext';
import { useTranslation } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useEditProfile() {
    const router = useRouter();
    const { t } = useTranslation();
    const { userProfile, avatarUrl: contextAvatarUrl, authUserId, refreshUser } = useUser();

    const [saving, setSaving] = useState(false);
    const [nombre, setNombre] = useState('');
    const [bio, setBio] = useState('');
    const [enlace, setEnlace] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
    const [localImageUri, setLocalImageUri] = useState<string | null>(null);
    const [localImageBase64, setLocalImageBase64] = useState<string | null>(null);

    // Populate fields from the global context — no extra query needed
    useEffect(() => {
        if (userProfile) {
            setNombre(userProfile.nombre ?? '');
            setBio(userProfile.bio ?? '');
            setEnlace(userProfile.enlace ?? '');
        }
        if (contextAvatarUrl) {
            setFotoPerfil(contextAvatarUrl);
        }
    }, [userProfile, contextAvatarUrl]);

    async function handlePickImage() {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert(t('permission_needed'), t('gallery_permission'));
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setLocalImageUri(result.assets[0].uri);
                setLocalImageBase64(result.assets[0].base64 ?? null);
            }
        } catch (err) {
            console.error('Image picker error:', err);
            Alert.alert(t('error'), t('could_not_select_photo'));
        }
    }

    async function handleSave() {
        if (!userProfile || !authUserId) return;
        setSaving(true);

        try {
            let fotoUrl = fotoPerfil;

            // Upload new avatar if the user picked one
            if (localImageBase64) {
                const fileName = `${authUserId}/avatar.jpg`;
                const binary = atob(localImageBase64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, bytes, { upsert: true, contentType: 'image/jpeg' });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                fotoUrl = `${urlData.publicUrl}?t=${Date.now()}`;
            }

            // Persist all fields to the database
            const { error } = await supabase
                .from('usuario')
                .update({ nombre, bio, enlace, foto_perfil: fotoUrl })
                .eq('id_usuario', userProfile.id_usuario);

            if (error) throw error;

            // Refresh the global context so OwnProfile reflects changes immediately
            await refreshUser();

            Alert.alert(t('done_title'), t('profile_updated_success'), [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert(t('error'), t('could_not_save_changes'));
        } finally {
            setSaving(false);
        }
    }

    const displayImage = localImageUri || fotoPerfil;

    return {
        saving,
        nombre, setNombre,
        bio, setBio,
        enlace, setEnlace,
        displayImage,
        handlePickImage,
        handleSave,
    };
}
