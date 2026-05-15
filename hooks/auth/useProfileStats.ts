import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export interface PesoPoint { fecha: string; valor: number; }

export interface WorkoutHistoryItem {
    id_entrenamiento: number;
    rutina_nombre: string;
    fecha_inicio: string;
    duracion_min: number | null;
    series: { ejercicio: string; num_serie: number; peso_kg: number; repeticiones: number }[];
}

interface ProfileStats {
    pesosGrafico: PesoPoint[];
    fechasEntrenadas: string[];
    workoutHistory: WorkoutHistoryItem[];
    loading: boolean;
}

function toDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useProfileStats(idUsuario: number | null): ProfileStats {
    const [pesosGrafico, setPesosGrafico] = useState<PesoPoint[]>([]);
    const [fechasEntrenadas, setFechasEntrenadas] = useState<string[]>([]);
    const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!idUsuario) { setLoading(false); return; }

        async function load() {
            setLoading(true);
            try {
                // Weight data
                const { data: pesos } = await supabase
                    .from('peso')
                    .select('peso_kg, fecha')
                    .eq('id_usuario', idUsuario)
                    .order('fecha', { ascending: true });

                setPesosGrafico((pesos ?? []).map(p => ({ fecha: p.fecha, valor: p.peso_kg })));

                // Training dates for calendar (last 3 months)
                const calStart = new Date();
                calStart.setMonth(calStart.getMonth() - 3);
                const { data: entrenos } = await supabase
                    .from('entrenamiento')
                    .select('fecha_inicio, id_entrenamiento, duracion_min, id_rutina')
                    .eq('id_usuario', idUsuario)
                    .gte('fecha_inicio', calStart.toISOString())
                    .not('fecha_fin', 'is', null)
                    .order('fecha_inicio', { ascending: false });

                const fechas = [...new Set((entrenos ?? []).map(e => toDateStr(new Date(e.fecha_inicio))))];
                setFechasEntrenadas(fechas);

                // Last 5 workouts with series detail
                const last5 = (entrenos ?? []).slice(0, 5);
                const history: WorkoutHistoryItem[] = await Promise.all(
                    last5.map(async (e) => {
                        // Get routine name
                        const { data: rutina } = await supabase
                            .from('rutina')
                            .select('nombre')
                            .eq('id_rutina', e.id_rutina)
                            .single();

                        // Get series with exercise names
                        const { data: series } = await supabase
                            .from('serie')
                            .select('num_serie, peso_kg, repeticiones, id_ejercicio, ejercicio(nombre)')
                            .eq('id_entrenamiento', e.id_entrenamiento)
                            .order('num_serie');

                        return {
                            id_entrenamiento: e.id_entrenamiento,
                            rutina_nombre: rutina?.nombre ?? 'Workout',
                            fecha_inicio: e.fecha_inicio,
                            duracion_min: e.duracion_min,
                            series: (series ?? []).map((s: any) => ({
                                ejercicio: s.ejercicio?.nombre ?? '–',
                                num_serie: s.num_serie,
                                peso_kg: s.peso_kg ?? 0,
                                repeticiones: s.repeticiones ?? 0,
                            })),
                        };
                    })
                );

                setWorkoutHistory(history);
            } catch (e) {
                console.error('useProfileStats:', e);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [idUsuario]);

    return { pesosGrafico, fechasEntrenadas, workoutHistory, loading };
}
