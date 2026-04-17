-- Domain states (check-ins)
CREATE TABLE public.domain_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  state TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.domain_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own domain_states" ON public.domain_states
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_domain_states_user_domain ON public.domain_states(user_id, domain, created_at DESC);

-- Domain resistance entries
CREATE TABLE public.domain_resistance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  resistance_type TEXT NOT NULL DEFAULT '',
  body_sensation TEXT NOT NULL DEFAULT '',
  charge_before TEXT NOT NULL DEFAULT '',
  charge_after TEXT NOT NULL DEFAULT '',
  softened_thought TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.domain_resistance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own domain_resistance" ON public.domain_resistance
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_domain_resistance_user_domain ON public.domain_resistance(user_id, domain, created_at DESC);

-- Domain openings (desires)
CREATE TABLE public.domain_openings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  desire TEXT NOT NULL DEFAULT '',
  why_it_matters TEXT NOT NULL DEFAULT '',
  desired_feeling TEXT NOT NULL DEFAULT '',
  current_resistance TEXT NOT NULL DEFAULT '',
  next_aligned_step TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.domain_openings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own domain_openings" ON public.domain_openings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_domain_openings_user_domain ON public.domain_openings(user_id, domain, position);
CREATE TRIGGER update_domain_openings_updated_at
  BEFORE UPDATE ON public.domain_openings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Domain evidence
CREATE TABLE public.domain_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  entry_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.domain_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own domain_evidence" ON public.domain_evidence
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_domain_evidence_user_domain ON public.domain_evidence(user_id, domain, created_at DESC);

-- Add domain to gathered_sequences
ALTER TABLE public.gathered_sequences ADD COLUMN IF NOT EXISTS domain TEXT NOT NULL DEFAULT 'general';
CREATE INDEX IF NOT EXISTS idx_gathered_sequences_user_domain ON public.gathered_sequences(user_id, domain, created_at DESC);