'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from './activity.actions';

export async function createLabel(name: string, color: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return { error: 'Unauthorized' };

  if (!name.trim()) return { error: 'Label name is required' };

  const { data, error } = await supabase
    .from('labels')
    .insert({
      user_id: authData.user.id,
      name: name.trim(),
      color: color,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Not revalidating here since this might be called in a modal. The caller can refresh.
  return { success: true, data };
}

export async function getLabels() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function toggleTaskLabel(taskId: string, labelId: string, isApplying: boolean) {
  const supabase = await createClient();
  
  if (isApplying) {
    const { error } = await supabase
      .from('task_labels')
      .insert({ task_id: taskId, label_id: labelId });
      
    if (error) return { error: error.message };
    await logActivity(taskId, 'label_added', 'Added a label to the task');
  } else {
    const { error } = await supabase
      .from('task_labels')
      .delete()
      .match({ task_id: taskId, label_id: labelId });
      
    if (error) return { error: error.message };
    await logActivity(taskId, 'label_removed', 'Removed a label from the task');
  }

  revalidatePath(`/tasks`);
  revalidatePath(`/tasks/${taskId}`);
  return { success: true };
}
