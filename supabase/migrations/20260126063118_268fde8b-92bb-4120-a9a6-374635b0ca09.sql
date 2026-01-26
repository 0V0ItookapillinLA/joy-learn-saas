-- =============================================
-- JoyLearning SaaS 多租户数据库架构
-- =============================================

-- 1. 创建角色枚举
CREATE TYPE public.app_role AS ENUM ('super_admin', 'org_admin', 'manager', 'trainee');

-- 2. 创建租户状态枚举
CREATE TYPE public.org_status AS ENUM ('active', 'inactive', 'suspended');

-- 3. 创建培训计划状态枚举
CREATE TYPE public.training_status AS ENUM ('draft', 'pending', 'in_progress', 'completed', 'archived');

-- 4. 创建学员培训状态枚举
CREATE TYPE public.trainee_progress_status AS ENUM ('not_started', 'in_progress', 'completed');

-- =============================================
-- 核心表：企业租户
-- =============================================
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3B82F6',
    status public.org_status DEFAULT 'active',
    plan_type TEXT DEFAULT 'basic',
    max_trainees INTEGER DEFAULT 50,
    max_storage_mb INTEGER DEFAULT 1024,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 核心表：部门（支持树形结构）
-- =============================================
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 核心表：用户档案
-- =============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    job_title TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 核心表：用户角色（独立表防止权限提升攻击）
-- =============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'trainee',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, organization_id, role)
);

-- =============================================
-- 核心表：培训计划
-- =============================================
CREATE TABLE public.training_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    objectives TEXT,
    cover_image_url TEXT,
    status public.training_status DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 核心表：培训章节
-- =============================================
CREATE TABLE public.training_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_plan_id UUID REFERENCES public.training_plans(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    chapter_type TEXT DEFAULT 'lesson', -- lesson, practice, assessment
    sort_order INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 核心表：练习场景
-- =============================================
CREATE TABLE public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES public.training_chapters(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    scenario_description TEXT,
    practice_mode TEXT DEFAULT 'free_dialogue', -- free_dialogue, scripted
    trainee_role TEXT,
    ai_role TEXT,
    scoring_criteria JSONB DEFAULT '{}',
    max_attempts INTEGER DEFAULT 3,
    time_limit_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 核心表：AI角色配置
-- =============================================
CREATE TABLE public.ai_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    personality TEXT,
    voice_style TEXT,
    system_prompt TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 核心表：学员培训进度
-- =============================================
CREATE TABLE public.training_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    training_plan_id UUID REFERENCES public.training_plans(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES public.training_chapters(id) ON DELETE CASCADE,
    status public.trainee_progress_status DEFAULT 'not_started',
    progress_percentage INTEGER DEFAULT 0,
    score DECIMAL(5,2),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, training_plan_id, chapter_id)
);

-- =============================================
-- 核心表：岗位能力模型
-- =============================================
CREATE TABLE public.skill_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    job_title TEXT,
    skills JSONB DEFAULT '[]', -- [{name, weight, max_score, category}]
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 核心表：学员能力评分
-- =============================================
CREATE TABLE public.trainee_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    skill_model_id UUID REFERENCES public.skill_models(id) ON DELETE CASCADE NOT NULL,
    skill_name TEXT NOT NULL,
    current_score DECIMAL(5,2) DEFAULT 0,
    target_score DECIMAL(5,2) DEFAULT 100,
    last_updated TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, skill_model_id, skill_name)
);

-- =============================================
-- 核心表：培训计划-部门关联
-- =============================================
CREATE TABLE public.training_plan_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_plan_id UUID REFERENCES public.training_plans(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (training_plan_id, department_id)
);

-- =============================================
-- 启用 RLS
-- =============================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plan_departments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 安全函数：检查用户角色
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- =============================================
-- 安全函数：获取用户组织ID
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id
    FROM public.profiles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- =============================================
-- 安全函数：检查是否为组织管理员
-- =============================================
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND organization_id = _org_id
          AND role IN ('org_admin', 'super_admin')
    )
$$;

-- =============================================
-- RLS 策略：organizations
-- =============================================
CREATE POLICY "Users can view their organization"
ON public.organizations FOR SELECT
TO authenticated
USING (id = public.get_user_organization_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Org admins can update their organization"
ON public.organizations FOR UPDATE
TO authenticated
USING (public.is_org_admin(auth.uid(), id));

CREATE POLICY "Super admins can manage all organizations"
ON public.organizations FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- RLS 策略：departments
-- =============================================
CREATE POLICY "Users can view departments in their org"
ON public.departments FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Org admins can manage departments"
ON public.departments FOR ALL
TO authenticated
USING (public.is_org_admin(auth.uid(), organization_id));

-- =============================================
-- RLS 策略：profiles
-- =============================================
CREATE POLICY "Users can view profiles in their org"
ON public.profiles FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id(auth.uid()) 
    OR user_id = auth.uid() 
    OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- =============================================
-- RLS 策略：user_roles
-- =============================================
CREATE POLICY "Users can view roles in their org"
ON public.user_roles FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id(auth.uid()) 
    OR user_id = auth.uid()
    OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Org admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_org_admin(auth.uid(), organization_id));

-- =============================================
-- RLS 策略：training_plans
-- =============================================
CREATE POLICY "Users can view training plans in their org"
ON public.training_plans FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers can manage training plans"
ON public.training_plans FOR ALL
TO authenticated
USING (
    public.is_org_admin(auth.uid(), organization_id)
    OR (
        organization_id = public.get_user_organization_id(auth.uid())
        AND (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'org_admin'))
    )
);

-- =============================================
-- RLS 策略：training_chapters
-- =============================================
CREATE POLICY "Users can view chapters of accessible plans"
ON public.training_chapters FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.training_plans tp
        WHERE tp.id = training_plan_id
        AND (tp.organization_id = public.get_user_organization_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
    )
);

CREATE POLICY "Managers can manage chapters"
ON public.training_chapters FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.training_plans tp
        WHERE tp.id = training_plan_id
        AND public.is_org_admin(auth.uid(), tp.organization_id)
    )
);

-- =============================================
-- RLS 策略：practice_sessions
-- =============================================
CREATE POLICY "Users can view practice sessions in their org"
ON public.practice_sessions FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers can manage practice sessions"
ON public.practice_sessions FOR ALL
TO authenticated
USING (public.is_org_admin(auth.uid(), organization_id));

-- =============================================
-- RLS 策略：ai_characters
-- =============================================
CREATE POLICY "Users can view AI characters in their org"
ON public.ai_characters FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Org admins can manage AI characters"
ON public.ai_characters FOR ALL
TO authenticated
USING (public.is_org_admin(auth.uid(), organization_id));

-- =============================================
-- RLS 策略：training_progress
-- =============================================
CREATE POLICY "Users can view their own progress"
ON public.training_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Managers can view progress in their org"
ON public.training_progress FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = training_progress.user_id
        AND p.organization_id = public.get_user_organization_id(auth.uid())
    )
    AND (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'org_admin'))
);

CREATE POLICY "Users can manage their own progress"
ON public.training_progress FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- RLS 策略：skill_models
-- =============================================
CREATE POLICY "Users can view skill models in their org"
ON public.skill_models FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Org admins can manage skill models"
ON public.skill_models FOR ALL
TO authenticated
USING (public.is_org_admin(auth.uid(), organization_id));

-- =============================================
-- RLS 策略：trainee_skills
-- =============================================
CREATE POLICY "Users can view their own skills"
ON public.trainee_skills FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Managers can view skills in their org"
ON public.trainee_skills FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = trainee_skills.user_id
        AND p.organization_id = public.get_user_organization_id(auth.uid())
    )
    AND (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'org_admin'))
);

CREATE POLICY "Users can manage their own skills"
ON public.trainee_skills FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- RLS 策略：training_plan_departments
-- =============================================
CREATE POLICY "Users can view plan departments in their org"
ON public.training_plan_departments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.training_plans tp
        WHERE tp.id = training_plan_id
        AND tp.organization_id = public.get_user_organization_id(auth.uid())
    )
);

CREATE POLICY "Managers can manage plan departments"
ON public.training_plan_departments FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.training_plans tp
        WHERE tp.id = training_plan_id
        AND public.is_org_admin(auth.uid(), tp.organization_id)
    )
);

-- =============================================
-- 自动更新 updated_at 触发器
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON public.departments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at
    BEFORE UPDATE ON public.training_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_chapters_updated_at
    BEFORE UPDATE ON public.training_chapters
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_practice_sessions_updated_at
    BEFORE UPDATE ON public.practice_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_characters_updated_at
    BEFORE UPDATE ON public.ai_characters
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_progress_updated_at
    BEFORE UPDATE ON public.training_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skill_models_updated_at
    BEFORE UPDATE ON public.skill_models
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 创建索引优化查询性能
-- =============================================
CREATE INDEX idx_departments_org ON public.departments(organization_id);
CREATE INDEX idx_departments_parent ON public.departments(parent_id);
CREATE INDEX idx_profiles_org ON public.profiles(organization_id);
CREATE INDEX idx_profiles_user ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_org ON public.user_roles(organization_id);
CREATE INDEX idx_training_plans_org ON public.training_plans(organization_id);
CREATE INDEX idx_training_plans_status ON public.training_plans(status);
CREATE INDEX idx_training_chapters_plan ON public.training_chapters(training_plan_id);
CREATE INDEX idx_practice_sessions_org ON public.practice_sessions(organization_id);
CREATE INDEX idx_training_progress_user ON public.training_progress(user_id);
CREATE INDEX idx_training_progress_plan ON public.training_progress(training_plan_id);
CREATE INDEX idx_trainee_skills_user ON public.trainee_skills(user_id);