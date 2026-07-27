'use client';

import * as React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash, Archive, ArrowRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskSheet } from './TaskSheet';
import { deleteTaskAction, archiveTaskAction } from '../actions/task.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
}

export function TaskListTable({ tasks }: { tasks: Task[] }) {
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const result = await deleteTaskAction(id);
      if (result.error) toast.error(result.error);
      else toast.success('Task deleted successfully');
    }
  };

  const handleArchive = async (id: string) => {
    const result = await archiveTaskAction(id);
    if (result.error) toast.error(result.error);
    else toast.success('Task archived successfully');
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="hidden md:table-cell">Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No tasks found.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  <Link href={`/tasks/${task.id}`} className="hover:underline flex items-center">
                    {task.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={task.status === 'completed' ? 'secondary' : 'default'} className="capitalize">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={task.priority === 'urgent' || task.priority === 'high' ? 'destructive' : 'outline'} 
                    className="capitalize"
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No due date'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-md hover:bg-muted inline-flex items-center justify-center outline-none">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)} className="cursor-pointer">
                        <ArrowRight className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setEditingTask(task)} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Edit Task
                      </DropdownMenuItem>
                      {task.status !== 'archived' && (
                        <DropdownMenuItem onClick={() => handleArchive(task.id)} className="cursor-pointer">
                          <Archive className="mr-2 h-4 w-4" /> Archive Task
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TaskSheet 
        open={!!editingTask} 
        onOpenChange={(open) => !open && setEditingTask(null)}
        initialData={editingTask}
      />
    </>
  );
}
