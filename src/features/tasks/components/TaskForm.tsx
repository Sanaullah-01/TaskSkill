'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, type CreateTaskInput, type TaskStatus, type TaskPriority } from '../schemas/task.schema';
import { createTaskAction, updateTaskAction } from '../actions/task.actions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TaskFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function TaskForm({ initialData, onSuccess }: TaskFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const isEditing = !!initialData;

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      status: (initialData?.status as TaskStatus) || 'todo',
      priority: (initialData?.priority as TaskPriority) || 'medium',
      due_date: initialData?.due_date ? new Date(initialData.due_date).toISOString().slice(0, 16) : '',
    },
  });

  function onSubmit(values: CreateTaskInput) {
    startTransition(async () => {
      let result;
      if (isEditing) {
        result = await updateTaskAction({ id: initialData.id, ...values });
      } else {
        result = await createTaskAction(values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isEditing ? 'Task updated successfully' : 'Task created successfully');
        form.reset();
        onSuccess?.();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        <FormField
          control={form.control as any}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control as any}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add details about this task..." 
                  className="resize-none" 
                  {...field} 
                  disabled={isPending}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control as any}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    disabled={isPending}
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    disabled={isPending}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control as any}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                  disabled={isPending}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => onSuccess?.()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
