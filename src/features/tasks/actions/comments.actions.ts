'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from './activity.actions';

export async function addComment(taskId: string, content: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return { error: 'Unauthorized' };

  if (!content.trim()) return { error: 'Comment cannot be empty' };

  const { data, error } = await supabase
    .from('comments')
    .insert({
      task_id: taskId,
      user_id: authData.user.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Log activity
  await logActivity(taskId, 'comment_added', 'Added a comment to the task');

  revalidatePath(`/tasks/${taskId}`);
  return { success: true, data };
}

export async function getTaskComments(taskId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id(name, avatar_url)
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function deleteComment(commentId: string, taskId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/tasks/${taskId}`);
  return { success: true };
}
