import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';

export function useRegister() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // Request gallery permissions and let user pick an image
    async function pickImage() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Necesitamos acceso a tu galería.');
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

    // Upload image to Supabase Storage using auth UUID
    async function uploadImage(userId: string): Promise<string | null> {
        if (!imageBase64) return null;

        // Convert base64 to ArrayBuffer
        const binary = atob(imageBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        // Use auth UUID for folder name
        const fileName = `${userId}/avatar.jpg`;

        const { error } = await supabase.storage
            .from('avatars')
            .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: true });

        if (error) {
            setErrorMsg('No se pudo subir la imagen: ' + error.message);
            return null;
        }

        // Get public URL
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        return data.publicUrl;
    }

    // Parse Supabase error messages to user-friendly Spanish
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

    // Register user in Auth and create database record
    async function handleRegister() {
        setErrorMsg(null);

        if (!nombre) { setErrorMsg('El nombre es obligatorio.'); return; }
        if (!email) { setErrorMsg('El email es obligatorio.'); return; }
        if (!password) { setErrorMsg('La contraseña es obligatoria.'); return; }

        try {
            // Create user in Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { nombre }
                }
            });

            if (error) {
                setErrorMsg(parseError(error.message));
                return;
            }

            const userId = data.user?.id;
            
            if (!userId) {
                setErrorMsg('Error al crear el usuario.');
                return;
            }

            console.log('User created in Auth:', userId);

            // Create record in usuario table
            console.log('Attempting to insert into usuario table...');
            const { data: newUser, error: dbError } = await supabase
                .from('usuario')
                .insert({
                    email: email,
                    nombre: nombre,
                })
                .select('id_usuario')
                .single();

            console.log('Insert result:', { newUser, dbError });

            if (dbError) {
                console.error('Error creating user in DB:', dbError);
                setErrorMsg('Error guardando perfil: ' + dbError.message + ' (Code: ' + dbError.code + ')');
                return;
            }

            if (!newUser) {
                console.error('No user returned from insert');
                setErrorMsg('Error: no se pudo crear el perfil en la base de datos');
                return;
            }

            const dbUserId = newUser.id_usuario;
            console.log('User created in table with ID:', dbUserId);

            // Upload image if exists (using auth UUID, not database id_usuario)
            let avatarUrl: string | null = null;
            if (imageBase64) {
                console.log('Uploading avatar...');
                // IMPORTANT: Use auth userId (UUID), not dbUserId (number)
                avatarUrl = await uploadImage(userId);
                
                if (avatarUrl) {
                    console.log('Avatar uploaded:', avatarUrl);
                    
                    // Update foto_perfil in usuario table
                    await supabase
                        .from('usuario')
                        .update({ foto_perfil: avatarUrl })
                        .eq('id_usuario', dbUserId);
                    
                    // Also update auth metadata
                    await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
                }
            }

            console.log('Registration completed successfully');
            router.push('/auth/login');
            
        } catch (error) {
            console.error('Error in handleRegister:', error);
            setErrorMsg('Error inesperado: ' + String(error));
        }
    }

    return { nombre, setNombre, email, setEmail, password, setPassword, imageUri, pickImage, errorMsg, handleRegister };
}