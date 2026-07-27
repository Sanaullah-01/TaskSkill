'use client';

import * as React from 'react';
import { TodoList } from '@/features/tasks/components/TodoList';
import { TaskActionBar } from '@/features/tasks/components/TaskActionBar';
import { TaskDetailPane } from '@/features/tasks/components/TaskDetailPane';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchTasks } from '@/redux/slices/tasksSlice';
import { AnimatePresence } from 'framer-motion';
import { CircleNotch } from '@phosphor-icons/react';

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const tasks = useAppSelector((state) => state.tasks.items);
  const isLoading = useAppSelector((state) => state.tasks.isLoading);

  React.useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const selectedTask = React.useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-background">
      <TaskActionBar onNewTask={() => setIsModalOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden relative">
        {isLoading && tasks.length === 0 ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <CircleNotch className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : null}
        
        {/* Main List Pane */}
        <div className="flex-1 overflow-y-auto px-6 py-6 border-r border-transparent">
          <TodoList 
            selectedTaskId={selectedTaskId} 
            onSelectTask={setSelectedTaskId} 
          />
        </div>

        {/* Details Pane */}
        <AnimatePresence>
          {selectedTaskId && (
            <TaskDetailPane 
              task={selectedTask as any} 
              onClose={() => setSelectedTaskId(null)} 
            />
          )}
        </AnimatePresence>
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
