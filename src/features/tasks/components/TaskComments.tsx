'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { addComment, deleteComment } from '../actions/comments.actions';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Loader2, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskCommentsProps {
  taskId: string;
  currentUserId: string;
  comments: any[];
}

export function TaskComments({ taskId, currentUserId, comments }: TaskCommentsProps) {
  const [content, setContent] = React.useState('');
  const [isPending, startTransition] = React.useTransition();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      const result = await addComment(taskId, content);
      if (result.error) {
        toast.error(result.error);
      } else {
        setContent('');
        toast.success('Comment added');
      }
    });
  };

  const handleDelete = (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    setDeletingId(commentId);
    startTransition(async () => {
      const result = await deleteComment(commentId, taskId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Comment deleted');
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        Comments ({comments.length})
      </h3>
      
      <ScrollArea className="h-[300px] pr-4">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center border border-dashed rounded-md bg-muted/20">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url || ''} alt={comment.profiles?.name || 'User'} />
                  <AvatarFallback>{(comment.profiles?.name || 'U').charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {comment.profiles?.name || 'Unknown User'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                      {comment.user_id === currentUserId && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id}
                        >
                          {deletingId === comment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap pt-1 bg-muted/50 p-3 rounded-md rounded-tl-none">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 relative">
        <Textarea
          placeholder="Leave a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px] resize-none pr-24"
        />
        <div className="absolute bottom-2 right-2">
          <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Comment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
