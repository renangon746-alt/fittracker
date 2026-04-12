import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useStreak(userId: number | null) {
    const [streak, setStreak] = useState<number>(0);
    const [loading, setLoading] = useState(true);

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
                    .select('racha_actual, ultima_conexion, completedstreak')
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

                if (usuario.ultima_conexion) {
                    const ultimaConexion = new Date(usuario.ultima_conexion);
                    ultimaConexion.setHours(0, 0, 0, 0);
                    const completedToday= new Boolean(usuario.completedstreak);
                    const diffDias = Math.floor((hoy.getTime() - ultimaConexion.getTime()) / (1000 * 60 * 60 * 24));

                    if (!completedToday){
                        if (diffDias === 0) {
                            // Same day - do anything
                            nuevaRacha = usuario.racha_actual;
                        } else if (diffDias === 1) {
                            // Consecutive day - increment streak
                            nuevaRacha = usuario.racha_actual + 1;
                            
                        }else {
                            // More than one day without connecting - reset streak
                            nuevaRacha = 1;
                        }
                    }
                } else {
                    // First time connecting - start streak
                    nuevaRacha = 1;
                }

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