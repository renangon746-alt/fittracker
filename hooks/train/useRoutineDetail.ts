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

export type SetsMap = Record<number, SetRow[]>;

export function useRoutineDetail(routineId: number) {
    const { userProfile } = useUser();
    const [exercises, setExercises] = useState<RoutineExercise[]>([]);
    const [loading, setLoading] = useState(true);

    const isValid = !isNaN(routineId) && routineId > 0;

    const fetchExercises = useCallback(async () => {
        if (!isValid) { setLoading(false); return; }
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
    }, [routineId, isValid]);

    useEffect(() => { fetchExercises(); }, [fetchExercises]);

    // exerciseData is optional — used for empty training to provide nombre/image_key locally
    async function addExercise(
        idEjercicio: number,
        exerciseData?: { nombre: string; image_key: string | null }
    ) {
        if (!isValid) {
            // Empty training: add locally without DB
            const newEx: RoutineExercise = {
                id_rutina_ejercicio: Date.now(),
                id_ejercicio: idEjercicio,
                nombre: exerciseData?.nombre ?? '',
                image_key: exerciseData?.image_key ?? null,
                orden: exercises.length + 1,
                series: null, repeticiones: null, carga_kg: null, descanso_seg: null,
            };
            setExercises(prev => [...prev, newEx]);
            return;
        }

        const nextOrden = exercises.length + 1;
        const { error } = await supabase
            .from('rutina_ejercicio')
            .insert({
                id_rutina: routineId,
                id_ejercicio: idEjercicio,
                orden: nextOrden,
                series: null, repeticiones: null, carga_kg: null, descanso_seg: null,
            });
        if (error) { console.error('Error adding exercise:', error.message); return; }
        await fetchExercises();
    }

    async function removeExercise(idRutinaEjercicio: number) {
        if (!isValid) {
            setExercises(prev => prev.filter(e => e.id_rutina_ejercicio !== idRutinaEjercicio));
            return;
        }
        const { error } = await supabase
            .from('rutina_ejercicio').delete().eq('id_rutina_ejercicio', idRutinaEjercicio);
        if (error) { console.error('Error removing exercise:', error.message); return; }
        const remaining = exercises
            .filter(e => e.id_rutina_ejercicio !== idRutinaEjercicio)
            .map((e, idx) => ({ ...e, orden: idx + 1 }));
        await Promise.all(remaining.map(e =>
            supabase.from('rutina_ejercicio').update({ orden: e.orden }).eq('id_rutina_ejercicio', e.id_rutina_ejercicio)
        ));
        await fetchExercises();
    }

    async function replaceExercise(idRutinaEjercicio: number, newIdEjercicio: number) {
        if (!isValid) {
            setExercises(prev => prev.map(e =>
                e.id_rutina_ejercicio === idRutinaEjercicio ? { ...e, id_ejercicio: newIdEjercicio } : e
            ));
            return;
        }
        const { error } = await supabase
            .from('rutina_ejercicio').update({ id_ejercicio: newIdEjercicio }).eq('id_rutina_ejercicio', idRutinaEjercicio);
        if (error) { console.error('Error replacing exercise:', error.message); return; }
        await fetchExercises();
    }

    async function reorderExercises(ordered: RoutineExercise[]) {
        if (!isValid) { setExercises(ordered); return; }
        await Promise.all(ordered.map((e, idx) =>
            supabase.from('rutina_ejercicio').update({ orden: idx + 1 }).eq('id_rutina_ejercicio', e.id_rutina_ejercicio)
        ));
        await fetchExercises();
    }

    async function updateRestTime(idRutinaEjercicio: number, seconds: number) {
        if (!isValid) {
            setExercises(prev => prev.map(e =>
                e.id_rutina_ejercicio === idRutinaEjercicio ? { ...e, descanso_seg: seconds } : e
            ));
            return;
        }
        await supabase.from('rutina_ejercicio').update({ descanso_seg: seconds }).eq('id_rutina_ejercicio', idRutinaEjercicio);
        setExercises(prev => prev.map(e =>
            e.id_rutina_ejercicio === idRutinaEjercicio ? { ...e, descanso_seg: seconds } : e
        ));
    }

    async function deleteRoutine() {
        if (!isValid) return;
        await supabase.from('rutina_ejercicio').delete().eq('id_rutina', routineId);
        await supabase.from('rutina').delete().eq('id_rutina', routineId);
    }

    async function updateRoutineData(nombre: string, carpeta: string) {
        if (!isValid) return;
        await supabase.from('rutina').update({ nombre, carpeta }).eq('id_rutina', routineId);
    }

    async function finishRoutine(durationSeconds: number, setsMap: SetsMap) {
        if (!userProfile || !isValid) return;

        const now = new Date().toISOString();
        const startTime = new Date(Date.now() - durationSeconds * 1000).toISOString();

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
        const seriesToInsert: any[] = [];

        for (const exercise of exercises) {
            const sets = setsMap[exercise.id_rutina_ejercicio] ?? [];
            sets.filter(s => s.done).forEach((set, idx) => {
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
            const { error: seriesError } = await supabase.from('serie').insert(seriesToInsert);
            if (seriesError) console.error('Error saving series:', seriesError.message);
        }

        await supabase.from('rutina').update({ last_trained: now }).eq('id_rutina', routineId);
    }

    return {
        exercises, loading, addExercise, removeExercise, replaceExercise,
        reorderExercises, updateRestTime, deleteRoutine, updateRoutineData,
        finishRoutine, refresh: fetchExercises,
    };
}