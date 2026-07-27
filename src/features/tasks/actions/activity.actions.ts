'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function logActivity(taskId: string, actionType: string, description: string, metadata: any = null) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('activity_logs')
    .insert({
      task_id: taskId,
      user_id: authData.user.id,
      action_type: actionType,
      description: description,
      metadata: metadata,
    });

  if (error) {
    console.error('Failed to log activity:', error);
    return { error: error.message };
  }

  return { success: true };
}

export async function getTaskActivities(taskId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      profiles:user_id(name, avatar_url)
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function getRecentGlobalActivities(limit: number = 10) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      tasks:task_id(title),
      profiles:user_id(name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}
