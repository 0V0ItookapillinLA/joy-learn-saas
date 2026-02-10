
-- Create knowledge_bases table (folder/library concept)
CREATE TABLE public.knowledge_bases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  authority_level TEXT DEFAULT '中',
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_bases ENABLE ROW LEVEL SECURITY;

-- RLS policies for organization isolation
CREATE POLICY "Users can view knowledge bases in their org"
  ON public.knowledge_bases FOR SELECT
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create knowledge bases in their org"
  ON public.knowledge_bases FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update knowledge bases in their org"
  ON public.knowledge_bases FOR UPDATE
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can delete knowledge bases in their org"
  ON public.knowledge_bases FOR DELETE
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Add knowledge_base_id to knowledge_documents
ALTER TABLE public.knowledge_documents
  ADD COLUMN knowledge_base_id UUID REFERENCES public.knowledge_bases(id) ON DELETE CASCADE;

-- Trigger for updated_at
CREATE TRIGGER update_knowledge_bases_updated_at
  BEFORE UPDATE ON public.knowledge_bases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
