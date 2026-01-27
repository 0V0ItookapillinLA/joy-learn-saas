import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LessonContent {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  content_type: string | null;
  content_url: string | null;
  content_text: string | null;
  duration_minutes: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useLessonContents() {
  return useQuery({
    queryKey: ['lesson-contents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_contents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LessonContent[];
    },
  });
}

export function useCreateLessonContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lesson: Omit<LessonContent, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) => {
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
        .from('lesson_contents')
        .insert({
          ...lesson,
          organization_id: orgId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-contents'] });
      toast.success('教学内容创建成功');
    },
    onError: (error) => {
      toast.error('创建失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}

export function useDeleteLessonContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lesson_contents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-contents'] });
      toast.success('教学内容已删除');
    },
    onError: (error) => {
      toast.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}
