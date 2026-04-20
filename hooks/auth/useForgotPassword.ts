import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export function useForgotPassword() {
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    async function handleForgotPassword() {
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!email) {
            setErrorMsg('Introduce tu email.');
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            setErrorMsg('No se pudo enviar el email. Comprueba que la dirección es correcta.');
            return;
        }

        setSuccessMsg('Email enviado. Revisa tu bandeja de entrada.');
    }

    return { email, setEmail, errorMsg, successMsg, handleForgotPassword };
}
