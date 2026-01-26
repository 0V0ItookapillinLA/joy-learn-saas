-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view profiles in their org" ON public.profiles;

-- Create new restricted policy: users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Create policy for managers/admins to view profiles in their org (for team management)
CREATE POLICY "Managers can view profiles in their org" 
ON public.profiles 
FOR SELECT 
USING (
  (organization_id = get_user_organization_id(auth.uid())) 
  AND (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'org_admin'))
);

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'));