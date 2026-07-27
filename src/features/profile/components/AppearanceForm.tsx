'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          onClick={() => setTheme('light')}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-accent hover:text-accent-foreground",
            theme === 'light' ? "border-primary bg-accent" : "border-muted"
          )}
        >
          <Sun className="mb-2 h-6 w-6" />
          <span className="font-medium">Light</span>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-accent hover:text-accent-foreground",
            theme === 'dark' ? "border-primary bg-accent" : "border-muted"
          )}
        >
          <Moon className="mb-2 h-6 w-6" />
          <span className="font-medium">Dark</span>
        </button>
        <button
          onClick={() => setTheme('system')}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-accent hover:text-accent-foreground",
            theme === 'system' ? "border-primary bg-accent" : "border-muted"
          )}
        >
          <Monitor className="mb-2 h-6 w-6" />
          <span className="font-medium">System</span>
        </button>
      </div>
    </div>
  );
}
