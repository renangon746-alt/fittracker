import { useUser } from '@/context/UserContext';
import { useTranslation } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';

export function useLogin() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { refreshUser } = useUser();

    function parseError(message: string): string {
        if (message.includes('Invalid login credentials'))
            return t('email_or_password_incorrect');
        if (message.includes('Email not confirmed'))
            return t('confirm_email_before_login');
        if (message.includes('over_email_send_rate_limit'))
            return t('too_many_attempts_wait');
        return message;
    }

    async function updateStreak(userId: number) {
        try {
            const { data: usuario, error } = await supabase
                .from('usuario')
                .select('racha_actual, ultima_conexion, completedStreak')
                .eq('id_usuario', userId)
                .single();

            if (error || !usuario) {
                console.error('Error getting streak:', error);
                return;
            }

            const today = new Date();
            let newStreak = usuario.racha_actual || 0;

            if (usuario.ultima_conexion) {
                const lastConnection = new Date(usuario.ultima_conexion);
                const diffDays = Math.floor((today.getDate() - lastConnection.getDate()));

                if (diffDays === 0) {
                    newStreak = usuario.racha_actual;
                } else if (diffDays === 1) {
                    newStreak = usuario.racha_actual + 1;
                } else {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            await supabase
                .from('usuario')
                .update({
                    racha_actual: newStreak,
                    ultima_conexion: today.toISOString().split('T')[0]
                })
                .eq('id_usuario', userId);

        } catch (error) {
            console.error('Error in updateStreak:', error);
        }
    }

    async function handleLogin() {
        setErrorMsg(null);

        if (!email) { setErrorMsg(t('email_required')); return; }
        if (!password) { setErrorMsg(t('password_required')); return; }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setErrorMsg(parseError(error.message));
        } else {
            const { data: profiles } = await supabase
                .from('usuario')
                .select('id_usuario')
                .eq('email', email);

            if (profiles && profiles.length > 0) {
                await updateStreak(profiles[0].id_usuario);
            }

            // Load user data into global context before navigating
            await refreshUser();
            router.replace('/(tabs)');
        }
    }

    return { email, setEmail, password, setPassword, errorMsg, handleLogin };
}
