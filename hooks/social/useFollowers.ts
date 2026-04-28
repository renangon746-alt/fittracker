import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface FollowSummary {
  followers: number;
  following: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export function useFollowers(targetUserId: number | null) {
  const { userProfile } = useUser();
  const currentUserId = userProfile?.id_usuario ?? null;

  const [summary, setSummary] = useState<FollowSummary>({
    followers: 0,
    following: 0,
    isFollowing: false,
    isOwnProfile: false,
  });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [followersRes, followingRes, edgeRes] = await Promise.all([
      supabase
        .from('seguidor')
        .select('id_seguidor', { count: 'exact', head: true })
        .eq('id_usuario_seguido', targetUserId),
      supabase
        .from('seguidor')
        .select('id_seguidor', { count: 'exact', head: true })
        .eq('id_usuario_seguidor', targetUserId),
      currentUserId && currentUserId !== targetUserId
        ? supabase
            .from('seguidor')
            .select('id_seguidor')
            .eq('id_usuario_seguidor', currentUserId)
            .eq('id_usuario_seguido', targetUserId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    setSummary({
      followers: followersRes.count ?? 0,
      following: followingRes.count ?? 0,
      isFollowing: !!edgeRes.data,
      isOwnProfile: currentUserId === targetUserId,
    });

    setLoading(false);
  }, [targetUserId, currentUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const follow = useCallback(async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;
    setPending(true);
    setSummary(s => ({ ...s, isFollowing: true, followers: s.followers + 1 }));
    const { error } = await supabase
      .from('seguidor')
      .insert({ id_usuario_seguidor: currentUserId, id_usuario_seguido: targetUserId });
    if (error) {
      setSummary(s => ({ ...s, isFollowing: false, followers: Math.max(0, s.followers - 1) }));
    }
    setPending(false);
  }, [currentUserId, targetUserId]);

  const unfollow = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;
    setPending(true);
    setSummary(s => ({ ...s, isFollowing: false, followers: Math.max(0, s.followers - 1) }));
    const { error } = await supabase
      .from('seguidor')
      .delete()
      .eq('id_usuario_seguidor', currentUserId)
      .eq('id_usuario_seguido', targetUserId);
    if (error) {
      setSummary(s => ({ ...s, isFollowing: true, followers: s.followers + 1 }));
    }
    setPending(false);
  }, [currentUserId, targetUserId]);

  const toggle = useCallback(async () => {
    if (summary.isFollowing) await unfollow();
    else await follow();
  }, [summary.isFollowing, follow, unfollow]);

  return { ...summary, loading, pending, follow, unfollow, toggle, refresh };
}

export type FollowUser = {
  id: number;
  nombre: string;
  nickname: string | null;
  email: string | null;
  auth_uuid: string | null;
};

/**
 * Fetch the list of users that follow `targetUserId`.
 */
export async function fetchFollowers(targetUserId: number): Promise<FollowUser[]> {
  const { data, error } = await supabase
    .from('seguidor')
    .select('usuario:id_usuario_seguidor(id_usuario, nombre, nickname, email, auth_uuid)')
    .eq('id_usuario_seguido', targetUserId)
    .order('fecha_seguimiento', { ascending: false });

  if (error || !data) return [];
  return (data as any[])
    .map(r => r.usuario)
    .filter(Boolean)
    .map(u => ({
      id: u.id_usuario,
      nombre: u.nombre,
      nickname: u.nickname ?? null,
      email: u.email ?? null,
      auth_uuid: u.auth_uuid ?? null,
    }));
}

/**
 * Fetch the list of users that `targetUserId` follows.
 */
export async function fetchFollowing(targetUserId: number): Promise<FollowUser[]> {
  const { data, error } = await supabase
    .from('seguidor')
    .select('usuario:id_usuario_seguido(id_usuario, nombre, nickname, email, auth_uuid)')
    .eq('id_usuario_seguidor', targetUserId)
    .order('fecha_seguimiento', { ascending: false });

  if (error || !data) return [];
  return (data as any[])
    .map(r => r.usuario)
    .filter(Boolean)
    .map(u => ({
      id: u.id_usuario,
      nombre: u.nombre,
      nickname: u.nickname ?? null,
      email: u.email ?? null,
      auth_uuid: u.auth_uuid ?? null,
    }));
}
