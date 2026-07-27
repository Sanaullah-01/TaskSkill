'use client';

import * as React from 'react';
import { MagnifyingGlass, Funnel, SortAscending, List, Plus } from '@phosphor-icons/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setSearchQuery } from '@/redux/slices/tasksSlice';

export function TaskActionBar({ onNewTask }: { onNewTask: () => void }) {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.tasks.searchQuery);

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="h-8 w-full bg-secondary/50 border-transparent focus:bg-background focus:border-primary/30 rounded-md pl-9 pr-3 text-sm transition-all outline-none ring-0"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="h-8 px-3 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors">
          <Funnel className="h-4 w-4" />
          Filter
        </button>
        <button className="h-8 px-3 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors">
          <SortAscending className="h-4 w-4" />
          Sort
        </button>
        <button className="h-8 px-3 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors">
          <List className="h-4 w-4" />
          View
        </button>
        <div className="w-px h-4 bg-border mx-2" />
        <button 
          onClick={onNewTask}
          className="h-8 px-4 flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" weight="bold" />
          New Task
        </button>
      </div>
    </div>
  );
}
