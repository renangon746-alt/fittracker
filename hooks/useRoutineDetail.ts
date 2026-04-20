import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export interface RoutineExercise {
    id_rutina_ejercicio?: number;
    id_ejercicio: number;
    nombre: string;
    image_key: string | null;
    orden: number;
    series: number | null;
    repeticiones: number | null;
    carga_kg: number | null;
    descanso_seg: number | null;
}

export function useRoutineDetail(routineId: number) {
    const { userProfile } = useUser();
    const [exercises, setExercises] = useState<RoutineExercise[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExercises = useCallback(async () => {
        if (!routineId) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('rutina_ejercicio')
            .select(`
                id_rutina_ejercicio: id_rutina_ejercicio,
                id_ejercicio,
                orden,
                series,
                repeticiones,
                carga_kg,
                descanso_seg,
                ejercicio ( nombre, image_key )
            `)
            .eq('id_rutina', routineId)
            .order('orden');

        if (!error && data) {
            setExercises(data.map((row: any) => ({
                id_rutina_ejercicio: row.id_rutina_ejercicio,
                id_ejercicio: row.id_ejercicio,
                nombre: row.ejercicio?.nombre ?? '',
                image_key: row.ejercicio?.image_key ?? null,
                orden: row.orden,
                series: row.series,
                repeticiones: row.repeticiones,
                carga_kg: row.carga_kg,
                descanso_seg: row.descanso_seg,
            })));
        }

        setLoading(false);
    }, [routineId]);

    useEffect(() => { fetchExercises(); }, [fetchExercises]);

    async function addExercise(idEjercicio: number) {
        const nextOrden = exercises.length + 1;
        const { error } = await supabase
            .from('rutina_ejercicio')
            .insert({
                id_rutina: routineId,
                id_ejercicio: idEjercicio,
                orden: nextOrden,
                series: null,
                repeticiones: null,
                carga_kg: null,
                descanso_seg: null,
            });

        if (!error) await fetchExercises();
    }

    async function finishRoutine(durationSeconds: number) {
        if (!userProfile) return;

        const now = new Date().toISOString();

        // Create entrenamiento record
        await supabase.from('entrenamiento').insert({
            id_usuario: userProfile.id_usuario,
            id_rutina: routineId,
            fecha_inicio: new Date(Date.now() - durationSeconds * 1000).toISOString(),
            fecha_fin: now,
            duracion_min: Math.floor(durationSeconds / 60),
        });

        // Update last_trained on the rutina
        await supabase
            .from('rutina')
            .update({ last_trained: now })
            .eq('id_rutina', routineId);

        router.back();
    }

    return { exercises, loading, addExercise, finishRoutine, refresh: fetchExercises };
}
