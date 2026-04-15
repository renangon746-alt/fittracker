import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface UserProfile {
    id_usuario: number;
    nombre: string;
    email: string;
}

export function useStreak(userId: number | null) {
    const [streak, setStreak] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        
        if (!userId) {
            setLoading(false);
            return;
        }

        async function updateStreak() {
            try {
                // Get user data
                const { data: usuario, error } = await supabase
                    .from('usuario')
                    .select('racha_actual, ultima_conexion')
                    .eq('id_usuario', userId)
                    .single();

                if (error || !usuario) {
                    console.error('Error obteniendo racha:', error);
                    setLoading(false);
                    return;
                }

                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0); // Reset to midnight

                let nuevaRacha = usuario.racha_actual || 0;

                const { error: updateError } = await supabase
                    .from('usuario')
                    .update({
                        racha_actual: nuevaRacha,
                        ultima_conexion: hoy.toISOString().split('T')[0] // Format YYYY-MM-DD
                    })
                    .eq('id_usuario', userId);

                if (updateError) {
                    console.error('Error actualizando racha:', updateError);
                } else {
                    setStreak(nuevaRacha);
                }
            } catch (error) {
                console.error('Error en useStreak:', error);
            } finally {
                setLoading(false);
            }
        }

        updateStreak();
    }, [userId]);

    return { streak, loading };
}