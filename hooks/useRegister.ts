import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';

export function useRegister() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    // URI local de la imagen seleccionada (null si no se ha elegido ninguna)
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // Solicita permiso a la galería y deja al usuario elegir una foto
    async function pickImage() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Necesitamos acceso a tu galería.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,  // permite recortar
            aspect: [1, 1],       // recorte cuadrado para foto de perfil
            quality: 0.5,         // comprime al 50% para reducir tamaño
            base64: true,         // necesario para subir a Supabase en React Native
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 ?? null);
        }
    }

    // Sube la imagen al bucket 'avatars' de Supabase Storage y devuelve la URL pública
    async function uploadImage(userId: string): Promise<string | null> {
        if (!imageBase64) return null;

        // Convierte base64 a ArrayBuffer para subirlo a Supabase
        const binary = atob(imageBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const fileName = `${userId}/avatar.jpg`; // cada usuario tiene su propia carpeta

        const { error } = await supabase.storage
            .from('avatars')
            .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: true }); // upsert sobreescribe si ya existe

        if (error) {
            setErrorMsg('No se pudo subir la imagen: ' + error.message);
            return null;
        }

        // Obtiene la URL pública para guardarla en los metadatos del usuario
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        return data.publicUrl;
    }

    // Traduce los códigos de error de Supabase a mensajes legibles
    function parseError(message: string): string {
        if (message.includes('User already registered'))
            return 'Ya existe una cuenta con este email.';
        if (message.includes('invalid') && message.includes('email'))
            return 'El formato del email no es válido.';
        if (message.includes('Password should be at least'))
            return 'La contraseña debe tener al menos 6 caracteres.';
        if (message.includes('over_email_send_rate_limit'))
            return 'Demasiados intentos. Espera unos minutos.';
        return message;
    }

    // Registra al usuario en Supabase Auth y sube su foto de perfil si eligió una
    async function handleRegister() {
        setErrorMsg(null);

        if (!nombre) { setErrorMsg('El nombre es obligatorio.'); return; }
        if (!email) { setErrorMsg('El email es obligatorio.'); return; }
        if (!password) { setErrorMsg('La contraseña es obligatoria.'); return; }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { nombre } // guarda el nombre en los metadatos del usuario
            }
        });

        if (error) {
            setErrorMsg(parseError(error.message));
            return;
        }

        const userId = data.user?.id;
        if (userId && imageBase64) {
            // Sube la imagen y actualiza los metadatos con la URL resultante
            const avatarUrl = await uploadImage(userId);
            if (avatarUrl) {
                await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
            }
        }

        router.push('/auth/login');
    }

    return { nombre, setNombre, email, setEmail, password, setPassword, imageUri, pickImage, errorMsg, handleRegister };
}
