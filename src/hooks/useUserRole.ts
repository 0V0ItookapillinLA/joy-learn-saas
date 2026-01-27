import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'super_admin' | 'org_admin' | 'manager' | 'trainee';

interface UserRoleData {
  role: AppRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  isManager: boolean;
  loading: boolean;
  organizationId: string | null;
}

export function useUserRole(): UserRoleData {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setOrganizationId(null);
        setLoading(false);
        return;
      }

      try {
        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role, organization_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleData) {
          setRole(roleData.role as AppRole);
          setOrganizationId(roleData.organization_id);
        }

        // Also get organization from profile if role doesn't have it
        if (!roleData?.organization_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (profileData?.organization_id) {
            setOrganizationId(profileData.organization_id);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return {
    role,
    isAdmin: role === 'super_admin' || role === 'org_admin',
    isSuperAdmin: role === 'super_admin',
    isOrgAdmin: role === 'org_admin',
    isManager: role === 'manager' || role === 'org_admin' || role === 'super_admin',
    loading,
    organizationId,
  };
}
