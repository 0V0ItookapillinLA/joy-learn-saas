-- Add super_admin policy to view all training_plans
DROP POLICY IF EXISTS "Super admins can manage all training plans" ON public.training_plans;

CREATE POLICY "Super admins can manage all training plans"
ON public.training_plans
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Add super_admin policy to view all practice_sessions  
DROP POLICY IF EXISTS "Super admins can manage all practice sessions" ON public.practice_sessions;

CREATE POLICY "Super admins can manage all practice sessions"
ON public.practice_sessions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Add super_admin policy to view all training_chapters
DROP POLICY IF EXISTS "Super admins can manage all training chapters" ON public.training_chapters;

CREATE POLICY "Super admins can manage all training chapters"
ON public.training_chapters
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));