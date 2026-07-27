import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { TaskComments } from '@/features/tasks/components/TaskComments';
import { TaskAttachments } from '@/features/tasks/components/TaskAttachments';
import { ActivityTimeline } from '@/features/tasks/components/ActivityTimeline';
import { getTaskComments } from '@/features/tasks/actions/comments.actions';
import { getTaskAttachments } from '@/features/tasks/actions/attachments.actions';
import { getTaskActivities } from '@/features/tasks/actions/activity.actions';

export default async function TaskDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect('/login');
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', authData.user.id)
    .single();

  if (error || !task) {
    notFound();
  }

  // Fetch MS7 Data in parallel
  const [
    { data: comments },
    { data: attachments },
    { data: activities }
  ] = await Promise.all([
    getTaskComments(params.id),
    getTaskAttachments(params.id),
    getTaskActivities(params.id),
  ]);

  // Format dates strictly checking for null
  const createdDate = format(new Date(task.created_at), 'PPP pp');
  const updatedDate = format(new Date(task.updated_at), 'PPP pp');
  const dueDate = task.due_date ? format(new Date(task.due_date), 'PPP pp') : 'No due date';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/tasks" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tasks
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{task.title}</h1>
          <div className="flex items-center gap-3">
            <Badge variant={task.status === 'completed' ? 'secondary' : 'default'} className="capitalize">
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge variant={task.priority === 'urgent' || task.priority === 'high' ? 'destructive' : 'outline'} className="capitalize">
              {task.priority} Priority
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {task.description || 'No description provided.'}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" /> Due Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{dueDate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" /> Created At
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{createdDate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <AlertCircle className="mr-2 h-4 w-4" /> Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{updatedDate}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <TaskAttachments 
                taskId={task.id} 
                currentUserId={authData.user.id} 
                attachments={attachments || []} 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <TaskComments 
                taskId={task.id} 
                currentUserId={authData.user.id} 
                comments={comments || []} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="pt-6">
              <ActivityTimeline activities={activities || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
