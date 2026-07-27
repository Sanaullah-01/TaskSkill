'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, ListTodo, Settings, User, LogOut, Loader2, Calendar, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    if (!search || !open) {
      setTasks([]);
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('tasks')
        .select('id, title, status')
        .ilike('title', `%${search}%`)
        .limit(5);
      
      setTasks(data || []);
      setLoading(false);
    };

    const debounce = setTimeout(fetchTasks, 300);
    return () => clearTimeout(debounce);
  }, [search, open]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border rounded-md transition-colors w-full max-w-[240px]"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-start justify-center pt-[20vh]">
          <Command 
            className="w-full max-w-lg border rounded-lg shadow-2xl bg-popover text-popover-foreground overflow-hidden animate-in zoom-in-95 duration-200"
            shouldFilter={false}
          >
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input 
                autoFocus
                placeholder="Search tasks, jump to pages..."
                value={search}
                onValueChange={setSearch}
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
              />
              <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
                ESC
              </button>
            </div>
            
            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
              {loading && (
                <Command.Loading>
                  <div className="py-6 text-center text-sm flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    Searching...
                  </div>
                </Command.Loading>
              )}
              
              {!loading && search && tasks.length === 0 && (
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>
              )}

              {tasks.length > 0 && (
                <Command.Group heading="Tasks" className="px-2 text-xs font-medium text-muted-foreground py-2 [&_[cmdk-group-heading]]:mb-2">
                  {tasks.map((task) => (
                    <Command.Item 
                      key={task.id}
                      onSelect={() => runCommand(() => router.push(`/tasks/${task.id}`))}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <CheckCircle className={`mr-2 h-4 w-4 ${task.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'}`} />
                      {task.title}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              <Command.Group heading="Navigation" className="px-2 text-xs font-medium text-muted-foreground py-2 mt-2 [&_[cmdk-group-heading]]:mb-2">
                <Command.Item 
                  onSelect={() => runCommand(() => router.push('/dashboard'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Dashboard
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push('/tasks'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <ListTodo className="mr-2 h-4 w-4" />
                  All Tasks
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push('/profile'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push('/settings/general'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
