import { useTranslation } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { useState } from 'react';

export function useForgotPassword() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    function getRedirectUrl() {
        return Linking.createURL('/auth/resetPassword');
    }

    async function handleForgotPassword() {
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!email) {
            setErrorMsg(t('enter_email'));
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: getRedirectUrl(),
        });

        if (error) {
            setErrorMsg(error.message);
            return;
        }

        setSuccessMsg(t('forgot_email_sent'));
    }

    return {
        email,
        setEmail,
        errorMsg,
        successMsg,
        handleForgotPassword,
    };
}