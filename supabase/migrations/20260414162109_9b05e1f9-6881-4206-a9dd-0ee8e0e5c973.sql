
-- Money States (money-specific emotional check-in)
CREATE TABLE public.money_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  state TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.money_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own money_states" ON public.money_states FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Current Deposits (receiving ritual)
CREATE TABLE public.current_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount TEXT NOT NULL DEFAULT '',
  represents TEXT NOT NULL DEFAULT '',
  feeling TEXT NOT NULL DEFAULT '',
  ease_when_arrives TEXT NOT NULL DEFAULT '',
  resistance_level TEXT NOT NULL DEFAULT 'neutral',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.current_deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own current_deposits" ON public.current_deposits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Money Openings (7 money desires)
CREATE TABLE public.money_openings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  desire TEXT NOT NULL DEFAULT '',
  why_it_matters TEXT NOT NULL DEFAULT '',
  desired_feeling TEXT NOT NULL DEFAULT '',
  current_resistance TEXT NOT NULL DEFAULT '',
  next_aligned_step TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.money_openings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own money_openings" ON public.money_openings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_money_openings_updated_at BEFORE UPDATE ON public.money_openings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Overflow Spending (daily abundance rehearsal)
CREATE TABLE public.overflow_spending (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  daily_amount TEXT NOT NULL DEFAULT '',
  what_chosen TEXT NOT NULL DEFAULT '',
  why_it_matters TEXT NOT NULL DEFAULT '',
  how_it_feels TEXT NOT NULL DEFAULT '',
  resistance_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.overflow_spending ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own overflow_spending" ON public.overflow_spending FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
