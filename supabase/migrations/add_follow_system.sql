-- ============================================
-- SISTEMA DE FOLLOWERS PARA FITTRACKER
-- ============================================

-- 1) Asegurar columna auth_uuid en usuario (si no existe)
ALTER TABLE public.usuario 
ADD COLUMN IF NOT EXISTS auth_uuid UUID;

-- Backfill de auth_uuid usando email (para usuarios existentes)
UPDATE public.usuario u 
SET auth_uuid = au.id 
FROM auth.users au 
WHERE LOWER(u.email) = LOWER(au.email) 
  AND u.auth_uuid IS NULL;

-- Índice único para auth_uuid (opcional pero recomendado)
CREATE UNIQUE INDEX IF NOT EXISTS usuario_auth_uuid_uidx 
ON public.usuario (auth_uuid) 
WHERE auth_uuid IS NOT NULL;

-- 2) Tabla de follows
CREATE TABLE IF NOT EXISTS public.user_follows (
  follower_id BIGINT NOT NULL REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
  following_id BIGINT NOT NULL REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT user_follows_no_self_follow CHECK (follower_id <> following_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS user_follows_following_idx 
ON public.user_follows (following_id);

CREATE INDEX IF NOT EXISTS user_follows_follower_idx 
ON public.user_follows (follower_id);

-- 3) Row Level Security (RLS)
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT: usuarios autenticados pueden ver todos los follows
DROP POLICY IF EXISTS "user_follows_select_auth" ON public.user_follows;
CREATE POLICY "user_follows_select_auth" ON public.user_follows
  FOR SELECT TO authenticated
  USING (true);

-- Policy para INSERT: solo puedes seguir a otros si eres el follower
DROP POLICY IF EXISTS "user_follows_insert_own" ON public.user_follows;
CREATE POLICY "user_follows_insert_own" ON public.user_follows
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario u 
      WHERE u.id_usuario = follower_id 
        AND u.auth_uuid = auth.uid()
    )
  );

-- Policy para DELETE: solo puedes eliminar tus propios follows
DROP POLICY IF EXISTS "user_follows_delete_own" ON public.user_follows;
CREATE POLICY "user_follows_delete_own" ON public.user_follows
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario u 
      WHERE u.id_usuario = follower_id 
        AND u.auth_uuid = auth.uid()
    )
  );

-- Grants para usuarios autenticados
GRANT SELECT, INSERT, DELETE ON public.user_follows TO authenticated;

-- ============================================
-- CONSULTAS DE EJEMPLO (para参考)
-- ============================================

-- Obtener followers de un usuario
-- SELECT u.* FROM public.user_follows f
-- JOIN public.usuario u ON u.id_usuario = f.follower_id
-- WHERE f.following_id = <user_id>;

-- Obtener a quién sigue un usuario
-- SELECT u.* FROM public.user_follows f
-- JOIN public.usuario u ON u.id_usuario = f.following_id
-- WHERE f.follower_id = <user_id>;

-- Contar followers
-- SELECT COUNT(*) FROM public.user_follows WHERE following_id = <user_id>;

-- Contar following
-- SELECT COUNT(*) FROM public.user_follows WHERE follower_id = <user_id>;

-- Verificar si sigo a alguien
-- SELECT EXISTS (
--   SELECT 1 FROM public.user_follows 
--   WHERE follower_id = <my_id> AND following_id = <target_id>
-- );
