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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('请先登录后再创建练习计划');
      }
      
      // 调用初始化函数确保用户有组织
      const { data: orgId, error: initError } = await supabase.rpc('initialize_user_with_organization', {
        _user_id: user.id,
        _full_name: user.user_metadata?.full_name || null,
        _org_name: '我的组织'
      });
      
      if (initError) {
        console.error('Init error:', initError);
        throw new Error('初始化用户组织失败');
      }

      const { data, error } = await supabase
        .from('practice_sessions')
        .insert({
          ...session,
          organization_id: orgId,
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
