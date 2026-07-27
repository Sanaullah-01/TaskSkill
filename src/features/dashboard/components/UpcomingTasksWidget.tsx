import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export async function UpcomingTasksWidget() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return null;

  const today = new Date().toISOString();
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, due_date')
    .eq('user_id', authData.user.id)
    .gte('due_date', today)
    .neq('status', 'completed')
    .neq('status', 'archived')
    .order('due_date', { ascending: true })
    .limit(5);

  return (
    <Card className="col-span-1 lg:col-span-3 flex flex-col">
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <CardDescription>Your pending tasks with approaching due dates.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {!tasks || tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No upcoming deadlines.
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start group">
                <Calendar className="h-5 w-5 text-muted-foreground mr-4 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col flex-1 gap-1 min-w-0">
                  <Link href={`/tasks/${task.id}`} className="text-sm font-medium leading-none truncate group-hover:underline">
                    {task.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    Due {task.due_date ? format(new Date(task.due_date), 'PPP') : 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
