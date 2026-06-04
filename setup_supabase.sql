-- ============================================================
-- EJECUTAR ESTE SQL EN: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Crear tabla app_settings (para resetToken y proyectoJoanUrl)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- 2. Crear tabla landscape_videos
CREATE TABLE IF NOT EXISTS public.landscape_videos (
  landscape_id TEXT PRIMARY KEY,
  video_url    TEXT NOT NULL
);

-- 3. Habilitar RLS
ALTER TABLE public.app_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landscape_videos ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de lectura pública para anon key (frontend)
CREATE POLICY "Lectura publica app_settings"
  ON public.app_settings FOR SELECT USING (true);

CREATE POLICY "Lectura publica landscape_videos"
  ON public.landscape_videos FOR SELECT USING (true);

-- 5. Políticas de escritura para service_role (API routes)
-- (service_role bypasa RLS automáticamente, no necesita política)

-- 6. Seed datos iniciales en app_settings
INSERT INTO public.app_settings (key, value)
VALUES
  ('resetToken',     'INITIAL_TOKEN_2026'),
  ('proyectoJoanUrl', '')
ON CONFLICT (key) DO NOTHING;

-- 7. Seed landscape videos
INSERT INTO public.landscape_videos (landscape_id, video_url)
VALUES
  ('la-paloma-de-la-paz', 'https://www.youtube.com/watch?v=F3GbeE35zWc'),
  ('cano-cristales',      'https://www.youtube.com/watch?v=9_C8T3xY1wM'),
  ('valle-cocora',        'https://www.youtube.com/watch?v=N6T2c2R6rM8'),
  ('condor-andes',        'https://www.youtube.com/watch?v=jWstL8X2gA0'),
  ('mascaras-teatro',     'https://www.youtube.com/watch?v=1F_UuHq-fR8'),
  ('paleta-artista',      'https://www.youtube.com/watch?v=Qh_i747C8uY')
ON CONFLICT (landscape_id) DO NOTHING;

-- ============================================================
-- TAMBIÉN: Crear el Storage Bucket para uploads de archivos
-- Ve a: Storage → New Bucket → Name: "uploads" → Public: ON
-- ============================================================
