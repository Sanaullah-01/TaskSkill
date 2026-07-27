'use client';

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { toggleSidebar } from '@/redux/slices/uiSlice';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from './ThemeToggle';
import { GlobalSearch } from '@/features/search/components/GlobalSearch';

export function Header() {
  const dispatch = useDispatch();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      
      {/* Right Section: Search, Notifications, User */}
      <div className="flex flex-1 items-center justify-end space-x-4">
        <GlobalSearch />
        
        <nav className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 relative">
            <Bell className="h-[1.2rem] w-[1.2rem]" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-background"></span>
            <span className="sr-only">Notifications</span>
          </Button>
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
