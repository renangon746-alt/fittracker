import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/context/LanguageContext';
import { useState } from 'react';

export function useForgotPassword() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    async function handleForgotPassword() {
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!email) {
            setErrorMsg(t('enter_email'));
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            setErrorMsg(t('forgot_error'));
            return;
        }

        setSuccessMsg(t('forgot_email_sent'));
    }

    return { email, setEmail, errorMsg, successMsg, handleForgotPassword };
}
