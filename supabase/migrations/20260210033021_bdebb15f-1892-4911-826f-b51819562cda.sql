
-- Learning streaks (check-in records)
CREATE TABLE public.learning_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  check_in_date date NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 0,
  activities jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_in_date)
);

ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view streaks in their org"
ON public.learning_streaks FOR SELECT
USING (
  organization_id = get_user_organization_id(auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can manage their own streaks"
ON public.learning_streaks FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Org admins can manage streaks"
ON public.learning_streaks FOR ALL
USING (is_org_admin(auth.uid(), organization_id));

-- Achievements (definitions)
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  icon text DEFAULT 'trophy',
  category text DEFAULT 'learning',
  condition jsonb DEFAULT '{}'::jsonb,
  points integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view achievements in their org"
ON public.achievements FOR SELECT
USING (
  organization_id = get_user_organization_id(auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Org admins can manage achievements"
ON public.achievements FOR ALL
USING (is_org_admin(auth.uid(), organization_id));

CREATE TRIGGER update_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- User achievements (earned)
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Managers can view achievements in their org"
ON public.user_achievements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = user_achievements.user_id
    AND p.organization_id = get_user_organization_id(auth.uid())
  )
  AND (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'org_admin'::app_role))
);

CREATE POLICY "Org admins can manage user achievements"
ON public.user_achievements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM achievements a
    WHERE a.id = user_achievements.achievement_id
    AND is_org_admin(auth.uid(), a.organization_id)
  )
);
