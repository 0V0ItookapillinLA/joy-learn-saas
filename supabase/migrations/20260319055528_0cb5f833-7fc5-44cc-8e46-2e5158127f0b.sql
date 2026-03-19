
-- Fix the overly permissive INSERT policy on learning_reminder_logs
DROP POLICY IF EXISTS "System can insert reminder logs" ON public.learning_reminder_logs;

CREATE POLICY "Authenticated can insert reminder logs in their org"
  ON public.learning_reminder_logs FOR INSERT TO authenticated
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));
