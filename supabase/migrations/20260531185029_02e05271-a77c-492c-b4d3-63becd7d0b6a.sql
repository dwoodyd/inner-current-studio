
CREATE TABLE public.founding_member_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  name text NOT NULL,
  current_focus text,
  why text NOT NULL,
  practice_context text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_at timestamptz,
  reviewed_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.founding_member_applications TO authenticated;
GRANT INSERT ON public.founding_member_applications TO anon;
GRANT ALL ON public.founding_member_applications TO service_role;

ALTER TABLE public.founding_member_applications ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authed) can submit an application
CREATE POLICY "Anyone can submit an application"
ON public.founding_member_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Applicants can view their own submissions (by user_id when signed in)
CREATE POLICY "Users can view their own applications"
ON public.founding_member_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view, update, and delete all
CREATE POLICY "Admins can view all applications"
ON public.founding_member_applications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
ON public.founding_member_applications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete applications"
ON public.founding_member_applications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_founding_member_applications_updated_at
BEFORE UPDATE ON public.founding_member_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_founding_applications_status ON public.founding_member_applications (status, created_at DESC);
CREATE INDEX idx_founding_applications_user ON public.founding_member_applications (user_id);
