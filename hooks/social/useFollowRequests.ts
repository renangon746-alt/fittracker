import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface FollowRequest {
  id_solicitud: number;
  id_solicitante: number;
  id_destinatario: number;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  fecha_solicitud: string;
  solicitante?: {
    id_usuario: number;
    nombre: string;
    nickname: string | null;
    auth_uuid: string | null;
  };
}

export function useFollowRequestStatus(targetUserId: number | null) {
  const { userProfile } = useUser();
  const currentUserId = userProfile?.id_usuario ?? null;

  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      setHasPendingRequest(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('solicitud_seguimiento')
      .select('id_solicitud')
      .eq('id_solicitante', currentUserId)
      .eq('id_destinatario', targetUserId)
      .eq('estado', 'pendiente')
      .maybeSingle();

    setHasPendingRequest(!!data);
    setLoading(false);
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sendRequest = useCallback(async () => {
    if (!currentUserId || !targetUserId || pending) return;
    setPending(true);
    setError(null);
    const { error: err } = await supabase
      .from('solicitud_seguimiento')
      .insert({ id_solicitante: currentUserId, id_destinatario: targetUserId });
    if (err) {
      setError(err.message);
    } else {
      setHasPendingRequest(true);
    }
    setPending(false);
  }, [currentUserId, targetUserId, pending]);

  const cancelRequest = useCallback(async () => {
    if (!currentUserId || !targetUserId || pending) return;
    setPending(true);
    setError(null);
    const { error: err } = await supabase
      .from('solicitud_seguimiento')
      .delete()
      .eq('id_solicitante', currentUserId)
      .eq('id_destinatario', targetUserId)
      .eq('estado', 'pendiente');
    if (err) {
      setError(err.message);
    } else {
      setHasPendingRequest(false);
    }
    setPending(false);
  }, [currentUserId, targetUserId, pending]);

  return { hasPendingRequest, loading, pending, error, sendRequest, cancelRequest, refresh };
}

export function useIncomingFollowRequests() {
  const { userProfile } = useUser();
  const currentUserId = userProfile?.id_usuario ?? null;

  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!currentUserId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('solicitud_seguimiento')
      .select(`
        id_solicitud,
        id_solicitante,
        id_destinatario,
        estado,
        fecha_solicitud,
        solicitante:usuario!solicitud_seguimiento_id_solicitante_fkey(id_usuario, nombre, nickname, auth_uuid)
      `)
      .eq('id_destinatario', currentUserId)
      .eq('estado', 'pendiente')
      .order('fecha_solicitud', { ascending: false });

    if (error || !data) {
      setRequests([]);
    } else {
      const mapped = (data as any[]).map((r: any) => ({
        id_solicitud: r.id_solicitud,
        id_solicitante: r.id_solicitante,
        id_destinatario: r.id_destinatario,
        estado: r.estado,
        fecha_solicitud: r.fecha_solicitud,
        solicitante: r.solicitante ? {
          id_usuario: r.solicitante.id_usuario,
          nombre: r.solicitante.nombre,
          nickname: r.solicitante.nickname,
          auth_uuid: r.solicitante.auth_uuid,
        } : undefined,
      }));
      setRequests(mapped);
    }
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const acceptRequest = useCallback(async (requestId: number) => {
    const { error } = await supabase.rpc('aceptar_solicitud_seguimiento', { solicitud_id: requestId });
    if (error) {
      console.error('acceptRequest:', error);
    } else {
      setRequests(prev => prev.filter(r => r.id_solicitud !== requestId));
    }
  }, []);

  const rejectRequest = useCallback(async (requestId: number) => {
    const { error } = await supabase
      .from('solicitud_seguimiento')
      .update({ estado: 'rechazada' })
      .eq('id_solicitud', requestId);
    if (error) {
      console.error('rejectRequest:', error);
    } else {
      setRequests(prev => prev.filter(r => r.id_solicitud !== requestId));
    }
  }, []);

  return { requests, loading, refresh, acceptRequest, rejectRequest };
}
