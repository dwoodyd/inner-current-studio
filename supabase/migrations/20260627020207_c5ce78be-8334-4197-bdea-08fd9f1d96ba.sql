
CREATE TABLE public.reading_bridge_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter text,
  opted_out boolean NOT NULL DEFAULT false,
  progress jsonb NOT NULL DEFAULT '[]'::jsonb,
  prompt_dismissed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_bridge_state TO authenticated;
GRANT ALL ON public.reading_bridge_state TO service_role;
ALTER TABLE public.reading_bridge_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rb_state_owner_select" ON public.reading_bridge_state FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rb_state_owner_insert" ON public.reading_bridge_state FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rb_state_owner_update" ON public.reading_bridge_state FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rb_state_owner_delete" ON public.reading_bridge_state FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rb_state_admin_select" ON public.reading_bridge_state FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_rb_state_updated_at BEFORE UPDATE ON public.reading_bridge_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reading_bridge_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rb_events_user_idx ON public.reading_bridge_events(user_id, created_at DESC);
CREATE INDEX rb_events_event_idx ON public.reading_bridge_events(event, created_at DESC);
GRANT SELECT, INSERT ON public.reading_bridge_events TO authenticated;
GRANT ALL ON public.reading_bridge_events TO service_role;
ALTER TABLE public.reading_bridge_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rb_events_owner_insert" ON public.reading_bridge_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rb_events_owner_select" ON public.reading_bridge_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rb_events_admin_select" ON public.reading_bridge_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
