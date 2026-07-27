'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskSheet } from '@/features/tasks/components/TaskSheet';

export function QuickAddButton() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50"
    >
      <TaskSheet>
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Task</span>
        </Button>
      </TaskSheet>
    </motion.div>
  );
}
