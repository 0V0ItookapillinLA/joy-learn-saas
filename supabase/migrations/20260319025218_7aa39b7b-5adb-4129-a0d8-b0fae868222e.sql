
-- Create dialog_scripts table
CREATE TABLE public.dialog_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  knowledge_base_id uuid REFERENCES public.knowledge_bases(id) ON DELETE SET NULL,
  knowledge_doc_ids jsonb DEFAULT '[]'::jsonb,
  assessment_model jsonb DEFAULT '[]'::jsonb,
  character_id uuid REFERENCES public.ai_characters(id) ON DELETE SET NULL,
  voice_style text,
  dialog_turns jsonb DEFAULT '[]'::jsonb,
  mode text NOT NULL DEFAULT 'practice',
  practice_config jsonb DEFAULT '{"max_attempts": 3}'::jsonb,
  exam_config jsonb DEFAULT '{"passing_score": 60}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add updated_at trigger
CREATE TRIGGER update_dialog_scripts_updated_at
  BEFORE UPDATE ON public.dialog_scripts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.dialog_scripts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view dialog scripts in their org"
  ON public.dialog_scripts FOR SELECT
  TO authenticated
  USING (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated users can create dialog scripts"
  ON public.dialog_scripts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Org admins can manage dialog scripts"
  ON public.dialog_scripts FOR ALL
  TO authenticated
  USING (is_org_admin(auth.uid(), organization_id));

-- Add dialog_script_id to practice_sessions
ALTER TABLE public.practice_sessions
  ADD COLUMN dialog_script_id uuid REFERENCES public.dialog_scripts(id) ON DELETE SET NULL;
