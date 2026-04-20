import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';

export type FolderKey = 'my_routines' | 'saved' | 'other';

export const FOLDER_OPTIONS: { label: string; value: FolderKey }[] = [
    { label: 'My Routines', value: 'my_routines' },
    { label: 'Routines Saved', value: 'saved' },
    { label: 'Other Folders', value: 'other' },
];

export function useCreateRoutine(onSuccess?: () => void) {
    const { userProfile } = useUser();
    const [visible, setVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [carpeta, setCarpeta] = useState<FolderKey>('my_routines');
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    function openModal() {
        setNombre('');
        setCarpeta('my_routines');
        setErrorMsg(null);
        setVisible(true);
    }

    function closeModal() {
        setVisible(false);
    }

    async function handleCreate() {
        if (!userProfile) return;
        if (!nombre.trim()) { setErrorMsg('El nombre es obligatorio.'); return; }

        setSaving(true);
        setErrorMsg(null);

        const { data, error } = await supabase
            .from('rutina')
            .insert({
                id_usuario: userProfile.id_usuario,
                nombre: nombre.trim(),
                carpeta,
            })
            .select('id_rutina, nombre')
            .single();

        setSaving(false);

        if (error || !data) {
            setErrorMsg('Error al crear la rutina.');
            return;
        }

        setVisible(false);
        onSuccess?.();
        router.push({ pathname: '/train/routine', params: { id: String(data.id_rutina), nombre: data.nombre } });
    }

    return {
        visible, openModal, closeModal,
        nombre, setNombre,
        carpeta, setCarpeta,
        saving, errorMsg,
        handleCreate,
    };
}
