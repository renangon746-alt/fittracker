import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface Routine {
    id_rutina: number;
    nombre: string;
    fecha_creacion: string;
    carpeta: 'my_routines' | 'saved' | 'other';
}

export interface RoutinesByFolder {
    my_routines: Routine[];
    saved: Routine[];
    other: Routine[];
}

export function useRoutines() {
    const { userProfile } = useUser();
    const [routinesByFolder, setRoutinesByFolder] = useState<RoutinesByFolder>({
        my_routines: [],
        saved: [],
        other: [],
    });
    const [loading, setLoading] = useState(true);

    const fetchRoutines = useCallback(async () => {
        if (!userProfile) return;

        setLoading(true);

        const { data, error } = await supabase
            .from('rutina')
            .select('id_rutina, nombre, fecha_creacion, carpeta')
            .eq('id_usuario', userProfile.id_usuario)
            .order('fecha_creacion', { ascending: false });

        if (!error && data) {
            const grouped: RoutinesByFolder = { my_routines: [], saved: [], other: [] };
            for (const routine of data) {
                const key = routine.carpeta as keyof RoutinesByFolder;
                if (grouped[key]) {
                    grouped[key].push(routine);
                } else {
                    grouped.other.push(routine);
                }
            }
            setRoutinesByFolder(grouped);
        }

        setLoading(false);
    }, [userProfile]);

    useEffect(() => {
        fetchRoutines();
    }, [fetchRoutines]);

    return { routinesByFolder, loading, refresh: fetchRoutines };
}
