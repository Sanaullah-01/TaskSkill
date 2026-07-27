'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const sidebarNavItems = [
  {
    title: 'General',
    href: '/settings/general',
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
  },
  {
    title: 'Security',
    href: '/settings/security',
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="hidden space-y-6 p-10 pb-16 md:block max-w-6xl mx-auto w-full">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sidebarNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "justify-start flex h-9 items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                    isActive
                      ? "bg-muted hover:bg-muted"
                      : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
