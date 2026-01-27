import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Exam {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  exam_type: string | null;
  questions: Json;
  passing_score: number | null;
  time_limit_minutes: number | null;
  max_attempts: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useExams() {
  return useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Exam[];
    },
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exam: Omit<Exam, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('请先登录');
      }
      
      const { data: orgId, error: initError } = await supabase.rpc('initialize_user_with_organization', {
        _user_id: user.id,
        _full_name: user.user_metadata?.full_name || null,
        _org_name: '我的组织'
      });
      
      if (initError) {
        throw new Error('初始化用户组织失败');
      }

      const { data, error } = await supabase
        .from('exams')
        .insert({
          ...exam,
          organization_id: orgId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('考评创建成功');
    },
    onError: (error) => {
      toast.error('创建失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('考评已删除');
    },
    onError: (error) => {
      toast.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}
