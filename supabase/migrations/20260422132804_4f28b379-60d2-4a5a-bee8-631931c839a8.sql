CREATE TABLE IF NOT EXISTS public.reality_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'guided',
  title TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  feeling_word TEXT NOT NULL DEFAULT '',
  sensory_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  revisit_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reality_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  script_id UUID REFERENCES public.reality_scripts(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  entry_text TEXT NOT NULL DEFAULT '',
  match_strength INTEGER NOT NULL DEFAULT 1,
  felt_like_match BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reality_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'Dreamer',
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  script_count INTEGER NOT NULL DEFAULT 0,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  constellation_progress INTEGER NOT NULL DEFAULT 0,
  last_scripted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain)
);

ALTER TABLE public.reality_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reality_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reality_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reality_scripts"
ON public.reality_scripts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own reality_evidence"
ON public.reality_evidence
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own reality_progress"
ON public.reality_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own reality_progress"
ON public.reality_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reality_progress"
ON public.reality_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reality_scripts_user_domain ON public.reality_scripts(user_id, domain, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reality_evidence_user_domain ON public.reality_evidence(user_id, domain, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reality_evidence_script_id ON public.reality_evidence(script_id);
CREATE INDEX IF NOT EXISTS idx_reality_progress_user_domain ON public.reality_progress(user_id, domain);

CREATE TRIGGER update_reality_scripts_updated_at
BEFORE UPDATE ON public.reality_scripts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reality_progress_updated_at
BEFORE UPDATE ON public.reality_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();