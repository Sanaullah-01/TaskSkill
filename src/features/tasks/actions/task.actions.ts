'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  type CreateTaskInput, 
  type UpdateTaskInput 
} from '../schemas/task.schema';
import { z } from 'zod';
import { logActivity } from './activity.actions';

export async function createTaskAction(data: CreateTaskInput) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return { error: 'Unauthorized' };
    }

    const validatedData = createTaskSchema.parse(data);

    const { data: newTask, error } = await supabase.from('tasks').insert({
      ...validatedData,
      user_id: authData.user.id,
    }).select().single();

    if (error) {
      console.error('Create task error:', error);
      return { error: 'Failed to create task' };
    }

    if (newTask) {
      await logActivity(newTask.id, 'task_created', `Created task: ${newTask.title}`);
    }

    revalidatePath('/dashboard');
    revalidatePath('/tasks');
    return { success: true, data: newTask };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid task data provided' };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateTaskAction(data: UpdateTaskInput) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return { error: 'Unauthorized' };
    }

    const validatedData = updateTaskSchema.parse(data);
    const { id, ...updateFields } = validatedData;

    const { error } = await supabase
      .from('tasks')
      .update(updateFields)
      .eq('id', id)
      .eq('user_id', authData.user.id);

    if (error) {
      console.error('Update task error:', error);
      return { error: 'Failed to update task' };
    }

    // Determine what changed for the log
    let logMsg = 'Updated the task details';
    let actionType = 'task_updated';
    if (updateFields.status) {
      logMsg = `Changed status to ${updateFields.status.replace('_', ' ')}`;
      actionType = 'status_changed';
    } else if (updateFields.priority) {
      logMsg = `Changed priority to ${updateFields.priority}`;
      actionType = 'priority_changed';
    }

    await logActivity(id, actionType, logMsg, updateFields);

    revalidatePath('/dashboard');
    revalidatePath('/tasks');
    revalidatePath(`/tasks/${id}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid task data provided' };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', authData.user.id);

    if (error) {
      console.error('Delete task error:', error);
      return { error: 'Failed to delete task' };
    }

    await logActivity(id, 'task_deleted', 'Deleted the task');

    revalidatePath('/dashboard');
    revalidatePath('/tasks');
    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred' };
  }
}

export async function archiveTaskAction(id: string) {
  return updateTaskAction({ id, status: 'archived' });
}
