-- Add content_items column to training_chapters to store detailed item configurations
ALTER TABLE public.training_chapters
ADD COLUMN IF NOT EXISTS content_items jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.training_chapters.content_items IS 'JSON array of content items (lessons, practices, assessments) with their configurations';