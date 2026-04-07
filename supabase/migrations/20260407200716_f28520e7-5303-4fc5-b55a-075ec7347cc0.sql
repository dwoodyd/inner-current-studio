
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  onboarding_reason TEXT,
  onboarding_style TEXT,
  onboarding_challenge TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Check-ins
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own check_ins" ON public.check_ins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Wheels
CREATE TABLE public.wheels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  center_text TEXT NOT NULL DEFAULT '',
  segments JSONB NOT NULL DEFAULT '[]',
  type TEXT NOT NULL DEFAULT 'alignment',
  completion_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wheels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wheels" ON public.wheels FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_wheels_updated_at BEFORE UPDATE ON public.wheels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gathered sequences
CREATE TABLE public.gathered_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  lines JSONB NOT NULL DEFAULT '[]',
  playback_settings JSONB NOT NULL DEFAULT '{"speed":1,"mode":"text"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gathered_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sequences" ON public.gathered_sequences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Momentum sessions
CREATE TABLE public.momentum_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phrase TEXT NOT NULL DEFAULT '',
  duration INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.momentum_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own momentum" ON public.momentum_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Future pages
CREATE TABLE public.future_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  template TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  vibe_check TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.future_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own future_pages" ON public.future_pages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Imagine-if entries
CREATE TABLE public.imagine_if_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.imagine_if_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own imagine_if" ON public.imagine_if_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Overflow entries
CREATE TABLE public.overflow_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT '',
  resource_amount TEXT NOT NULL DEFAULT '',
  entry_text TEXT NOT NULL DEFAULT '',
  feeling_text TEXT NOT NULL DEFAULT '',
  resistance_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.overflow_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own overflow" ON public.overflow_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Custom rituals
CREATE TABLE public.custom_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  steps JSONB NOT NULL DEFAULT '[]',
  duration_estimate INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_rituals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rituals" ON public.custom_rituals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Resistance entries
CREATE TABLE public.resistance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL DEFAULT '',
  body_location TEXT NOT NULL DEFAULT '',
  charge_before TEXT NOT NULL DEFAULT '',
  charge_after TEXT NOT NULL DEFAULT '',
  clearing_mode TEXT NOT NULL DEFAULT '',
  softened_statement TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resistance_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own resistance" ON public.resistance_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Thought shifts
CREATE TABLE public.thought_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_thought TEXT NOT NULL DEFAULT '',
  charge_type TEXT NOT NULL DEFAULT '',
  softer_statement TEXT NOT NULL DEFAULT '',
  believable_statement TEXT NOT NULL DEFAULT '',
  support_statement TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.thought_shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own thought_shifts" ON public.thought_shifts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Today flow (one row per user per day)
CREATE TABLE public.today_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flow_date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_ritual BOOLEAN NOT NULL DEFAULT false,
  reset_used BOOLEAN NOT NULL DEFAULT false,
  reflection_completed BOOLEAN NOT NULL DEFAULT false,
  momentum_completed BOOLEAN NOT NULL DEFAULT false,
  return_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, flow_date)
);
ALTER TABLE public.today_flow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own today_flow" ON public.today_flow FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_today_flow_updated_at BEFORE UPDATE ON public.today_flow FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
