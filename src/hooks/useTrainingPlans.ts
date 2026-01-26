import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TrainingPlanRow = Database['public']['Tables']['training_plans']['Row'];
type TrainingChapterRow = Database['public']['Tables']['training_chapters']['Row'];

export interface TrainingPlanWithDetails extends TrainingPlanRow {
  training_chapters: TrainingChapterRow[];
}

export function useTrainingPlans() {
  return useQuery({
    queryKey: ['training-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_plans')
        .select(`
          *,
          training_chapters (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrainingPlanWithDetails[];
    },
  });
}

export function useTogglePlanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      // Toggle between 'in_progress' (active) and 'archived' (inactive)
      const newStatus = currentStatus === 'in_progress' ? 'archived' : 'in_progress';
      
      const { error } = await supabase
        .from('training_plans')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      toast.success(`培训计划已${newStatus === 'in_progress' ? '开启' : '停用'}`);
    },
    onError: (error) => {
      toast.error('操作失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First delete chapters
      await supabase
        .from('training_chapters')
        .delete()
        .eq('training_plan_id', id);

      // Then delete the plan
      const { error } = await supabase
        .from('training_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      toast.success('培训计划已删除');
    },
    onError: (error) => {
      toast.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    },
  });
}
