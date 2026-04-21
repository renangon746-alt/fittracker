import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export interface Exercise {
    id_ejercicio: number;
    nombre: string;
    image_key: string | null;
}

export function useExercises() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            const { data, error } = await supabase
                .from('ejercicio')
                .select('id_ejercicio, nombre, image_key')
                .order('nombre');

            if (!error && data) setExercises(data);
            setLoading(false);
        }
        fetch();
    }, []);

    return { exercises, loading };
}
