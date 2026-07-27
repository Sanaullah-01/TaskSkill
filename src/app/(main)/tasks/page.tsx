import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TaskListTable } from '@/features/tasks/components/TaskListTable';
import { TaskFilters } from '@/features/tasks/components/TaskFilters';
import { QuickAddButton } from '@/features/dashboard/components/QuickAddButton';
import { format } from 'date-fns';

export default async function TasksPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect('/login');
  }

  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : null;
  const priorityFilter = typeof searchParams.priority === 'string' ? searchParams.priority : null;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : null;

  let query = supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq('user_id', authData.user.id);

  if (statusFilter) query = query.eq('status', statusFilter as any);
  if (priorityFilter) query = query.eq('priority', priorityFilter as any);
  if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data: tasks, count } = await query;

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
      </div>

      <TaskFilters />

      <div className="rounded-md border bg-card">
        <TaskListTable tasks={tasks || []} />
      </div>

      {count !== null && count > limit && (
        <div className="flex justify-end pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {from + 1}-{Math.min(to + 1, count)} of {count} tasks
          </p>
        </div>
      )}

      <QuickAddButton />
    </div>
  );
}
