import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface FollowData {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  loading: boolean;
  toggleFollow: () => Promise<void>;
  refreshFollowData: () => Promise<void>;
}

export function useFollow(targetUserId: number | null | undefined): FollowData {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  const loadMyUserId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('usuario')
      .select('id_usuario')
      .eq('email', user.email)
      .single();
    
    return data?.id_usuario || null;
  }, []);

  const loadFollowData = useCallback(async () => {
    if (!targetUserId || !myUserId) {
      setLoading(false);
      return;
    }

    try {
      // Check if I'm following the target user
      const { data: followData } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('follower_id', myUserId)
        .eq('following_id', targetUserId)
        .maybeSingle();

      setIsFollowing(!!followData);

      // Get followers count
      const { count: followersCountData } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId);

      // Get following count
      const { count: followingCountData } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetUserId);

      setFollowersCount(followersCountData || 0);
      setFollowingCount(followingCountData || 0);
    } catch (error) {
      console.error('Error loading follow data:', error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, myUserId]);

  const toggleFollow = useCallback(async () => {
    if (!targetUserId || !myUserId) return;

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', myUserId)
          .eq('following_id', targetUserId);
        
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({
            follower_id: myUserId,
            following_id: targetUserId,
          });
        
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Reload data on error to sync state
      await loadFollowData();
    }
  }, [targetUserId, myUserId, isFollowing, loadFollowData]);

  const refreshFollowData = useCallback(async () => {
    await loadFollowData();
  }, [loadFollowData]);

  useEffect(() => {
    const init = async () => {
      const userId = await loadMyUserId();
      setMyUserId(userId);
    };
    init();
  }, [loadMyUserId]);

  useEffect(() => {
    if (myUserId) {
      loadFollowData();
    }
  }, [targetUserId, myUserId, loadFollowData]);

  return {
    isFollowing,
    followersCount,
    followingCount,
    loading,
    toggleFollow,
    refreshFollowData,
  };
}
