'use client';

import * as React from 'react';
import { X, CalendarBlank, Tag, Archive } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '@/redux/hooks';
import { updateTaskDb, optimisticUpdateTask, deleteTaskDb, Task } from '@/redux/slices/tasksSlice';
import { Trash } from '@phosphor-icons/react';

interface TaskDetailPaneProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailPane({ task, onClose }: TaskDetailPaneProps) {
  const dispatch = useAppDispatch();

  if (!task) return null;

  const handleArchive = () => {
    dispatch(optimisticUpdateTask({ id: task.id, updates: { status: 'archived' } }));
    dispatch(updateTaskDb({ id: task.id, updates: { status: 'archived' } }));
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this task?')) {
      dispatch(deleteTaskDb(task.id));
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-80 border-l bg-background flex flex-col shrink-0 h-full overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {task.id}
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight mb-3">{task.title}</h2>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                task.status === 'completed' ? 'bg-emerald-500' :
                task.status === 'in_progress' ? 'bg-amber-500' : 
                task.status === 'archived' ? 'bg-zinc-500' : 'bg-blue-500'
              }`} />
              <span className="capitalize">{task.status.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarBlank className="h-4 w-4" />
              <span>
                {task.due_date 
                  ? new Date(task.due_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) 
                  : 'No due date'}
              </span>
            </div>
            {task.priority && (
              <div className="flex items-center gap-2">
                <Tag className={`h-4 w-4 ${
                  task.priority === 'urgent' ? 'text-red-600' : 
                  task.priority === 'high' ? 'text-orange-500' : 
                  task.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'
                }`} />
                <span className="capitalize">{task.priority} Priority</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/70">Description</h3>
          <div className="text-sm text-foreground leading-relaxed bg-secondary/30 p-3 rounded-lg min-h-[100px] border border-transparent hover:border-border transition-colors cursor-text">
            {task.description || 'Add a description...'}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/70">Activity</h3>
          <div className="text-xs text-muted-foreground text-center p-6 border border-dashed rounded-lg">
            Activity timeline coming soon.
          </div>
        </div>
      </div>

      <div className="p-4 border-t bg-secondary/10 shrink-0 flex gap-2">
        <button
          onClick={handleArchive}
          disabled={task.status === 'archived'}
          className="flex-1 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
        >
          <Archive className="h-4 w-4" />
          {task.status === 'archived' ? 'Archived' : 'Archive'}
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-secondary text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none"
          title="Permanently Delete"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
