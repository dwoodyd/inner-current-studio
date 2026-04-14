
-- Evidence of Support
CREATE TABLE public.evidence_of_support (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  entry_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.evidence_of_support ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own evidence_of_support"
  ON public.evidence_of_support FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Money Resistance
CREATE TABLE public.money_resistance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resistance_type TEXT NOT NULL DEFAULT '',
  body_sensation TEXT NOT NULL DEFAULT '',
  charge_before TEXT NOT NULL DEFAULT '',
  charge_after TEXT NOT NULL DEFAULT '',
  softened_thought TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.money_resistance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own money_resistance"
  ON public.money_resistance FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Payment Shifts
CREATE TABLE public.payment_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_name TEXT NOT NULL DEFAULT '',
  what_it_supports TEXT NOT NULL DEFAULT '',
  what_it_provided TEXT NOT NULL DEFAULT '',
  from_steadiness TEXT NOT NULL DEFAULT '',
  circulation_feeling TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own payment_shifts"
  ON public.payment_shifts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
