import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';

export function useLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    function parseError(message: string): string {
        if (message.includes('Invalid login credentials'))
            return 'Email o contraseña incorrectos.';
        if (message.includes('Email not confirmed'))
            return 'Debes confirmar tu email antes de iniciar sesión.';
        if (message.includes('over_email_send_rate_limit'))
            return 'Demasiados intentos. Espera unos minutos.';
        return message;
    }

    async function handleLogin() {
        setErrorMsg(null);

        if (!email) { setErrorMsg('El email es obligatorio.'); return; }
        if (!password) { setErrorMsg('La contraseña es obligatoria.'); return; }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setErrorMsg(parseError(error.message));
        } else {
            router.replace('/(tabs)');
        }
    }

    return { email, setEmail, password, setPassword, errorMsg, handleLogin };
}
