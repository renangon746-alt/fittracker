import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { useEffect, useState } from 'react';

// Maps id_ejercicio -> best record string like "10kg x 15"
export type RecordsMap = Record<number, { kg: number; reps: number } | null>;

export function useRecords(exerciseIds: number[]) {
    const { userProfile } = useUser();
    const [records, setRecords] = useState<RecordsMap>({});

    useEffect(() => {
        if (!userProfile || exerciseIds.length === 0) return;

        async function fetchRecords() {
            // Get all series for this user's exercises, joined through entrenamiento
            const { data, error } = await supabase
                .from('serie')
                .select(`
                    id_ejercicio,
                    peso_kg,
                    repeticiones,
                    entrenamiento!inner ( id_usuario )
                `)
                .eq('entrenamiento.id_usuario', userProfile!.id_usuario)
                .in('id_ejercicio', exerciseIds)
                .not('peso_kg', 'is', null)
                .not('repeticiones', 'is', null);

            if (error || !data) return;

            // Find best kg × reps per exercise
            const best: RecordsMap = {};
            for (const row of data as any[]) {
                const id = row.id_ejercicio;
                const score = row.peso_kg * row.repeticiones;
                if (!best[id] || score > best[id]!.kg * best[id]!.reps) {
                    best[id] = { kg: row.peso_kg, reps: row.repeticiones };
                }
            }
            setRecords(best);
        }

        fetchRecords();
    }, [userProfile, exerciseIds.join(',')]);

    return records;
}
