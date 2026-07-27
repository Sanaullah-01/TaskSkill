'use client';

import * as React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TaskForm } from './TaskForm';

interface TaskSheetProps {
  children?: React.ReactNode;
  initialData?: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskSheet({ children, initialData, open, onOpenChange }: TaskSheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      {children && <span onClick={() => handleOpenChange(true)}>{children}</span>}
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{initialData ? 'Edit Task' : 'Create New Task'}</SheetTitle>
          <SheetDescription>
            {initialData 
              ? 'Update the details of this task below.' 
              : 'Fill in the details below to create a new task in your workspace.'}
          </SheetDescription>
        </SheetHeader>
        <TaskForm 
          initialData={initialData} 
          onSuccess={() => handleOpenChange(false)} 
        />
      </SheetContent>
    </Sheet>
  );
}
