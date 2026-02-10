
-- Create ai_courseware table
CREATE TABLE public.ai_courseware (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  title text NOT NULL,
  description text,
  source_documents jsonb DEFAULT '[]'::jsonb,
  outline jsonb DEFAULT '[]'::jsonb,
  scripts jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  character_id uuid REFERENCES public.ai_characters(id),
  video_urls jsonb DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_courseware ENABLE ROW LEVEL SECURITY;

-- Users in same org can read
CREATE POLICY "Users can view courseware in their org"
ON public.ai_courseware
FOR SELECT
USING (
  organization_id = get_user_organization_id(auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Org admins can manage
CREATE POLICY "Org admins can manage courseware"
ON public.ai_courseware
FOR ALL
USING (is_org_admin(auth.uid(), organization_id));

-- Authenticated users can insert in their org
CREATE POLICY "Authenticated users can create courseware"
ON public.ai_courseware
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND organization_id = get_user_organization_id(auth.uid())
);

-- Trigger for updated_at
CREATE TRIGGER update_ai_courseware_updated_at
BEFORE UPDATE ON public.ai_courseware
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
