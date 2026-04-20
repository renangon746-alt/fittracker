import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useEditProfile() {
    const router = useRouter();
    const { userProfile, avatarUrl: contextAvatarUrl, authUserId, refreshUser } = useUser();

    const [saving, setSaving] = useState(false);
    const [nombre, setNombre] = useState('');
    const [bio, setBio] = useState('');
    const [enlace, setEnlace] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
    const [localImageUri, setLocalImageUri] = useState<string | null>(null);

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
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería para cambiar la foto.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setLocalImageUri(result.assets[0].uri);
        }
    }

    async function handleSave() {
        if (!userProfile || !authUserId) return;
        setSaving(true);

        try {
            let fotoUrl = fotoPerfil;

            // Upload new avatar if the user picked one
            if (localImageUri) {
                const fileName = `${authUserId}/avatar.jpg`;
                const response = await fetch(localImageUri);
                const blob = await response.blob();

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });

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

            Alert.alert('¡Listo!', 'Perfil actualizado correctamente.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'No se pudieron guardar los cambios.');
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
