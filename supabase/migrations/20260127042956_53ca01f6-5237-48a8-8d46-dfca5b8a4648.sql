-- Fix overly permissive INSERT policies for training_plans
DROP POLICY IF EXISTS "Authenticated users can create training_plans" ON public.training_plans;

CREATE POLICY "Authenticated users can create training_plans"
ON public.training_plans
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND organization_id = get_user_organization_id(auth.uid())
);

-- Fix overly permissive INSERT policies for training_chapters
DROP POLICY IF EXISTS "Authenticated users can create training_chapters" ON public.training_chapters;

CREATE POLICY "Authenticated users can create training_chapters"
ON public.training_chapters
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM training_plans tp 
    WHERE tp.id = training_plan_id 
    AND tp.organization_id = get_user_organization_id(auth.uid())
  )
);

-- Fix overly permissive INSERT policies for practice_sessions
DROP POLICY IF EXISTS "Authenticated users can create practice_sessions" ON public.practice_sessions;

CREATE POLICY "Authenticated users can create practice_sessions"
ON public.practice_sessions
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND organization_id = get_user_organization_id(auth.uid())
);