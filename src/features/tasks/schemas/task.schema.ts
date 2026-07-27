import { z } from 'zod';

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'completed', 'archived']);
export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional().nullable(),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  due_date: z.string().datetime().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
});

export const updateTaskSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
  title: z.string().min(1, 'Title is required').max(255).optional(),
  description: z.string().optional().nullable(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  due_date: z.string().datetime().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
