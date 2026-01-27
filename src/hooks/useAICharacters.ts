import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AICharacterRow = Database['public']['Tables']['ai_characters']['Row'];
type AICharacterInsert = Database['public']['Tables']['ai_characters']['Insert'];
type AICharacterUpdate = Database['public']['Tables']['ai_characters']['Update'];

export function useAICharacters() {
  return useQuery({
    queryKey: ['ai-characters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_characters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AICharacterRow[];
    },
  });
}

export function useActiveAICharacters() {
  return useQuery({
    queryKey: ['ai-characters', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_characters')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AICharacterRow[];
    },
  });
}

export function useCreateAICharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (character: Omit<AICharacterInsert, 'organization_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('请先登录后再创建角色');
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
        .from('ai_characters')
        .insert({
          ...character,
          organization_id: orgId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-characters'] });
      toast.success('角色创建成功');
    },
    onError: (error) => {
      toast.error('创建失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}

export function useUpdateAICharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AICharacterUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('ai_characters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-characters'] });
      toast.success('角色已更新');
    },
    onError: (error) => {
      toast.error('更新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}

export function useDeleteAICharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_characters')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-characters'] });
      toast.success('角色已删除');
    },
    onError: (error) => {
      toast.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}
