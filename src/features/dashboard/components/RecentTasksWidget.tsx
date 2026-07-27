import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export async function RecentTasksWidget() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return null;

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, priority, updated_at')
    .eq('user_id', authData.user.id)
    .order('updated_at', { ascending: false })
    .limit(5);

  return (
    <Card className="col-span-1 lg:col-span-4 flex flex-col">
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
        <CardDescription>Your most recently updated tasks.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {!tasks || tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No recent tasks found.
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center group">
                {task.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-primary mr-4 flex-shrink-0" />
                ) : task.status === 'in_progress' ? (
                  <Clock className="h-5 w-5 text-amber-500 mr-4 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mr-4 flex-shrink-0" />
                )}
                <div className="flex flex-col flex-1 gap-1 min-w-0">
                  <Link href={`/tasks/${task.id}`} className="text-sm font-medium leading-none truncate group-hover:underline">
                    {task.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <Badge 
                    variant={task.priority === 'urgent' || task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
