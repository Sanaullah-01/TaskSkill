'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { toggleSidebarCollapse, setSidebarOpen } from '@/redux/slices/uiSlice';
import { cn } from '@/lib/utils';
import { LayoutDashboard, CheckCircle2, Calendar, Settings, User, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Tasks', href: '/tasks', icon: CheckCircle2 },
  { name: 'Upcoming', href: '/tasks/upcoming', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { sidebarOpen, sidebarCollapsed } = useSelector((state: RootState) => state.ui);

  const NavLinks = () => (
    <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => dispatch(setSidebarOpen(false))}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              sidebarCollapsed ? "justify-center px-2" : ""
            )}
            title={sidebarCollapsed ? item.name : undefined}
          >
            <item.icon className="h-4 w-4" />
            {!sidebarCollapsed && <span>{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        data-collapsed={sidebarCollapsed}
        className={cn(
          "group hidden border-r bg-muted/40 md:flex md:flex-col transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-[70px]" : "w-64"
        )}
      >
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] justify-between">
          <Link href="/dashboard" className={cn("flex items-center gap-2 font-semibold", sidebarCollapsed && "justify-center w-full")}>
            <CheckCircle2 className="h-6 w-6 text-primary" />
            {!sidebarCollapsed && <span className="tracking-tight">TaskSkill</span>}
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <NavLinks />
        </div>
        <div className="mt-auto p-4 border-t flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => dispatch(toggleSidebarCollapse())}
            className={cn("text-muted-foreground hover:text-foreground", sidebarCollapsed && "w-full flex justify-center")}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={(open) => dispatch(setSidebarOpen(open))}>
        <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
          <SheetHeader className="h-14 flex items-center border-b px-6 justify-center text-left">
            <SheetTitle className="flex items-center gap-2 font-semibold w-full">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <span className="tracking-tight">TaskSkill</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto py-4">
            <NavLinks />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
