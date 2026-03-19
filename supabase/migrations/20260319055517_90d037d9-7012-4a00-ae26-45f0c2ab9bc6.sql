
-- External courses table (mock 京英 data)
CREATE TABLE public.external_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  source text NOT NULL DEFAULT 'jingying',
  external_id text,
  title text NOT NULL,
  description text,
  course_type text DEFAULT 'video',
  cover_image_url text,
  content_url text,
  duration_minutes integer DEFAULT 0,
  tags jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.external_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view external courses in their org"
  ON public.external_courses FOR SELECT TO authenticated
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Org admins can manage external courses"
  ON public.external_courses FOR ALL TO authenticated
  USING (is_org_admin(auth.uid(), organization_id));

-- Learning reminder logs
CREATE TABLE public.learning_reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  user_id uuid NOT NULL,
  training_plan_id uuid REFERENCES public.training_plans(id),
  reminder_type text DEFAULT 'daily_push',
  channel text DEFAULT 'jingme',
  status text DEFAULT 'sent',
  message_content text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view reminder logs"
  ON public.learning_reminder_logs FOR SELECT TO authenticated
  USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "System can insert reminder logs"
  ON public.learning_reminder_logs FOR INSERT TO public
  WITH CHECK (true);

-- Enhance achievements table for badge customization
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS badge_image_url text;
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS tier text DEFAULT 'bronze';
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS unlock_message text;

-- Exam results table for tracking individual attempts
CREATE TABLE public.exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  training_plan_id uuid REFERENCES public.training_plans(id),
  answers jsonb DEFAULT '[]'::jsonb,
  score numeric DEFAULT 0,
  max_score numeric DEFAULT 100,
  passed boolean DEFAULT false,
  ai_feedback jsonb DEFAULT '{}'::jsonb,
  attempt_number integer DEFAULT 1,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exam results"
  ON public.exam_results FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own exam results"
  ON public.exam_results FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can view exam results in their org"
  ON public.exam_results FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM exams e
    WHERE e.id = exam_results.exam_id
    AND e.organization_id = get_user_organization_id(auth.uid())
  ) AND (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'org_admin')));

-- Enable realtime for learning_streaks for live rankings
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_streaks;
