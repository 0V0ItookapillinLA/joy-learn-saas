-- Create lesson_contents table for teaching content
CREATE TABLE public.lesson_contents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT DEFAULT 'text', -- text, video, document, etc.
  content_url TEXT,
  content_text TEXT,
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create exams table for assessment content
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  exam_type TEXT DEFAULT 'quiz', -- quiz, test, assessment
  questions JSONB DEFAULT '[]'::jsonb,
  passing_score INTEGER DEFAULT 60,
  time_limit_minutes INTEGER DEFAULT 30,
  max_attempts INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.lesson_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- RLS policies for lesson_contents
CREATE POLICY "Anyone can read lesson_contents for dev"
ON public.lesson_contents
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create lesson_contents"
ON public.lesson_contents
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Managers can manage lesson_contents"
ON public.lesson_contents
FOR ALL
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Super admins can manage all lesson_contents"
ON public.lesson_contents
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- RLS policies for exams
CREATE POLICY "Anyone can read exams for dev"
ON public.exams
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create exams"
ON public.exams
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Managers can manage exams"
ON public.exams
FOR ALL
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Super admins can manage all exams"
ON public.exams
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_lesson_contents_updated_at
BEFORE UPDATE ON public.lesson_contents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();