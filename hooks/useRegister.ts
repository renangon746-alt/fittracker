import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/context/LanguageContext';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';

export function useRegister() {
    const { t } = useTranslation();
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    async function pickImage() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg(t('gallery_permission'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 ?? null);
        }
    }

    async function uploadImage(authUserId: string): Promise<string | null> {
        if (!imageBase64) return null;

        const binary = atob(imageBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const fileName = `${authUserId}/avatar.jpg`;

        const { error } = await supabase.storage
            .from('avatars')
            .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: true });

        if (error) {
            setErrorMsg(`${t('image_upload_failed')}: ${error.message}`);
            return null;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        return data.publicUrl;
    }

    function parseError(message: string): string {
        if (message.includes('User already registered'))
            return t('account_exists_email');
        if (message.includes('invalid') && message.includes('email'))
            return t('invalid_email_format');
        if (message.includes('Password should be at least'))
            return t('password_min_6');
        if (message.includes('over_email_send_rate_limit'))
            return t('too_many_attempts_wait');
        return message;
    }

    async function handleRegister() {
        setErrorMsg(null);

        if (!nombre) { setErrorMsg(t('name_required')); return; }
        if (!email) { setErrorMsg(t('email_required')); return; }
        if (!password) { setErrorMsg(t('password_required')); return; }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { nombre } }
            });

            if (error) {
                setErrorMsg(parseError(error.message));
                return;
            }

            const authUserId = data.user?.id;

            if (!authUserId) {
                setErrorMsg(t('user_create_error'));
                return;
            }

            // Save auth_uuid alongside the profile so we can build avatar URLs
            // from the client without needing admin permissions
            const { data: newUser, error: dbError } = await supabase
                .from('usuario')
                .insert({
                    email,
                    contrasena: password,
                    nombre,
                    auth_uuid: authUserId,
                })
                .select('id_usuario')
                .single();

            if (dbError) {
                setErrorMsg(`${t('profile_save_error')}: ${dbError.message} (Code: ${dbError.code})`);
                return;
            }

            if (!newUser) {
                setErrorMsg(t('profile_create_db_error'));
                return;
            }

            // Upload avatar using the auth UUID as folder name
            let avatarUrl: string | null = null;
            if (imageBase64) {
                avatarUrl = await uploadImage(authUserId);

                if (avatarUrl) {
                    await supabase
                        .from('usuario')
                        .update({ foto_perfil: avatarUrl })
                        .eq('id_usuario', newUser.id_usuario);

                    await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
                }
            }

            router.push('/auth/login');

        } catch (error) {
            setErrorMsg(`${t('unexpected_error')}: ${String(error)}`);
        }
    }

    return { nombre, setNombre, email, setEmail, password, setPassword, imageUri, pickImage, errorMsg, handleRegister };
}
