import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type PracticeSessionRow = Database['public']['Tables']['practice_sessions']['Row'];
type PracticeSessionInsert = Database['public']['Tables']['practice_sessions']['Insert'];

export interface PracticeSessionWithDetails extends PracticeSessionRow {
  // Add any joined data here if needed
}

export function usePracticeSessions() {
  return useQuery({
    queryKey: ['practice-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PracticeSessionWithDetails[];
    },
  });
}

export function useCreatePracticeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: Omit<PracticeSessionInsert, 'organization_id'>) => {
      // 开发模式：尝试获取用户和组织信息，自动关联到第一个可用组织
      const { data: { user } } = await supabase.auth.getUser();
      let organizationId: string | null = null;
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle();
        organizationId = profile?.organization_id || null;
      }

      // 如果没有组织ID，查询第一个可用的组织（使用maybeSingle避免报错）
      if (!organizationId) {
        const { data: orgs } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
          .maybeSingle();
        organizationId = orgs?.id || null;
      }

      // 如果仍然没有组织，自动创建一个默认组织
      if (!organizationId) {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({ name: '默认开发组织', status: 'active', plan_type: 'basic' })
          .select()
          .single();
        
        if (orgError) throw new Error('创建默认组织失败');
        organizationId = newOrg.id;
      }

      const { data, error } = await supabase
        .from('practice_sessions')
        .insert({
          ...session,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-sessions'] });
      toast.success('练习计划创建成功');
    },
    onError: (error) => {
      toast.error('创建失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}

export function useDeletePracticeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('practice_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-sessions'] });
      toast.success('练习计划已删除');
    },
    onError: (error) => {
      toast.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}
