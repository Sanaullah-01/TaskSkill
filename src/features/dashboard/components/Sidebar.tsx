'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  SquaresFour, 
  CheckSquareOffset, 
  Gear, 
  SignOut, 
  CalendarBlank, 
  CalendarPlus, 
  CheckCircle, 
  Archive, 
  Tag 
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';

const primaryNav = [
  { name: 'Dashboard', href: '/dashboard', icon: SquaresFour },
  { name: 'All Tasks', href: '/tasks', icon: CheckSquareOffset },
];

const viewNav = [
  { name: 'Today', href: '/tasks?view=today', icon: CalendarBlank },
  { name: 'Upcoming', href: '/tasks?view=upcoming', icon: CalendarPlus },
  { name: 'Completed', href: '/tasks?view=completed', icon: CheckCircle },
  { name: 'Archived', href: '/tasks?view=archived', icon: Archive },
];

const labelNav = [
  { name: 'High Priority', href: '/tasks?label=high', icon: Tag },
  { name: 'Low Priority', href: '/tasks?label=low', icon: Tag },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(logout());
    router.push('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r bg-background flex flex-col z-10">
      <div className="h-14 flex items-center px-6 border-b">
        <span className="font-bold text-lg tracking-tight">TaskSkill</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-8">
          <nav className="space-y-1">
            {primaryNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-secondary text-secondary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" weight={isActive ? "fill" : "regular"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div>
            <h4 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Views
            </h4>
            <nav className="space-y-1">
              {viewNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Labels
            </h4>
            <nav className="space-y-1">
              {labelNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="p-4 border-t space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground w-full transition-colors"
        >
          <Gear className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground w-full transition-colors"
        >
          <SignOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
