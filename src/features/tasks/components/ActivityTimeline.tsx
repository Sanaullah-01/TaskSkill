'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity, MessageSquare, CheckCircle, Plus, Edit2, Trash2, Paperclip, AlertCircle, Tag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ActivityTimelineProps {
  activities: any[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getIconForAction = (actionType: string) => {
    switch (actionType) {
      case 'task_created':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'task_updated':
        return <Edit2 className="h-4 w-4 text-blue-500" />;
      case 'status_changed':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'priority_changed':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'task_deleted':
        return <Trash2 className="h-4 w-4 text-destructive" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case 'attachment_added':
      case 'attachment_deleted':
        return <Paperclip className="h-4 w-4 text-slate-500" />;
      case 'label_added':
      case 'label_removed':
        return <Tag className="h-4 w-4 text-pink-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <Activity className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No activity recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        Task History
      </h3>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="relative border-l ml-3 pl-4 space-y-6 pb-4">
          {activities.map((activity) => (
            <div key={activity.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[25px] mt-0.5 bg-background p-0.5 border rounded-full">
                {getIconForAction(activity.action_type)}
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={activity.profiles?.avatar_url || ''} />
                      <AvatarFallback className="text-[10px]">{(activity.profiles?.name || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{activity.profiles?.name || 'Unknown User'}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.description}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
                
                {activity.action_type === 'status_changed' && activity.metadata?.status && (
                  <div className="mt-1 bg-muted inline-flex px-2 py-1 rounded text-xs font-medium w-fit capitalize">
                    New status: {activity.metadata.status.replace('_', ' ')}
                  </div>
                )}
                {activity.action_type === 'priority_changed' && activity.metadata?.priority && (
                  <div className="mt-1 bg-muted inline-flex px-2 py-1 rounded text-xs font-medium w-fit capitalize">
                    New priority: {activity.metadata.priority}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
