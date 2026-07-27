'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, User } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import { useAppSelector } from '@/redux/hooks';
import Link from 'next/link';

export function Header() {
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const user = useAppSelector((state) => state.auth.user);
  
  const [profile, setProfile] = React.useState<{ name: string | null; avatar_url: string | null } | null>(null);

  React.useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile(data);
      }
    }
    loadProfile();
  }, [user?.id, supabase]);

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        
        <Link href="/settings" className="flex items-center gap-2 hover:bg-secondary/80 p-1.5 pr-3 rounded-full transition-colors">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary flex items-center justify-center border">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <span className="text-sm font-medium text-foreground max-w-[120px] truncate hidden sm:block">
            {profile?.name || user?.email?.split('@')[0] || 'User'}
          </span>
        </Link>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Sun className="h-5 w-5 hidden dark:block" />
          <Moon className="h-5 w-5 block dark:hidden" />
        </button>
      </div>
    </header>
  );
}
