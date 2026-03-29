import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// AsyncStorage solo funciona en nativo — en web usamos localStorage del browser
const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,                     // AsyncStorage en nativo, localStorage en web
    autoRefreshToken: true,      // refresca el token automáticamente
    persistSession: true,        // mantiene la sesión entre reinicios
    detectSessionInUrl: false,   // necesario en React Native (no hay URL browser)
  },
});