import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface RoutineExercise {
    id_rutina_ejercicio: number;
    id_ejercicio: number;
    nombre: string;
    image_key: string | null;
    orden: number;
    series: number | null;
    repeticiones: number | null;
    carga_kg: number | null;
    descanso_seg: number | null;
}

export interface SetRow {
    num: number;
    kg: string;
    reps: string;
    done: boolean;
}

export type SetsMap = Record<number, SetRow[]>; // keyed by id_rutina_ejercicio

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
                id_rutina_ejercicio,
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
        } else if (error) {
            console.error('Error fetching routine exercises:', error.message);
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

        if (error) { console.error('Error adding exercise:', error.message); return; }
        await fetchExercises();
    }

    // Update descanso_seg for a specific rutina_ejercicio row
    async function updateRestTime(idRutinaEjercicio: number, seconds: number) {
        await supabase
            .from('rutina_ejercicio')
            .update({ descanso_seg: seconds })
            .eq('id_rutina_ejercicio', idRutinaEjercicio);

        setExercises(prev => prev.map(e =>
            e.id_rutina_ejercicio === idRutinaEjercicio
                ? { ...e, descanso_seg: seconds }
                : e
        ));
    }

    async function finishRoutine(
        durationSeconds: number,
        setsMap: SetsMap,
    ) {
        if (!userProfile) return;

        const now = new Date().toISOString();
        const startTime = new Date(Date.now() - durationSeconds * 1000).toISOString();

        // 1. Create entrenamiento record
        const { data: entrenamientoData, error: entrenamientoError } = await supabase
            .from('entrenamiento')
            .insert({
                id_usuario: userProfile.id_usuario,
                id_rutina: routineId,
                fecha_inicio: startTime,
                fecha_fin: now,
                duracion_min: Math.floor(durationSeconds / 60),
            })
            .select('id_entrenamiento')
            .single();

        if (entrenamientoError || !entrenamientoData) {
            console.error('Error creating entrenamiento:', entrenamientoError?.message);
            return;
        }

        const idEntrenamiento = entrenamientoData.id_entrenamiento;

        // 2. Save completed sets to serie table
        const seriesToInsert: any[] = [];
        for (const exercise of exercises) {
            const sets = setsMap[exercise.id_rutina_ejercicio] ?? [];
            const doneSets = sets.filter(s => s.done);
            doneSets.forEach((set, idx) => {
                seriesToInsert.push({
                    id_entrenamiento: idEntrenamiento,
                    id_ejercicio: exercise.id_ejercicio,
                    num_serie: idx + 1,
                    repeticiones: parseInt(set.reps) || 0,
                    peso_kg: parseFloat(set.kg) || 0,
                    descanso_seg: exercise.descanso_seg ?? null,
                });
            });
        }

        if (seriesToInsert.length > 0) {
            const { error: seriesError } = await supabase
                .from('serie')
                .insert(seriesToInsert);
            if (seriesError) console.error('Error saving series:', seriesError.message);
        }

        // 3. Update last_trained on rutina
        await supabase
            .from('rutina')
            .update({ last_trained: now })
            .eq('id_rutina', routineId);
    }

    return { exercises, loading, addExercise, updateRestTime, finishRoutine, refresh: fetchExercises };
}
