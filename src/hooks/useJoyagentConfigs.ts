import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JoyagentConfig {
  id: string;
  organization_id: string;
  agent_id: string;
  agent_name: string;
  description: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useJoyagentConfigs() {
  return useQuery({
    queryKey: ['joyagent-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('joyagent_configs' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as JoyagentConfig[];
    },
  });
}

export function useCreateJoyagentConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { agent_id: string; agent_name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { data: orgId, error: initError } = await supabase.rpc('initialize_user_with_organization', {
        _user_id: user.id,
        _full_name: user.user_metadata?.full_name || null,
        _org_name: '我的组织',
      });
      if (initError) throw initError;

      const { data, error } = await supabase
        .from('joyagent_configs' as any)
        .insert({ ...config, organization_id: orgId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['joyagent-configs'] });
      toast.success('Agent配置已添加');
    },
    onError: (error) => {
      toast.error('添加失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}
