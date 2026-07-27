'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from './activity.actions';

export async function addAttachmentMetadata(
  taskId: string, 
  fileName: string, 
  filePath: string, 
  sizeBytes: number, 
  contentType: string
) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('attachments')
    .insert({
      task_id: taskId,
      user_id: authData.user.id,
      file_name: fileName,
      file_path: filePath,
      size_bytes: sizeBytes,
      content_type: contentType,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await logActivity(taskId, 'attachment_added', `Attached file: ${fileName}`);

  revalidatePath(`/tasks/${taskId}`);
  return { success: true, data };
}

export async function getTaskAttachments(taskId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attachments')
    .select(`
      *,
      profiles:user_id(name, avatar_url)
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  // Get signed URLs for each attachment to download
  const attachmentsWithUrls = await Promise.all(
    (data || []).map(async (attachment) => {
      const { data: urlData } = await supabase.storage
        .from('task_attachments')
        .createSignedUrl(attachment.file_path, 60 * 60); // 1 hour expiry
        
      return {
        ...attachment,
        signedUrl: urlData?.signedUrl || null,
      };
    })
  );

  return { data: attachmentsWithUrls, error: null };
}

export async function deleteAttachment(attachmentId: string, taskId: string, filePath: string) {
  const supabase = await createClient();
  
  // 1. Delete from storage
  const { error: storageError } = await supabase.storage
    .from('task_attachments')
    .remove([filePath]);

  if (storageError) {
    return { error: 'Failed to delete file from storage' };
  }

  // 2. Delete metadata
  const { error: dbError } = await supabase
    .from('attachments')
    .delete()
    .eq('id', attachmentId);

  if (dbError) {
    return { error: dbError.message };
  }

  await logActivity(taskId, 'attachment_deleted', `Deleted an attachment`);

  revalidatePath(`/tasks/${taskId}`);
  return { success: true };
}
