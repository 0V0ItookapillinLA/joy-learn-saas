import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DialogTurnKeyPoint {
  id: string;
  content: string;
  required: boolean;
}

export interface DialogTurn {
  id: string;
  speaker: 'companion' | 'trainee';
  content: string;
  standard_answer: string;
  key_points: DialogTurnKeyPoint[];
  analysis: string;
  flow_condition: { type: string; min_points: number };
  max_attempts: number;
  sort_order: number;
}

export interface DialogScript {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  knowledge_base_id: string | null;
  knowledge_doc_ids: string[];
  assessment_model: any[];
  character_id: string | null;
  voice_style: string | null;
  dialog_turns: DialogTurn[];
  mode: string;
  practice_config: any;
  exam_config: any;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useDialogScripts() {
  return useQuery({
    queryKey: ['dialog-scripts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dialog_scripts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as DialogScript[];
    },
  });
}

export function useCreateDialogScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (script: Omit<DialogScript, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('dialog_scripts')
        .insert(script as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dialog-scripts'] });
      toast.success('对话剧本创建成功');
    },
    onError: (error) => {
      toast.error('创建失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}

export function useUpdateDialogScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<DialogScript>) => {
      const { data, error } = await supabase
        .from('dialog_scripts')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dialog-scripts'] });
      toast.success('剧本已更新');
    },
    onError: (error) => {
      toast.error('更新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}

export function useDeleteDialogScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dialog_scripts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dialog-scripts'] });
      toast.success('剧本已删除');
    },
    onError: (error) => {
      toast.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}
