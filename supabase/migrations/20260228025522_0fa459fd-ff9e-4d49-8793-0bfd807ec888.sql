
-- Create joyagent_configs table for storing Agent IDs
CREATE TABLE public.joyagent_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add agent_id column to training_plans
ALTER TABLE public.training_plans ADD COLUMN agent_id uuid REFERENCES public.joyagent_configs(id);

-- Enable RLS
ALTER TABLE public.joyagent_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view joyagent configs in their org"
  ON public.joyagent_configs FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Org admins can manage joyagent configs"
  ON public.joyagent_configs FOR ALL
  USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Authenticated users can create joyagent configs"
  ON public.joyagent_configs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND organization_id = get_user_organization_id(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_joyagent_configs_updated_at
  BEFORE UPDATE ON public.joyagent_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
