import { supabase } from '@/lib/supabase';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface UserProfile {
    id_usuario: number;
    nombre: string;
    email: string;
    racha_actual?: number;
    bio?: string;
    foto_perfil?: string;
    nickname?: string;
    perfil_publico?: boolean;
    enlace?: string;
}

interface UserContextType {
    userProfile: UserProfile | null;
    avatarUrl: string | null;
    authUserId: string | null;
    loading: boolean;
    errorMsg: string | null;
    refreshUser: () => Promise<void>;
    clearUser: () => void;
}

const UserContext = createContext<UserContextType>({
    userProfile: null,
    avatarUrl: null,
    authUserId: null,
    loading: true,
    errorMsg: null,
    refreshUser: async () => {},
    clearUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [authUserId, setAuthUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const loadUser = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                setUserProfile(null);
                setAvatarUrl(null);
                setAuthUserId(null);
                return;
            }

            setAuthUserId(user.id);

            const { data: profile, error: profileError } = await supabase
                .from('usuario')
                .select('*')
                .eq('email', user.email)
                .single();

            if (profileError || !profile) {
                setErrorMsg('Error cargando perfil: ' + profileError?.message);
                return;
            }

            setUserProfile(profile);

            // Build avatar URL with cache-busting timestamp
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(`${user.id}/avatar.jpg`);
            setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);

        } catch (error) {
            setErrorMsg('Error inesperado: ' + String(error));
        } finally {
            setLoading(false);
        }
    }, []);

    const clearUser = useCallback(() => {
        setUserProfile(null);
        setAvatarUrl(null);
        setAuthUserId(null);
        setErrorMsg(null);
    }, []);

    // Load user on mount and listen for auth state changes
    useEffect(() => {
        loadUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                loadUser();
            } else if (event === 'SIGNED_OUT') {
                clearUser();
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [loadUser, clearUser]);

    return (
        <UserContext.Provider value={{
            userProfile,
            avatarUrl,
            authUserId,
            loading,
            errorMsg,
            refreshUser: loadUser,
            clearUser,
        }}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * Hook to access the current logged-in user's profile and avatar from anywhere in the app.
 * 
 * @example
 * const { userProfile, avatarUrl, loading } = useUser();
 */
export function useUser() {
    return useContext(UserContext);
}
