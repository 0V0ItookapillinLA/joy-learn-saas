
-- Create knowledge_documents table
CREATE TABLE public.knowledge_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  title text NOT NULL,
  description text,
  file_url text,
  file_name text,
  file_type text,
  file_size integer,
  ai_summary text,
  ai_key_points jsonb DEFAULT '[]'::jsonb,
  category text DEFAULT 'general',
  tags jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Users in same org can read
CREATE POLICY "Users can view knowledge docs in their org"
ON public.knowledge_documents
FOR SELECT
USING (
  organization_id = get_user_organization_id(auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Org admins can manage
CREATE POLICY "Org admins can manage knowledge docs"
ON public.knowledge_documents
FOR ALL
USING (is_org_admin(auth.uid(), organization_id));

-- Authenticated users can insert in their org
CREATE POLICY "Authenticated users can create knowledge docs"
ON public.knowledge_documents
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND organization_id = get_user_organization_id(auth.uid())
);

-- Trigger for updated_at
CREATE TRIGGER update_knowledge_documents_updated_at
BEFORE UPDATE ON public.knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
