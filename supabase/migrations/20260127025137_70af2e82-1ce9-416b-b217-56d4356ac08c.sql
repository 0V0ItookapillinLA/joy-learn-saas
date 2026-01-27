-- 添加一个 RLS 策略允许匿名用户读取组织列表（用于开发模式）
-- 同时创建一个安全定义函数用于自动初始化用户的组织和角色

-- 1. 为 organizations 表添加允许匿名读取的策略
CREATE POLICY "Anyone can read organizations for dev"
ON public.organizations
FOR SELECT
USING (true);

-- 2. 为 organizations 表添加允许认证用户创建组织的策略
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. 创建一个安全定义函数用于初始化用户（创建默认组织、profile和角色）
CREATE OR REPLACE FUNCTION public.initialize_user_with_organization(
  _user_id uuid,
  _full_name text DEFAULT NULL,
  _org_name text DEFAULT '我的组织'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
  _profile_org_id uuid;
BEGIN
  -- 检查用户是否已有 profile 和组织
  SELECT organization_id INTO _profile_org_id
  FROM public.profiles
  WHERE user_id = _user_id;
  
  -- 如果已有组织，直接返回
  IF _profile_org_id IS NOT NULL THEN
    RETURN _profile_org_id;
  END IF;
  
  -- 创建新组织
  INSERT INTO public.organizations (name, status, plan_type)
  VALUES (_org_name, 'active', 'basic')
  RETURNING id INTO _org_id;
  
  -- 更新或插入 profile
  INSERT INTO public.profiles (user_id, full_name, organization_id)
  VALUES (_user_id, _full_name, _org_id)
  ON CONFLICT (user_id) DO UPDATE
  SET organization_id = _org_id,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  
  -- 为用户分配 org_admin 角色
  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (_user_id, _org_id, 'org_admin')
  ON CONFLICT DO NOTHING;
  
  RETURN _org_id;
END;
$$;

-- 4. 为 practice_sessions 表添加允许匿名读取的策略（开发模式）
CREATE POLICY "Anyone can read practice_sessions for dev"
ON public.practice_sessions
FOR SELECT
USING (true);

-- 5. 为 practice_sessions 表添加允许认证用户创建的策略
CREATE POLICY "Authenticated users can create practice_sessions"
ON public.practice_sessions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. 为 training_plans 表添加允许匿名读取的策略（开发模式）
CREATE POLICY "Anyone can read training_plans for dev"
ON public.training_plans
FOR SELECT
USING (true);

-- 7. 为 training_plans 表添加允许认证用户创建的策略
CREATE POLICY "Authenticated users can create training_plans"
ON public.training_plans
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 8. 为 training_chapters 表添加允许匿名读取的策略（开发模式）
CREATE POLICY "Anyone can read training_chapters for dev"
ON public.training_chapters
FOR SELECT
USING (true);

-- 9. 为 training_chapters 表添加允许认证用户创建的策略
CREATE POLICY "Authenticated users can create training_chapters"
ON public.training_chapters
FOR INSERT
TO authenticated
WITH CHECK (true);