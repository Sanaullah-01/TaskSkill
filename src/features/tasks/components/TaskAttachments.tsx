'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { addAttachmentMetadata, deleteAttachment } from '../actions/attachments.actions';
import { formatDistanceToNow } from 'date-fns';
import { Paperclip, Loader2, X, FileIcon, Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TaskAttachmentsProps {
  taskId: string;
  currentUserId: string;
  attachments: any[];
}

export function TaskAttachments({ taskId, currentUserId, attachments }: TaskAttachmentsProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const supabase = createClient();

    try {
      // 1. Upload to storage
      // Path format: user_id/task_id/timestamp_filename
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${currentUserId}/${taskId}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task_attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // 2. Insert metadata via Server Action
      const result = await addAttachmentMetadata(
        taskId,
        file.name,
        filePath,
        file.size,
        file.type || 'application/octet-stream'
      );

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Attachment uploaded');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (attachmentId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    setDeletingId(attachmentId);
    try {
      const result = await deleteAttachment(attachmentId, taskId, filePath);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Attachment deleted');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          Attachments ({attachments.length})
        </h3>
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Paperclip className="mr-2 h-3 w-3" />}
            {isUploading ? 'Uploading...' : 'Add file'}
          </Button>
        </div>
      </div>

      {attachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-24 text-center border border-dashed rounded-md bg-muted/20">
          <p className="text-sm text-muted-foreground">No attachments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-md group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-primary/10 p-2 rounded-md">
                  <FileIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium truncate" title={attachment.file_name}>
                    {attachment.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(attachment.size_bytes)} • uploaded {formatDistanceToNow(new Date(attachment.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {attachment.signedUrl && (
                  <a href={attachment.signedUrl} target="_blank" rel="noopener noreferrer" download className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-muted-foreground">
                    <Download className="h-4 w-4" />
                  </a>
                )}
                {attachment.user_id === currentUserId && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(attachment.id, attachment.file_path)}
                    disabled={deletingId === attachment.id}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    {deletingId === attachment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
