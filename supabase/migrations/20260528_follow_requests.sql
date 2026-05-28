-- =====================================================================
-- Follow Requests system for private profiles
-- =====================================================================
-- Creates the `solicitud_seguimiento` table that stores pending follow
-- requests. When a user tries to follow a private profile, a request is
-- created. The target user must accept it before the follow relationship
-- is established in `seguidor`.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.solicitud_seguimiento (
    id_solicitud      BIGSERIAL    PRIMARY KEY,
    id_solicitante    INT          NOT NULL REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
    id_destinatario   INT          NOT NULL REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
    estado            VARCHAR(20)  NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
    fecha_solicitud   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT solicitud_no_self CHECK (id_solicitante <> id_destinatario),
    CONSTRAINT solicitud_unique  UNIQUE (id_solicitante, id_destinatario)
);

CREATE INDEX IF NOT EXISTS idx_solicitud_destinatario ON public.solicitud_seguimiento(id_destinatario, estado);
CREATE INDEX IF NOT EXISTS idx_solicitud_solicitante  ON public.solicitud_seguimiento(id_solicitante, estado);

-- ---------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------
ALTER TABLE public.solicitud_seguimiento ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read requests where they are involved
DROP POLICY IF EXISTS "solicitud_select_involved" ON public.solicitud_seguimiento;
CREATE POLICY "solicitud_select_involved" ON public.solicitud_seguimiento
    FOR SELECT
    TO authenticated
    USING (
        id_solicitante IN (SELECT id_usuario FROM public.usuario WHERE auth_uuid = auth.uid())
        OR
        id_destinatario IN (SELECT id_usuario FROM public.usuario WHERE auth_uuid = auth.uid())
    );

-- Users can only insert rows where they are the requester
DROP POLICY IF EXISTS "solicitud_insert_own" ON public.solicitud_seguimiento;
CREATE POLICY "solicitud_insert_own" ON public.solicitud_seguimiento
    FOR INSERT
    TO authenticated
    WITH CHECK (
        id_solicitante IN (SELECT id_usuario FROM public.usuario WHERE auth_uuid = auth.uid())
    );

-- Users can only update rows where they are the recipient (accept/reject)
DROP POLICY IF EXISTS "solicitud_update_recipient" ON public.solicitud_seguimiento;
CREATE POLICY "solicitud_update_recipient" ON public.solicitud_seguimiento
    FOR UPDATE
    TO authenticated
    USING (
        id_destinatario IN (SELECT id_usuario FROM public.usuario WHERE auth_uuid = auth.uid())
    );

-- Users can only delete rows where they are the requester
DROP POLICY IF EXISTS "solicitud_delete_own" ON public.solicitud_seguimiento;
CREATE POLICY "solicitud_delete_own" ON public.solicitud_seguimiento
    FOR DELETE
    TO authenticated
    USING (
        id_solicitante IN (SELECT id_usuario FROM public.usuario WHERE auth_uuid = auth.uid())
    );

-- ---------------------------------------------------------------------
-- Helper function: accept a follow request and create the seguidor row
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.aceptar_solicitud_seguimiento(solicitud_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_solicitante INT;
    v_destinatario INT;
BEGIN
    -- Get the request details
    SELECT id_solicitante, id_destinatario
    INTO v_solicitante, v_destinatario
    FROM public.solicitud_seguimiento
    WHERE id_solicitud = solicitud_id AND estado = 'pendiente';

    IF v_solicitante IS NULL THEN
        RAISE EXCEPTION 'Solicitud no encontrada o ya procesada';
    END IF;

    -- Verify the caller is the recipient
    IF NOT EXISTS (
        SELECT 1 FROM public.usuario
        WHERE id_usuario = v_destinatario AND auth_uuid = auth.uid()
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    -- Mark request as accepted
    UPDATE public.solicitud_seguimiento
    SET estado = 'aceptada'
    WHERE id_solicitud = solicitud_id;

    -- Create the follow relationship
    INSERT INTO public.seguidor (id_usuario_seguidor, id_usuario_seguido)
    VALUES (v_solicitante, v_destinatario)
    ON CONFLICT DO NOTHING;
END;
$$;
