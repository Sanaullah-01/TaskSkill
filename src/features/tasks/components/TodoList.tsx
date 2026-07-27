'use client';

import * as React from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateTaskDb, optimisticUpdateTask } from '@/redux/slices/tasksSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from '@phosphor-icons/react';
import { useSearchParams } from 'next/navigation';

export function TodoList({ 
  selectedTaskId, 
  onSelectTask 
}: { 
  selectedTaskId: string | null; 
  onSelectTask: (id: string) => void; 
}) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items);
  const searchQuery = useAppSelector((state) => state.tasks.searchQuery);
  const searchParams = useSearchParams();

  const toggleTaskStatus = (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    
    // Optimistic UI update
    dispatch(optimisticUpdateTask({ id, updates: { status: newStatus } }));
    
    // Background DB sync
    dispatch(updateTaskDb({ id, updates: { status: newStatus } }));
  };

  const view = searchParams.get('view');
  const label = searchParams.get('label');

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      // 1. Search filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // 2. View filter
      if (view === 'archived') {
        // Only show archived tasks in the Archived view
        if (task.status !== 'archived') return false;
      } else {
        // If we are NOT in the archived view, NEVER show archived tasks
        if (task.status === 'archived') return false;
        
        if (view === 'completed') {
          if (task.status !== 'completed') return false;
        } else if (view === 'today') {
          // Today: must have a due date of today, and MUST NOT be completed
          if (task.status === 'completed') return false;
          if (!task.due_date) return false;
          const taskDate = new Date(task.due_date).setHours(0, 0, 0, 0);
          const today = new Date().setHours(0, 0, 0, 0);
          if (taskDate !== today) return false;
        } else if (view === 'upcoming') {
          // Upcoming: must have a due date strictly after today, and MUST NOT be completed
          if (task.status === 'completed') return false;
          if (!task.due_date) return false;
          const taskDate = new Date(task.due_date).setHours(0, 0, 0, 0);
          const today = new Date().setHours(0, 0, 0, 0);
          if (taskDate <= today) return false;
        }
      }

      // 3. Label filter
      if (label === 'high') {
        if (task.priority !== 'high' || task.status === 'completed') return false;
      }
      if (label === 'low') {
        if (task.priority !== 'low' || task.status === 'completed') return false;
      }

      return true;
    });
  }, [tasks, searchQuery, view, label]);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return 0;
  });

  return (
    <div className="w-full h-full">
      <div className="space-y-2">
        <AnimatePresence>
          {sortedTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => onSelectTask(task.id)}
                className={`group flex items-start gap-4 p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedTaskId === task.id ? 'bg-secondary/50 border-border shadow-sm' : 
                  isCompleted ? 'bg-secondary/10 border-transparent opacity-60' : 'bg-background hover:border-primary/30 hover:bg-secondary/20'
                }`}
              >
                <button
                  onClick={(e) => toggleTaskStatus(e, task.id, task.status)}
                  className={`shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                    isCompleted 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-input hover:border-primary text-transparent'
                  }`}
                >
                  <Check weight="bold" className="h-3.5 w-3.5" />
                </button>
                
                <div className="flex-1 space-y-1">
                  <h4 className={`font-medium text-sm transition-all ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {task.description}
                    </p>
                  )}
                </div>
                
                <div className="shrink-0 text-xs text-muted-foreground font-mono">
                  {task.id}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="text-center p-12 border border-dashed rounded-xl text-muted-foreground text-sm">
            No tasks yet. Create one or refresh if loading.
          </div>
        )}
      </div>
    </div>
  );
}
